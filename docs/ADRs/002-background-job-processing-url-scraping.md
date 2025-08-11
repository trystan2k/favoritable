# ADR 002: Background Job Processing for URL Scraping

**Date**: 2025-08-11  
**Status**: Proposed  
**Deciders**: Development Team  

## Context

When implementing URL import functionality for bookmark management, we need to use Puppeteer to scrape web pages for metadata extraction. This process can take considerable time (depending on network conditions, page complexity, etc.) and would block the Node.js event loop if executed synchronously, potentially causing:

- API request timeouts to the frontend
- Degraded user experience 
- Server unresponsiveness during scraping operations
- Poor scalability under concurrent requests

We need a solution that allows immediate API responses while handling scraping operations asynchronously in the background.

## Decision

We will implement a **custom SQLite-based job queue with Server-Sent Events (SSE)** for real-time progress updates.

### Architecture Components:
1. **SQLite job queue** - Persistent job storage using existing database
2. **Child process workers** - Isolated Puppeteer scraping processes
3. **EventEmitter-based coordination** - Job status updates and progress tracking
4. **SSE endpoint** - Real-time progress streaming to frontend

## Rationale

### Why This Approach:
- **Zero new dependencies** - Leverages existing SQLite/Drizzle stack
- **Persistent jobs** - Survive server restarts and failures
- **Real-time feedback** - SSE provides immediate progress updates
- **Process isolation** - Child processes prevent main thread blocking
- **Controlled concurrency** - Configurable worker pool size
- **Simple implementation** - Easy to understand, debug, and maintain
- **Migration path** - Can evolve to BullMQ/Redis later if needed

## Alternatives Considered

### 1. Redis-Based Solutions (Bull/BullMQ)
**Pros**: Feature-rich, battle-tested, excellent dashboard, retry logic  
**Cons**: Requires Redis infrastructure, additional dependency, operational overhead  
**Verdict**: Excellent choice but adds complexity for current needs

### 2. Node.js Worker Threads (Raw)
**Pros**: Native Node.js, no dependencies  
**Cons**: Complex lifecycle management, no persistence, poor Puppeteer compatibility  
**Verdict**: Not suitable for browser automation tasks

### 3. Piscina (Worker Thread Pool)
**Pros**: Production-ready thread management, good TypeScript support  
**Cons**: Still worker thread limitations, no job persistence, memory overhead  
**Verdict**: Better than raw threads but not optimal for Puppeteer

### 4. External Services (Inngest)
**Pros**: Serverless, built-in features, excellent developer experience  
**Cons**: External dependency, cost implications, vendor lock-in  
**Verdict**: Great option but introduces service dependency

### 5. Database-Based Alternatives
- **pg-boss** (PostgreSQL): Excellent but requires database migration
- **Agenda** (MongoDB): Feature-rich but adds MongoDB dependency

### 6. In-Memory Solutions
**Pros**: Simple, fast  
**Cons**: No persistence, jobs lost on restart  
**Verdict**: Not suitable for important operations

## Implementation Reference

### Database Schema
```sql
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  data TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  progress INTEGER DEFAULT 0,    -- 0-100 for progress tracking
  result TEXT,                   -- JSON result data
  error TEXT,                    -- Error message if failed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Job Queue Implementation
```javascript
import { EventEmitter } from 'events';
import { fork } from 'child_process';

class JobQueue extends EventEmitter {
  constructor(db) {
    super();
    this.db = db;
    this.processing = new Set();
    this.maxWorkers = 3;
  }

  async addJob(type, data) {
    const jobId = generateId();
    
    await this.db.insert(jobs).values({
      id: jobId,
      type,
      data: JSON.stringify(data),
      status: 'pending'
    });

    // Emit event for SSE
    this.emit('job:created', { jobId, status: 'pending' });
    
    this.processNext();
    return jobId;
  }

  async updateJobStatus(jobId, status, progress = null, result = null, error = null) {
    await this.db.update(jobs)
      .set({ 
        status, 
        progress,
        result: result ? JSON.stringify(result) : null,
        error,
        updated_at: new Date() 
      })
      .where(eq(jobs.id, jobId));

    // Emit for SSE
    this.emit('job:updated', { jobId, status, progress, result, error });
  }

  async processNext() {
    if (this.processing.size >= this.maxWorkers) return;

    const pendingJobs = await this.db.select()
      .from(jobs)
      .where(eq(jobs.status, 'pending'))
      .limit(1);

    if (pendingJobs.length === 0) return;

    const job = pendingJobs[0];
    await this.processJob(job);
  }

  async processJob(job) {
    const { id: jobId, type, data } = job;
    this.processing.add(jobId);

    try {
      await this.updateJobStatus(jobId, 'processing', 0);

      // Fork worker process
      const worker = fork('./workers/scraper-worker.js');
      
      worker.send({ jobId, type, data: JSON.parse(data) });

      worker.on('message', async (message) => {
        const { type: msgType, ...payload } = message;

        switch (msgType) {
          case 'progress':
            await this.updateJobStatus(jobId, 'processing', payload.progress);
            break;
          
          case 'completed':
            await this.updateJobStatus(jobId, 'completed', 100, payload.result);
            this.processing.delete(jobId);
            worker.kill();
            this.processNext(); // Process next job
            break;
          
          case 'error':
            await this.updateJobStatus(jobId, 'failed', null, null, payload.error);
            this.processing.delete(jobId);
            worker.kill();
            this.processNext();
            break;
        }
      });

      worker.on('error', async (error) => {
        await this.updateJobStatus(jobId, 'failed', null, null, error.message);
        this.processing.delete(jobId);
        this.processNext();
      });

    } catch (error) {
      await this.updateJobStatus(jobId, 'failed', null, null, error.message);
      this.processing.delete(jobId);
      this.processNext();
    }
  }
}
```

### SSE Endpoint
```javascript
// SSE endpoint to stream job updates
app.get('/api/jobs/:jobId/stream', async (req, res) => {
  const { jobId } = req.params;

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Send initial job status
  const job = await db.select().from(jobs).where(eq(jobs.id, jobId)).get();
  if (job) {
    res.write(`data: ${JSON.stringify({
      jobId,
      status: job.status,
      progress: job.progress,
      result: job.result ? JSON.parse(job.result) : null
    })}\n\n`);
  }

  // Listen for job updates
  const onJobUpdate = (update) => {
    if (update.jobId === jobId) {
      res.write(`data: ${JSON.stringify(update)}\n\n`);
      
      // Close connection when job is done
      if (update.status === 'completed' || update.status === 'failed') {
        res.end();
      }
    }
  };

  jobQueue.on('job:updated', onJobUpdate);

  // Cleanup on client disconnect
  req.on('close', () => {
    jobQueue.off('job:updated', onJobUpdate);
  });
});
```

### API Endpoint
```javascript
app.post('/api/bookmarks/import', async (req, res) => {
  const { url } = req.body;
  
  try {
    const jobId = await jobQueue.addJob('scrape-url', {
      url,
      bookmarkId: generateId(),
      userId: req.user.id
    });

    res.json({ 
      jobId, 
      streamUrl: `/api/jobs/${jobId}/stream` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Worker Process (scraper-worker.js)
```javascript
import puppeteer from 'puppeteer';

process.on('message', async ({ jobId, type, data }) => {
  if (type === 'scrape-url') {
    try {
      const { url, bookmarkId, userId } = data;
      
      // Send progress updates
      process.send({ type: 'progress', progress: 10 });
      
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      
      process.send({ type: 'progress', progress: 30 });
      
      await page.goto(url, { waitUntil: 'networkidle0' });
      
      process.send({ type: 'progress', progress: 60 });
      
      // Extract metadata
      const metadata = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        image: document.querySelector('meta[property="og:image"]')?.content,
      }));
      
      process.send({ type: 'progress', progress: 90 });
      
      await browser.close();
      
      // Send completion
      process.send({ 
        type: 'completed', 
        result: { 
          bookmarkId, 
          metadata,
          scrapedAt: new Date().toISOString()
        }
      });
      
    } catch (error) {
      process.send({ type: 'error', error: error.message });
    }
  }
});
```

### Frontend Usage
```javascript
// Start scraping
const response = await fetch('/api/bookmarks/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
});

const { jobId, streamUrl } = await response.json();

// Listen to progress via SSE
const eventSource = new EventSource(streamUrl);

eventSource.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  console.log(`Job ${update.jobId}: ${update.status} (${update.progress}%)`);
  
  if (update.status === 'completed') {
    console.log('Scraping completed!', update.result);
    eventSource.close();
  } else if (update.status === 'failed') {
    console.error('Scraping failed:', update.error);
    eventSource.close();
  }
};
```

## Migration Path

If we later need more advanced features, we can migrate to:

1. **BullMQ + Redis** - For high-scale production workloads
2. **Inngest** - For serverless/managed approach  
3. **pg-boss** - If we migrate to PostgreSQL

The current implementation provides a solid foundation that can be extended or replaced as requirements evolve.

## Consequences

### Positive:
- Non-blocking API responses
- Real-time progress feedback
- Persistent job handling
- Simple codebase maintenance
- No external service dependencies
- Cost-effective solution

### Negative:
- Custom implementation requires maintenance
- Limited advanced features compared to specialized tools
- Manual retry logic implementation needed
- No built-in job prioritization

### Neutral:
- Learning curve for SSE implementation
- Additional database table management
- Worker process lifecycle management

## Implementation Tasks

1. Create jobs table in database schema
2. Implement JobQueue class with EventEmitter
3. Create scraper worker process
4. Implement SSE endpoint for progress streaming
5. Update bookmark import API endpoint
6. Add frontend SSE client integration
7. Implement error handling and retry logic
8. Add job cleanup for completed/failed jobs
9. Create monitoring/debugging tools
10. Write comprehensive tests

## Notes

This decision balances simplicity with functionality, providing a robust solution that fits our current architecture while maintaining flexibility for future scaling needs.
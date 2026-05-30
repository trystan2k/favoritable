import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const workspace = process.argv[2];

if (!workspace) {
  throw new Error('Usage: node scripts/linear-backlog-enrich.mjs <workspace-slug>');
}

const tasksPath = path.join(process.cwd(), '.taskmaster/tasks/tasks.json');
const tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8')).master?.tasks ?? [];
const taskById = new Map(tasks.map((task) => [task.id, task]));

const groupedIssues = [
  {
    keep: 'FAV-18',
    keepTaskId: 18,
    title: 'Bookmark Backend Foundation and CRUD',
    absorbs: [16, 17],
  },
  {
    keep: 'FAV-19',
    keepTaskId: 19,
    title: 'Bookmark Creation and Enriched Browsing Experience',
    absorbs: [20, 21, 22, 56],
  },
  {
    keep: 'FAV-23',
    keepTaskId: 23,
    title: 'Bookmark States and Default Collections',
    absorbs: [24, 25, 26, 32],
  },
  {
    keep: 'FAV-27',
    keepTaskId: 27,
    title: 'Labels Management and Bookmark Filtering',
    absorbs: [28, 29, 30, 31],
  },
  {
    keep: 'FAV-33',
    keepTaskId: 33,
    title: 'Bookmark Search and Sort',
    absorbs: [34, 35, 36],
  },
  {
    keep: 'FAV-37',
    keepTaskId: 37,
    title: 'Bookmark Import Pipeline',
    absorbs: [38, 39, 40, 51],
  },
  {
    keep: 'FAV-41',
    keepTaskId: 41,
    title: 'Bookmark Export, Backup, and Bulk Management',
    absorbs: [42, 43, 44],
  },
  {
    keep: 'FAV-45',
    keepTaskId: 45,
    title: 'Application Shell, Theming, Responsiveness, and Accessibility',
    absorbs: [46, 47, 48],
  },
  {
    keep: 'FAV-49',
    keepTaskId: 49,
    title: 'Frontend Architecture and Quality Baseline',
    absorbs: [59, 60],
  },
  {
    keep: 'FAV-53',
    keepTaskId: 53,
    title: 'Production Readiness, Deployment, and Operational Hygiene',
    absorbs: [54, 55, 67],
  },
];

const priorities = {
  'FAV-18': 1,
  'FAV-19': 1,
  'FAV-27': 1,
  'FAV-23': 2,
  'FAV-33': 2,
  'FAV-37': 2,
  'FAV-45': 2,
  'FAV-50': 2,
  'FAV-68': 2,
  'FAV-41': 3,
  'FAV-49': 3,
  'FAV-53': 3,
  'FAV-58': 3,
  'FAV-73': 3,
  'FAV-52': 4,
  'FAV-57': 4,
  'FAV-61': 4,
};

for (const group of groupedIssues) {
  const issue = getIssue(group.keep);
  const description = buildGroupedDescription(issue.description ?? '', group);
  updateIssueDescription(group.keep, description);
  writeLine(`Updated description for ${group.keep}`);
}

for (const [issueId, priority] of Object.entries(priorities)) {
  updateIssuePriority(issueId, priority);
  writeLine(`Updated priority for ${issueId} -> ${priority}`);
}

writeLine('Linear backlog enrichment complete.');

function getIssue(issueId) {
  const response = runLinearJson(
    ['api', '--workspace', workspace, '--variables-json', JSON.stringify({ id: issueId })],
    `query($id: String!) {
      issue(id: $id) {
        identifier
        title
        description
      }
    }`
  );

  const issue = response.data?.issue;

  if (!issue) {
    throw new Error(`Linear issue not found: ${issueId}`);
  }

  return issue;
}

function buildGroupedDescription(existingDescription, group) {
  const baseDescription = existingDescription
    .replace(/\n## Consolidated Scope[\s\S]*$/, '')
    .trimEnd();
  const keepTask = getTask(group.keepTaskId);
  const absorbedTasks = group.absorbs.map((taskId) => getTask(taskId));

  const section = [
    '## Consolidated Scope',
    '',
    `This grouped issue now covers the original scope of Task Master task ${group.keepTaskId} plus the absorbed issues below.`,
    '',
    '### Included Former Issues',
    '',
    ...absorbedTasks.map(
      (task) => `- FAV-${task.id} / TM-${task.id}: ${task.title} — ${task.description}`
    ),
    '',
    '### Delivery Notes',
    '',
    `- Build this as one vertical slice around: ${keepTask.title}.`,
    '- Treat absorbed issues as historical references only; do not reopen them independently.',
    '- Acceptance should include backend, frontend, and UX behavior implied by the absorbed items when applicable.',
  ].join('\n');

  return `${baseDescription}\n\n${section}\n`;
}

function getTask(taskId) {
  const task = taskById.get(taskId);

  if (!task) {
    throw new Error(`Task Master task not found: ${taskId}`);
  }

  return task;
}

function updateIssueDescription(issueId, description) {
  const filePath = path.join(os.tmpdir(), `${issueId.toLowerCase()}-description.md`);
  fs.writeFileSync(filePath, description, 'utf8');

  runLinear(['issue', 'update', issueId, '--workspace', workspace, '--description-file', filePath]);
}

function updateIssuePriority(issueId, priority) {
  runLinear(['issue', 'update', issueId, '--workspace', workspace, '--priority', String(priority)]);
}

function runLinear(args) {
  const result = spawnSync('linear', args, {
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || result.stdout?.trim() || 'Linear command failed');
  }

  return result.stdout;
}

function runLinearJson(args, input) {
  const result = spawnSync('linear', args, {
    encoding: 'utf8',
    input,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || result.stdout?.trim() || 'Linear JSON command failed');
  }

  const response = JSON.parse(result.stdout);

  if (response.errors?.length) {
    throw new Error(response.errors.map((error) => error.message).join('; '));
  }

  return response;
}

function writeLine(message) {
  process.stdout.write(`${message}\n`);
}

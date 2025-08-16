# Multi-stage build for Hono API with Puppeteer support
# Stage 1: Builder - Install dependencies and build the application
FROM node:24-slim AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all packages needed for dependency resolution
COPY packages/ packages/
COPY apps/api/package.json apps/api/

# Install all dependencies (including dev dependencies for building)
RUN pnpm install --frozen-lockfile

# Copy API source code
COPY apps/api/ apps/api/

# Build the application
WORKDIR /app/apps/api
RUN pnpm build

# Stage 2: Production - Create lean runtime image
FROM node:24-slim AS production

# Install system dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    curl \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to skip its own Chromium download
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install pnpm globally
RUN npm install -g pnpm

# Create app user for security
RUN groupadd -r app && useradd -r -g app app

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY --from=builder /app/pnpm-workspace.yaml /app/package.json /app/pnpm-lock.yaml ./

# Copy built application and package.json
COPY --from=builder /app/apps/api/dist/ apps/api/dist/
COPY --from=builder /app/apps/api/package.json apps/api/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Change ownership to app user
RUN chown -R app:app /app

# Switch to non-root user
USER app

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_TYPE=local
ENV LOCAL_DATABASE_URL=file:/app/data/local.db

# Expose port
EXPOSE 3000

# Set working directory to API
WORKDIR /app/apps/api

# Health check
HEALTHCHECK --start-period=15s --interval=300s --retries=3 --timeout=5s \
    CMD curl --fail http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]

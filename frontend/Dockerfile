# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.2.5
FROM oven/bun:${BUN_VERSION} AS base

LABEL fly_launch_runtime="Next.js"

# Next.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ENV NEXT_PUBLIC_API_URL="https://betconverter-backend.onrender.com"
ENV NEXT_PUBLIC_ANALYTICS_URL="https://analytics.betconverter.xyz"
ENV NEXT_PUBLIC_APP_ID="betconverter"
ENV SKIP_ENV_VALIDATION="true"

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Build application
RUN bunx next build

# Start the server by default, this can be overwritten at runtime
EXPOSE 3010
CMD [ "bun", "run", "start" ]

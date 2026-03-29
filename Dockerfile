# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# These NEXT_PUBLIC_ vars are only used by the server client (via API routes).
# The browser client is not used — all frontend calls go through /api/ routes.
# Set placeholder values so the build succeeds.
ENV NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder

RUN npm run build

# Stage 3: Production runner with FFmpeg
FROM node:20-alpine AS runner
WORKDIR /app

# Install FFmpeg
RUN apk add --no-cache ffmpeg

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create storage directories
RUN mkdir -p storage/backgrounds storage/output

# Render sets PORT automatically (usually 10000)
EXPOSE 10000

CMD ["node", "server.js"]

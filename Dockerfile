# Base image with Node.js 20 (Alpine)
FROM node:20-alpine AS base

# Install openssl and libc6-compat, which are required by Prisma and other binaries on Alpine
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies using clean install (skip scripts to avoid postinstall failures before code is copied)
RUN npm ci --ignore-scripts

# Copy the rest of the application source code
COPY . .

# Generate the Prisma client now that all files are copied
RUN npx prisma generate


# Expose ports: Next.js dev server (3000) and Prisma Studio (5555)
EXPOSE 3000 5555

# Default command starts Next.js in development mode
CMD ["npm", "run", "dev"]

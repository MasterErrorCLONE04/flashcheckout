# Base image with Node.js 20 (Alpine)
FROM node:20-alpine AS base

# Install openssl, libc6-compat, python3, py3-pip, and git
RUN apk add --no-cache libc6-compat openssl python3 py3-pip git

# Install tiktoken (using --break-system-packages for Alpine Python environment compliance)
RUN pip3 install --no-cache-dir --break-system-packages tiktoken

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

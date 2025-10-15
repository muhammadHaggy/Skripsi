FROM node:lts-alpine

WORKDIR /app

ENV NODE_ENV=development
ENV HOST=0.0.0.0

# Install dependencies with better caching
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy application sources (excluding items in .dockerignore)
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
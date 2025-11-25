FROM node:lts-alpine

WORKDIR /app

ARG REACT_APP_BACKEND_URL
ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
# Install dependencies with better caching
COPY package*.json ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# Copy application sources (excluding items in .dockerignore)
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
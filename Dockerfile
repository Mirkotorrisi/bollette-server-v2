# Building layer
FROM node:16-alpine as development

WORKDIR /app

COPY .env .env

RUN echo "Going to deploy DEVELOPMENT"

# Copy configuration files
COPY tsconfig*.json ./
COPY package*.json ./

RUN echo "Should install nest globally DEVELOPMENT"

RUN npm install -g @nestjs/cli

# Install dependencies from package-lock.json, see https://docs.npmjs.com/cli/v7/commands/npm-ci
RUN npm ci

# Copy application sources (.ts, .tsx, js)
COPY . .

# Build application (produces dist/ folder)
RUN npm run build

# Runtime (production) layer
FROM node:16-alpine as production


WORKDIR /app

RUN echo "Going to deploy PROD"

COPY --from=development /app/.env .env
# Copy dependencies files
COPY package*.json ./

RUN echo "Should install nest globally PROD"

RUN npm install -g @nestjs/cli

# Install runtime dependecies (without dev/test dependecies)
RUN npm ci --omit=dev

# Copy production build
COPY --from=development /app/dist/ ./dist/

# Expose application port
EXPOSE 8080

# Start application
CMD [ "node", "dist/main.js" ]
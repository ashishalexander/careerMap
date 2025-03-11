FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose the port your app runs on
EXPOSE 8080

# Command to run the app
CMD ["node", "dist/server.js"]
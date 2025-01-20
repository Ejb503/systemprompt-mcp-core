# Start with a Node.js base image
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire source directory
COPY src ./src

# Build the project
RUN npm run build

# Start a new stage from the same Node.js image for the final build
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy the built files from the previous stage
COPY --from=builder /app/build ./build

# Copy package.json and package-lock.json to ensure consistency in the final image
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Specify the API key as an environment variable
ENV SYSTEMPROMPT_API_KEY=YOUR_API_KEY_HERE

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["node", "build/index.js"]
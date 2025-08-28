# Use the official Node.js 24 runtime as base image
FROM node:24-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the rest of the application code
COPY . .

# Create non-root user for security
RUN useradd -r -u 1001 -g root mocoa
USER mocoa

# Expose the port that the app runs on
EXPOSE 8080

# Define the command to run the application
CMD ["npm", "start"]

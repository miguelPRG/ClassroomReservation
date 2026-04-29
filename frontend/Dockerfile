# Use a lightweight Node.js image for production
FROM node:24-alpine

# Set environment to production
ENV NODE_ENV=production

# Define a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory
WORKDIR /app

# Copy package files and install all dependencies
COPY package.json package-lock.json ./
RUN npm install

# Build the application for production
COPY . .
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Change ownership of the application files to the non-root user
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose the port the application will run on
EXPOSE 80

# Command to run the application
CMD ["npm", "start"]

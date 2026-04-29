# Use a lightweight Python image for production
FROM python:3.14-slim

# Set environment to production
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

# Define a non-root user and group
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Set the working directory
WORKDIR /app

# Copy dependency files and install dependencies
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --no-dev

# Copy the rest of the application code
COPY . .

# Change ownership of the application files to the non-root user
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose the port the application will run on
EXPOSE 8000

# Command to run the application
CMD ["fastapi", "run"]

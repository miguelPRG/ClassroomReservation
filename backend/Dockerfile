# Use a lightweight Python image for production
FROM python:3.14-slim

# Set environment to production
ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    UV_CACHE_DIR=/tmp/.uv_cache

# Define a non-root user and group
RUN groupadd -r appgroup && useradd -r -g appgroup -m appuser

# Set the working directory
WORKDIR /app

# Instalar o uv globalmente como root
RUN pip install --no-cache-dir uv

# Mudar o dono da pasta /app antes de instalar as dependências
RUN chown appuser:appgroup /app

# Switch to the non-root user ANTES do uv sync
USER appuser

# Copiar arquivos de dependências
COPY --chown=appuser:appgroup pyproject.toml uv.lock ./

# Instalar dependências como appuser (isso cria o .venv dentro de /app)
RUN uv sync --no-dev

# Copy the rest of the application code
COPY --chown=appuser:appgroup . .

# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["uv", "run", "fastapi", "run", "main.py", "--host", "0.0.0.0", "--port", "8000"]
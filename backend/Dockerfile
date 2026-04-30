# Use uma imagem Python leve para produção
FROM python:3.14-slim

# Define o ambiente para produção
ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    UV_CACHE_DIR=/tmp/.uv_cache

# Define um usuário e grupo não root
RUN groupadd -r appgroup && useradd -r -g appgroup -m appuser

# Define o diretório de trabalho
WORKDIR /app

# Instala o uv globalmente como root
RUN pip install --no-cache-dir uv

# Altera o dono da pasta /app antes de instalar as dependências
RUN chown appuser:appgroup /app

# Alterna para o usuário não root ANTES do uv sync
USER appuser

# Copia os arquivos de dependências 
COPY pyproject.toml uv.lock ./

# Instala as dependências como appuser (isso cria o .venv dentro de /app)
RUN uv sync --no-dev

# Copia o restante do código da aplicação
COPY . .

# Expõe a porta
EXPOSE 8000

# Comando para executar a aplicação
CMD ["uv", "run", "fastapi", "run", "main.py", "--host", "0.0.0.0", "--port", "8000"]
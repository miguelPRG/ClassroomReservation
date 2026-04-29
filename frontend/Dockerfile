# Etapa 1: Build (Node.js)
FROM node:24-alpine AS build
WORKDIR /app

# Copia arquivos de dependências
COPY package.json package-lock.json ./
RUN npm ci  # 'npm ci' é mais rápido e seguro para builds automatizados

# Copia o código e gera a build
COPY . .

# Build com variáveis de produção
ENV NODE_ENV=production
ENV VITE_API_URL=/api
RUN npm run build

# Remove dependências de desenvolvimento para a imagem final
RUN npm prune --production  # Remove dependências de desenvolvimento para a imagem final

# ---
# Etapa 2: Produção (Nginx)
# ---
FROM nginx:alpine

# 1. Prepara as permissões para o usuário nginx
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx

# 2. Copia a configuração customizada do Nginx (sem a diretiva "user")
COPY nginx.conf /etc/nginx/nginx.conf

# 3. Copia os arquivos da build para o diretório do Nginx
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

# 4. Mudar para o usuário não-root (nginx)
USER nginx

# Expor a porta
EXPOSE 8080

# O comando para rodar o Nginx
CMD ["nginx", "-g", "daemon off;"]
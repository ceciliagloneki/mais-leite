# Imagem do painel +Leite (Next.js 14).
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# A URL da API entra no build do Next.js (variável NEXT_PUBLIC_*).
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]

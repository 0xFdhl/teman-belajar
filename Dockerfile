FROM node:20

WORKDIR /app

COPY backend/package*.json backend/
RUN npm --prefix backend ci

COPY frontend/package*.json frontend/
RUN npm --prefix frontend ci

COPY backend backend
COPY frontend frontend

RUN npm --prefix frontend run build

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "backend/server.js"]
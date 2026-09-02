FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
ENV DEMO_MODE=true PORT=3000 AI_SERVICE_URL=http://ai-service:8000
CMD ["node","dist/main.js"]

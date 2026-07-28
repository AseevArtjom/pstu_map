# 1. Этап сборки (Build Stage)
FROM node:22-alpine AS builder

WORKDIR /app

# Копируем манифесты зависимостей обоих приложений
COPY main/package*.json ./main/
COPY admin-panel/package*.json ./admin-panel/

# Устанавливаем зависимости отдельно для каждого проекта
RUN cd main && npm install
RUN cd admin-panel && npm install

# Копируем весь исходный код (включая shared-frontend, если он есть)
COPY . .

# Собираем оба приложения
RUN cd main && npm run build
RUN cd admin-panel && npm run build

# 2. Этап раздачи через Nginx (Production Stage)
FROM nginx:alpine

# Копируем собранную статику
COPY --from=builder /app/main/dist /usr/share/nginx/html
COPY --from=builder /app/admin-panel/dist /usr/share/nginx/html/admin

# Копируем конфигурацию Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
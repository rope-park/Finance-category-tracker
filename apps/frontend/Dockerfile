# Finance Tracker Frontend - CDN ready asset으로 프로덕션 최적화
FROM node:22-bookworm-slim AS builder

# 메타데이터
LABEL maintainer="Finance Tracker Team"
LABEL description="Finance Tracker Frontend - Production Ready with Performance Optimizations"
LABEL version="1.0.0"

WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apt/lists/*

# 워크스페이스 루트 + 하위 패키지의 package.json / lockfile만 먼저 복사해서 의존성 캐시 최적화
COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/

# ✅ npm ci (workspaces)로 정확히 설치
# BuildKit 캐시 사용 시: --mount=type=cache,target=/root/.npm
RUN npm ci --workspaces

# 소스 복사
COPY tsconfig.json ./
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend

# 환경 변수 (메모리 여유)
ENV NODE_OPTIONS="--max-old-space-size=2048"

# 프론트 빌드 (workspace 지정)
RUN npm run build --workspace @finance-tracker/frontend

# 프로덕션 Nginx 스테이지
FROM nginx:1.28-alpine3.19 AS production

# 보안 업데이트 및 취약점 패치
RUN apk update && apk upgrade --available && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

# non-root 사용자로 실행하기 위한 설정
RUN addgroup -g 1001 -S nginx-group && \
    adduser -S nginx-user -u 1001 -G nginx-group

# Nginx 설정 디렉토리 권한 변경
RUN mkdir -p /var/cache/nginx /var/run/nginx && \
    chown -R nginx-user:nginx-group /var/cache/nginx /var/run/nginx /etc/nginx

# 최적화된 Nginx 설정 파일 복사
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 애플리케이션 복사
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# 권한 설정
RUN chown -R nginx-user:nginx-group /usr/share/nginx/html

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# 포트 노출
EXPOSE 80

# Nginx 시작 (root로 실행하여 권한 문제 해결)
CMD ["nginx", "-g", "daemon off;"]

# Finance Tracker Backend - TypeScript 직접 실행
FROM node:22-alpine

WORKDIR /app

# 시스템 의존성 설치
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init python3 make g++ curl && \
    rm -rf /var/cache/apk/*

# non-root 사용자 생성
RUN addgroup -g 1001 -S nodejs && \
    adduser -S finance-tracker -u 1001

# 백엔드 package.json 복사
COPY apps/backend/package.json ./
COPY packages/shared/package.json ./packages/shared/

# 의존성 설치 (개발 의존성 포함)
RUN npm install date-fns && \
    npm install && \
    npm install -g ts-node typescript && \
    npm cache clean --force

# 프로젝트 구조를 모노레포 형태로 복사
COPY apps/backend/src ./src
COPY packages/shared ./packages/shared
COPY apps/backend/tsconfig.json ./

# Docker용 tsconfig.json 생성 (경로 수정)
RUN sed 's|"@finance-tracker/shared": \["../../packages/shared/src"\]|"@finance-tracker/shared": ["./packages/shared/src"]|g' tsconfig.json > tsconfig.docker.json

# 경로 문제 해결을 위해 심볼릭 링크 생성
RUN rm -rf /app/node_modules/@finance-tracker/shared && \
    ln -s /app/packages/shared/src /app/node_modules/@finance-tracker/shared

# 로그 및 데이터 디렉토리 생성
RUN mkdir -p /app/logs /app/data && \
    chown -R finance-tracker:nodejs /app

# non-root 사용자로 전환
USER finance-tracker

# 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=3001
ENV NODE_OPTIONS="--max-old-space-size=1024"
ENV TS_NODE_PROJECT=tsconfig.docker.json

# 포트 노출
EXPOSE 3001

# 프로세스 초기화 도구 사용
ENTRYPOINT ["dumb-init", "--"]

# TypeScript 파일을 직접 실행
CMD ["ts-node", "-P", "tsconfig.docker.json", "src/server.ts"]
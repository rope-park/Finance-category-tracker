#!/bin/bash

# Finance Tracker API 서버 시작 스크립트
echo "🚀 Finance Tracker API 서버를 시작합니다..."

# 포트 3001을 사용하는 프로세스 확인 및 종료
PORT=3001
PID=$(lsof -ti:$PORT 2>/dev/null)

if [ ! -z "$PID" ]; then
    echo "⚠️  포트 $PORT를 사용하는 프로세스(PID: $PID)를 발견했습니다."
    echo "🔄 기존 프로세스를 종료합니다..."
    kill -9 $PID 2>/dev/null
    sleep 2
    echo "✅ 기존 프로세스가 종료되었습니다."
fi

# 백엔드 디렉토리로 이동
cd "$(dirname "$0")"

# 의존성 설치 확인
if [ ! -d "node_modules" ]; then
    echo "📦 의존성을 설치합니다..."
    npm install
fi

# TypeScript 빌드
echo "🔨 TypeScript를 빌드합니다..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 빌드가 완료되었습니다."
    
    # 서버 시작
    echo "🚀 서버를 포트 $PORT에서 시작합니다..."
    PORT=$PORT npm start
else
    echo "❌ 빌드에 실패했습니다."
    exit 1
fi

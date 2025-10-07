#!/bin/bash

#===============================================================================
# Finance Tracker API 서버 시작 스크립트
#
# 개발 환경에서 백엔드 API 서버를 안전하게 시작하는 스크립트.
# 기존 프로세스 종료, 의존성 설치, 빌드, 서버 실행을 자동화함.
#
# 주요 기능:
# - 포트 충돌 방지를 위한 기존 프로세스 종료
# - 의존성 자동 설치 확인
# - TypeScript 빌드 실행
# - 개발 서버 시작
# - 에러 핸들링 및 로깅
#
# 사용법: ./start-server.sh
# @author Ju Eul Park (rope-park)
#===============================================================================

echo "🚀 Finance Tracker API 서버를 시작합니다..."

# 서버에서 사용할 포트 번호 설정
PORT=3001

# 포트 3001을 사용하는 기존 프로세스 확인
PID=$(lsof -ti:$PORT 2>/dev/null)

# 기존 프로세스가 있으면 안전하게 종료
if [ ! -z "$PID" ]; then
    echo "⚠️  포트 $PORT를 사용하는 프로세스(PID: $PID)를 발견했습니다."
    echo "🔄 기존 프로세스를 종료합니다..."
    kill -9 $PID 2>/dev/null
    sleep 2
    echo "✅ 기존 프로세스가 종료되었습니다."
fi

# 백엔드 디렉토리로 이동 (스크립트 위치 기준)
cd "$(dirname "$0")"

# Node.js 의존성 설치 상태 확인
if [ ! -d "node_modules" ]; then
    echo "📦 의존성을 설치합니다..."
    npm install
fi

# TypeScript 소스 코드를 JavaScript로 빌드
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

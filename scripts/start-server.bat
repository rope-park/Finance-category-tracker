@echo off
echo 🚀 Finance Tracker API 서버를 시작합니다...

REM 포트 3001을 사용하는 프로세스 확인 및 종료
set PORT=3001

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT%') do (
    echo ⚠️  포트 %PORT%를 사용하는 프로세스(PID: %%a)를 발견했습니다.
    echo 🔄 기존 프로세스를 종료합니다...
    taskkill /PID %%a /F >nul 2>&1
    timeout /t 2 >nul
    echo ✅ 기존 프로세스가 종료되었습니다.
)

REM 백엔드 디렉토리로 이동
cd /d "%~dp0\..\apps\backend"

REM 의존성 설치 확인
if not exist "node_modules" (
    echo 📦 의존성을 설치합니다...
    npm install
)

REM TypeScript 빌드
echo 🔨 TypeScript를 빌드합니다...
npm run build

if %errorlevel% equ 0 (
    echo ✅ 빌드가 완료되었습니다.
    echo 🚀 서버를 포트 %PORT%에서 시작합니다...
    set PORT=%PORT%
    npm start
) else (
    echo ❌ 빌드에 실패했습니다.
    pause
    exit /b 1
)

pause

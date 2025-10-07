@echo off
REM ===============================================================================
REM Finance Tracker API 서버 시작 스크립트 (Windows용)
REM
REM Windows 환경에서 백엔드 API 서버를 안전하게 시작하는 배치 스크립트.
REM Linux/Mac의 start-server.sh와 동일한 기능을 Windows에서 제공함.
REM
REM 주요 기능:
REM - 포트 충돌 방지를 위한 기존 프로세스 종료
REM - 의존성 자동 설치 확인
REM - TypeScript 빌드 실행
REM - 개발 서버 시작
REM - Windows 명령어를 사용한 에러 핸들링
REM
REM 사용법: start-server.bat
REM @author Ju Eul Park (rope-park)
REM ===============================================================================

echo 🚀 Finance Tracker API 서버를 시작합니다...

REM 서버에서 사용할 포트 번호 설정
set PORT=3001

REM Windows에서 특정 포트를 사용하는 프로세스 찾아서 종료
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT%') do (
    echo ⚠️  포트 %PORT%를 사용하는 프로세스(PID: %%a)를 발견했습니다.
    echo 🔄 기존 프로세스를 종료합니다...
    taskkill /PID %%a /F >nul 2>&1
    timeout /t 2 >nul
    echo ✅ 기존 프로세스가 종료되었습니다.
)

REM 백엔드 디렉토리로 이동 (배치 파일 위치 기준)
cd /d "%~dp0\..\apps\backend"

REM Node.js 의존성 설치 상태 확인
if not exist "node_modules" (
    echo 📦 의존성을 설치합니다...
    npm install
)

REM TypeScript 소스 코드를 JavaScript로 빌드
echo 🔨 TypeScript를 빌드합니다...
npm run build

REM 빌드 성공 여부 확인
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

# 🗄️ 데이터베이스 스크립트

데이터베이스 초기화, 테스트 데이터 생성용 SQL 스크립트들

## 📜 스크립트 목록

### create-test-users.sql
테스트용 사용자 계정 생성

### add-test-users.sql  
기존 데이터베이스에 테스트 사용자 추가

### budgets_and_goals.sql
예산 및 목표 샘플 데이터 생성

### realistic_transactions.sql
현실적인 거래 내역 샘플 데이터

### comprehensive_mock_data.sql
전체적인 목업 데이터 (사용자, 거래, 예산 등 포함)

## 🚀 사용법

```bash
# PostgreSQL에서 실행
psql -U username -d database_name -f scripts/database/script_name.sql

# 또는 Docker 컨테이너에서
docker exec -i postgres_container psql -U username -d database_name < scripts/database/script_name.sql
```

## ⚠️ 주의사항

- **개발 환경에서만 사용**하세요
- 프로덕션 데이터를 덮어쓸 수 있습니다
- 실행 전 데이터베이스 백업을 권장합니다
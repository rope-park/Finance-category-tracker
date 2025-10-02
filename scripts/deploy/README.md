# 🚀 배포 스크립트

프로덕션 배포 및 백업/복원 관련 스크립트들

## 📜 스크립트 목록

### deploy-production.sh
프로덕션 환경 배포 스크립트

**사용법:**
```bash
cd scripts/deploy
./deploy-production.sh
```

### backup-restore.sh
데이터베이스 백업 및 복원 스크립트

**백업:**
```bash
./backup-restore.sh backup
```

**복원:**
```bash
./backup-restore.sh restore backup_file.sql
```

## ⚠️ 주의사항

- **프로덕션 환경**에서 실행됩니다
- 실행 전 반드시 백업을 생성하세요
- 권한이 필요할 수 있습니다 (`sudo` 또는 관리자 권한)
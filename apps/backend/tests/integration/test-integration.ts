// 통합 Import 테스트
import { 
  // Auth 모듈
  
  // Services
  UserService,
  BudgetService,
  AnalyticsService,
  
  // Repositories
  UserRepository,
  TransactionRepository,
  BudgetRepository,
  AnalyticsRepository,
  
  // Social 모듈 (placeholder)
  SocialController,
  SocialService,
  SocialRepository,
  
  // Core & Shared 모듈
  logger
} from '../../index';

console.log('✅ 통합 Import 테스트 성공!');
console.log('사용 가능한 모듈들:');
console.log('- Services:', { UserService, BudgetService, AnalyticsService });
console.log('- Repositories:', { UserRepository, TransactionRepository, BudgetRepository, AnalyticsRepository });
console.log('- Social:', { SocialController, SocialService, SocialRepository });
console.log('- Utilities:', { logger });

export {};
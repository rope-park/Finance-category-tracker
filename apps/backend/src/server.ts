import goalRoutes from './routes/goal';
import express from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';
import csurf from 'csurf';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import { testConnection } from './config/database';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { 
  securityHeaders, 
  sanitizeRequestBody, 
  sanitizeQueryParams,
  securityLogger,
  generateCSRFToken 
} from './middleware/security';

// 라우트 import
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import transactionRoutes from './routes/transactions';
import budgetRoutes from './routes/budgets';
import categoryRoutes from './routes/categories';

import analyticsRoutes from './routes/analytics';
import predictionRoutes from './routes/prediction';

dotenv.config();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 목표 관리 라우트
app.use('/api', goalRoutes);

// 세션 설정 (CSRF 토큰용)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-default-session-secret',
  saveUninitialized: false,
  resave: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));


// 보안 헤더 및 XSS 방지
app.use(helmet());
app.use(xss());
app.use(securityHeaders);

// CSRF 보호 (API 예외 처리 포함)
app.use(
  csurf({
    cookie: false,
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    value: (req: any) => req.headers['x-csrf-token'] || req.body?._csrf || ''
  }) as unknown as express.RequestHandler
);
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ success: false, error: 'CSRF token invalid or missing' });
  }
  next(err);
});

// CORS 설정
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
}));

// 로깅 미들웨어
app.use(morgan('combined'));

// Body parser 미들웨어
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 보안 미들웨어
app.use(securityLogger);
app.use(sanitizeQueryParams);
app.use(sanitizeRequestBody);


// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`🔄 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    console.log('📝 Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// 예측 분석 라우트
app.use('/api', predictionRoutes);

// 헬스체크 라우트
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({ 
      status: 'OK', 
      message: '서버가 정상 작동중입니다.',
      database: dbConnected ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString(),
      port: PORT
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// CSRF 토큰 생성 엔드포인트
app.get('/api/csrf-token', (req, res) => {
  const token = generateCSRFToken();
  req.session!.csrfToken = token;
  
  res.json({
    success: true,
    data: { csrfToken: token },
    message: 'CSRF 토큰이 생성되었습니다.'
  });
});

// API 라우트에 rate limiting 적용
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 핸들러
app.use(notFoundHandler);

// 글로벌 에러 핸들러
app.use(globalErrorHandler);

// 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 연결 테스트
    await testConnection();
    
    // 테스트 환경에서는 서버를 시작하지 않음
    if (process.env.NODE_ENV === 'test') {
      console.log('🧪 Test environment detected - server not started');
      return;
    }
    
    app.listen(PORT, () => {
      console.log('\n🚀 ========================================');
      console.log('🚀 Finance Tracker API Server Started!');
      console.log('🚀 ========================================');
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`📊 API endpoints: http://localhost:${PORT}/api`);
      console.log(`💓 Health check: http://localhost:${PORT}/api/health`);
      console.log('🚀 ========================================\n');
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

// 테스트 환경이 아닐 때만 서버 시작
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;

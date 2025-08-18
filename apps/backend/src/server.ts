import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection } from './config/database';

// 라우트 import
// import authRoutes from './routes/auth';
// import userRoutes from './routes/users';
// import transactionRoutes from './routes/transactions';
// import budgetRoutes from './routes/budgets';
// import categoryRoutes from './routes/categories';

dotenv.config();

const app = express();

// 미들웨어
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 라우트
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/transactions', transactionRoutes);
// app.use('/api/budgets', budgetRoutes);
// app.use('/api/categories', categoryRoutes);

// 헬스체크
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({ 
    status: 'OK', 
    message: '서버가 정상 작동중입니다.',
    database: dbConnected ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// 404 에러 핸들링
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `경로를 찾을 수 없습니다: ${req.originalUrl}`
  });
});

// 에러 핸들링 미들웨어
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('서버 오류:', err.stack);
  res.status(500).json({
    success: false,
    error: '서버 내부 오류가 발생했습니다.'
  });
});

const PORT = process.env.PORT || 3001;

// 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 연결 테스트
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ 데이터베이스 연결 실패. 서버를 시작할 수 없습니다.');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}에서 실행중입니다.`);
      console.log(`📱 프론트엔드: ${process.env.FRONTEND_URL}`);
      console.log(`🗄️  데이터베이스: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
      console.log(`🔗 API 엔드포인트: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

startServer();

export default app; 

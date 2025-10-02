// 교육 콘텐츠 타입
export interface EducationContent {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  tags: string[];
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// 사용자 교육 진행 상황
export interface UserEducationProgress {
  id: number;
  userId: number;
  contentId: number;
  completionRate: number;
  timeSpentMinutes: number;
  quizScore?: number;
  isCompleted: boolean;
  notes?: string;
  lastAccessedAt: string;
  completedAt?: string;
}

// 재정 건강도 점수
export interface FinancialHealthScore {
  id: number;
  userId: number;
  overallScore: number;
  budgetingScore: number;
  savingScore: number;
  debtScore: number;
  investmentScore: number;
  emergencyFundScore: number;
  calculationDate: string;
  factorsAnalysis: Record<string, unknown>;
  recommendations: string[];
  createdAt: string;
}

// 절약 팁
export interface SavingTip {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  potentialSavings: number;
  implementationSteps: string[];
  tags: string[];
  isPersonalized: boolean;
  createdAt: string;
}

// 개인화된 조언
export interface PersonalizedAdvice {
  id: number;
  userId: number;
  adviceType: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  basedOn: Record<string, unknown>;
  isRead: boolean;
  isDismissed: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 교육 대시보드 데이터
export interface EducationDashboard {
  summary: {
    totalContentCompleted: number;
    totalTimeSpent: number;
    currentStreak: number;
    averageQuizScore: number;
  };
  healthScore: FinancialHealthScore;
  recentAdvice: PersonalizedAdvice[];
  featuredContent: EducationContent[];
  personalizedTips: SavingTip[];
  lastUpdated: string;
}

// API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

// 교육 콘텐츠 필터
export interface EducationContentFilter {
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  page?: number;
  limit?: number;
  search?: string;
}

// 진행 상황 업데이트 데이터
export interface ProgressUpdateData {
  completionRate: number;
  timeSpentMinutes?: number;
  quizScore?: number;
  isCompleted?: boolean;
  notes?: string;
}

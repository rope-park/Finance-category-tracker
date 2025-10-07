/**
 * 교육 관련 타입 정의
 */

// 교육 콘텐츠 타입
export interface EducationContent {
  id: number;                                          // 고유 ID
  title: string;                                       // 제목
  description: string;                                 // 설명
  content: string;                                     // 콘텐츠 내용
  category: string;                                    // 카테고리
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // 난이도
  estimatedDuration: number;                           // 예상 소요 시간(분)
  tags: string[];                                      // 태그 목록
  isFeatured: boolean;                                 // 추천 콘텐츠 여부
  viewCount: number;                                   // 조회수
  createdAt: string;                                   // 생성일
  updatedAt: string;                                   // 수정일
}

// 사용자 교육 진행 상황
export interface UserEducationProgress {
  id: number;                // 고유 ID
  userId: number;            // 사용자 ID
  contentId: number;         // 콘텐츠 ID
  completionRate: number;    // 완료율(%)
  timeSpentMinutes: number;  // 학습 시간(분)
  quizScore?: number;        // 퀴즈 점수
  isCompleted: boolean;      // 완료 여부
  notes?: string;            // 메모
  lastAccessedAt: string;    // 마지막 접근일
  completedAt?: string;      // 완료일
}

// 재정 건강도 점수
export interface FinancialHealthScore {
  id: number;                               // 고유 ID
  userId: number;                           // 사용자 ID
  overallScore: number;                     // 전체 점수
  budgetingScore: number;                   // 예산 관리 점수
  savingScore: number;                      // 저축 점수
  debtScore: number;                        // 부채 관리 점수
  investmentScore: number;                  // 투자 점수
  emergencyFundScore: number;               // 비상금 점수
  calculationDate: string;                  // 계산일
  factorsAnalysis: Record<string, unknown>; // 요인 분석
  recommendations: string[];                // 추천 사항
  createdAt: string;                        // 생성일
}

// 절약 팁
export interface SavingTip {
  id: number;                                          // 고유 ID
  title: string;                                       // 제목
  description: string;                                 // 설명
  category: string;                                    // 카테고리
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // 난이도
  potentialSavings: number;                            // 예상 절약 금액
  implementationSteps: string[];                       // 실행 단계
  tags: string[];                                      // 태그
  isPersonalized: boolean;                             // 개인화 여부
  createdAt: string;                                   // 생성일
}

// 개인화된 조언
export interface PersonalizedAdvice {
  id: number;                        // 고유 ID
  userId: number;                    // 사용자 ID
  adviceType: string;                // 조언 타입
  title: string;                     // 제목
  content: string;                   // 내용
  priority: 'low' | 'medium' | 'high'; // 우선순위
  basedOn: Record<string, unknown>;  // 근거 데이터
  isRead: boolean;                   // 읽음 여부
  isDismissed: boolean;              // 무시 여부
  expiresAt?: string;                // 만료일
  createdAt: string;                 // 생성일
  updatedAt: string;                 // 수정일
}

// 교육 대시보드 데이터
export interface EducationDashboard {
  summary: {                         // 요약 정보
    totalContentCompleted: number;   // 완료된 콘텐츠 수
    totalTimeSpent: number;          // 총 학습 시간
    currentStreak: number;           // 현재 연속 학습 일수
    averageQuizScore: number;        // 평균 퀴즈 점수
  };
  healthScore: FinancialHealthScore; // 재정 건강도
  recentAdvice: PersonalizedAdvice[]; // 최근 조언
  featuredContent: EducationContent[]; // 추천 콘텐츠
  personalizedTips: SavingTip[];     // 개인화 팁
  lastUpdated: string;               // 마지막 업데이트
}

// API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;    // 성공 여부
  message: string;     // 메시지
  data?: T;            // 응답 데이터
  error?: string;      // 에러 메시지
  timestamp?: string;  // 시간
}

// 교육 콘텐츠 필터
export interface EducationContentFilter {
  category?: string;                                   // 카테고리
  difficulty?: 'beginner' | 'intermediate' | 'advanced'; // 난이도
  page?: number;                                       // 페이지 번호
  limit?: number;                                      // 페이지당 개수
  search?: string;                                     // 검색어
}

// 진행 상황 업데이트 데이터
export interface ProgressUpdateData {
  completionRate: number;     // 완료율
  timeSpentMinutes?: number;  // 학습 시간
  quizScore?: number;         // 퀴즈 점수
  isCompleted?: boolean;      // 완료 여부
  notes?: string;             // 메모
}

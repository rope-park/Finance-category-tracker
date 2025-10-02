import type {
  EducationContent,
  UserEducationProgress,
  FinancialHealthScore,
  SavingTip,
  PersonalizedAdvice,
  EducationDashboard,
  ApiResponse,
  EducationContentFilter,
  ProgressUpdateData
} from '../../../shared/types/education';

// TODO: API_BASE_URL은 실제 API 구현 시 사용될 예정
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 모킹 데이터
const mockEducationContent: EducationContent[] = [
  {
    id: 1,
    title: "예산 관리의 기초",
    description: "효과적인 예산 관리 방법을 배우고 재정 목표를 달성하는 방법을 알아보세요.",
    content: "예산 관리는 개인 재정 관리의 핵심입니다...",
    category: "예산 관리",
    difficulty: "beginner",
    estimatedDuration: 15,
    tags: ["예산", "기초", "재정관리"],
    isFeatured: true,
    viewCount: 1250,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01"
  },
  {
    id: 2,
    title: "비상금 마련하기",
    description: "예상치 못한 상황에 대비한 비상금을 효과적으로 모으는 전략을 배워보세요.",
    content: "비상금은 예상치 못한 지출에 대비하는 중요한 안전망입니다...",
    category: "저축",
    difficulty: "beginner",
    estimatedDuration: 20,
    tags: ["비상금", "저축", "안전망"],
    isFeatured: true,
    viewCount: 980,
    createdAt: "2024-01-02",
    updatedAt: "2024-01-02"
  },
  {
    id: 3,
    title: "투자 포트폴리오 다변화",
    description: "위험을 분산시키고 안정적인 수익을 위한 포트폴리오 구성 방법을 알아보세요.",
    content: "투자 포트폴리오 다변화는 위험 관리의 핵심 전략입니다...",
    category: "투자",
    difficulty: "intermediate",
    estimatedDuration: 30,
    tags: ["투자", "포트폴리오", "다변화"],
    isFeatured: false,
    viewCount: 750,
    createdAt: "2024-01-03",
    updatedAt: "2024-01-03"
  }
];

const mockSavingTips: SavingTip[] = [
  {
    id: 1,
    title: "외식비 절약하기",
    description: "집에서 요리하고 계획적으로 외식하여 월 외식비를 50% 줄이는 방법",
    category: "식비",
    difficulty: "beginner",
    potentialSavings: 200000,
    implementationSteps: [
      "주간 식단 계획 세우기",
      "장보기 리스트 작성하기",
      "집에서 요리하는 횟수 늘리기",
      "외식은 특별한 날로 제한하기"
    ],
    tags: ["외식", "요리", "식비절약"],
    isPersonalized: true,
    createdAt: "2024-01-01"
  },
  {
    id: 2,
    title: "구독 서비스 정리하기",
    description: "사용하지 않는 구독 서비스를 정리하여 월 고정비를 줄이는 방법",
    category: "고정비",
    difficulty: "beginner",
    potentialSavings: 50000,
    implementationSteps: [
      "현재 구독 중인 서비스 목록 작성",
      "실제 사용 빈도 체크",
      "중복되는 서비스 찾기",
      "불필요한 구독 해지하기"
    ],
    tags: ["구독", "고정비", "정리"],
    isPersonalized: true,
    createdAt: "2024-01-02"
  }
];

const mockPersonalizedAdvice: PersonalizedAdvice[] = [
  {
    id: 1,
    userId: 1,
    adviceType: "budget",
    title: "예산 초과 경고",
    content: "이번 달 식비가 예산을 20% 초과했습니다. 남은 기간 동안 외식을 줄이고 집에서 요리하는 것을 권장합니다.",
    priority: "high",
    basedOn: { category: "식비", overBudget: 20 },
    isRead: false,
    isDismissed: false,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15"
  },
  {
    id: 2,
    userId: 1,
    adviceType: "saving",
    title: "저축 목표 달성 가능",
    content: "현재 저축 패턴을 유지하면 3개월 내에 비상금 목표를 달성할 수 있습니다.",
    priority: "medium",
    basedOn: { savingRate: 0.25, targetAmount: 5000000 },
    isRead: false,
    isDismissed: false,
    createdAt: "2024-01-14",
    updatedAt: "2024-01-14"
  }
];

const mockHealthScore: FinancialHealthScore = {
  id: 1,
  userId: 1,
  overallScore: 75,
  budgetingScore: 80,
  savingScore: 70,
  debtScore: 85,
  investmentScore: 60,
  emergencyFundScore: 65,
  calculationDate: "2024-01-15",
  factorsAnalysis: {
    budgeting: "양호한 예산 관리",
    saving: "저축률 개선 필요",
    debt: "부채 관리 우수",
    investment: "투자 다변화 필요",
    emergencyFund: "비상금 증액 권장"
  },
  recommendations: [
    "저축률을 현재 15%에서 20%로 늘려보세요",
    "비상금을 월 지출의 6개월치까지 늘려보세요",
    "투자 포트폴리오를 다변화해보세요"
  ],
  createdAt: "2024-01-15"
};

class EducationService {
  private async request<T>(
    endpoint: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: RequestInit
  ): Promise<ApiResponse<T>> {
    // 현재는 모킹 데이터만 사용 (실제 API 서버가 구현되지 않았으므로)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Success',
          data: this.getMockData(endpoint) as T
        });
      }, Math.random() * 1000 + 500); // 0.5-1.5초 랜덤 지연
    });

    /* 실제 API가 구현되면 아래 코드 사용
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
    */
  }

  private getMockData(
    endpoint: string
  ): EducationContent[] | EducationDashboard | FinancialHealthScore | SavingTip[] | PersonalizedAdvice[] | null {
    if (endpoint.includes('/education/content')) {
      return mockEducationContent;
    }
    if (endpoint.includes('/education/dashboard')) {
      return {
        summary: {
          totalContentCompleted: 5,
          totalTimeSpent: 180,
          currentStreak: 7,
          averageQuizScore: 85
        },
        healthScore: mockHealthScore,
        recentAdvice: mockPersonalizedAdvice,
        featuredContent: mockEducationContent.filter(c => c.isFeatured),
        personalizedTips: mockSavingTips,
        lastUpdated: new Date().toISOString()
      };
    }
    if (endpoint.includes('/education/health-score')) {
      return mockHealthScore;
    }
    if (endpoint.includes('/education/tips')) {
      return mockSavingTips;
    }
    if (endpoint.includes('/education/advice')) {
      return mockPersonalizedAdvice;
    }
    return null;
  }

  // 교육 콘텐츠 관련 메서드
  async getEducationContent(filter?: EducationContentFilter): Promise<EducationContent[]> {
    const params = new URLSearchParams();
    
    if (filter?.category) params.append('category', filter.category);
    if (filter?.difficulty) params.append('difficulty', filter.difficulty);
    if (filter?.page) params.append('page', filter.page.toString());
    if (filter?.limit) params.append('limit', filter.limit.toString());
    
    const queryString = params.toString();
    const endpoint = `/education/content${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<EducationContent[]>(endpoint);
    return response.data || [];
  }

  async getFeaturedContent(): Promise<EducationContent[]> {
    const response = await this.request<EducationContent[]>('/education/content/featured');
    return response.data || [];
  }

  async searchContent(searchTerm: string): Promise<EducationContent[]> {
    const response = await this.request<EducationContent[]>(`/education/content/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data || [];
  }

  async getContentById(id: number): Promise<EducationContent & { userProgress?: UserEducationProgress }> {
    const response = await this.request<EducationContent & { userProgress?: UserEducationProgress }>(`/education/content/${id}`);
    return response.data!;
  }

  // 진행 상황 관련 메서드
  async updateProgress(contentId: number, progressData: ProgressUpdateData): Promise<UserEducationProgress> {
    const response = await this.request<UserEducationProgress>(`/education/content/${contentId}/progress`, {
      method: 'POST',
      body: JSON.stringify(progressData),
    });
    return response.data!;
  }

  async getEducationSummary(): Promise<{
    totalContentCompleted: number;
    totalTimeSpent: number;
    currentStreak: number;
    averageQuizScore: number;
  }> {
    const response = await this.request<{
      totalContentCompleted: number;
      totalTimeSpent: number;
      currentStreak: number;
      averageQuizScore: number;
    }>('/education/summary');
    return response.data!;
  }

  // 재정 건강도 점수 관련 메서드
  async getHealthScore(): Promise<FinancialHealthScore> {
    const response = await this.request<FinancialHealthScore>('/education/health-score');
    return response.data!;
  }

  async getHealthScoreHistory(): Promise<FinancialHealthScore[]> {
    const response = await this.request<FinancialHealthScore[]>('/education/health-score/history');
    return response.data || [];
  }

  // 절약 팁 관련 메서드
  async getSavingTips(filter?: { 
    category?: string; 
    difficulty?: string; 
    personalized?: boolean 
  }): Promise<SavingTip[]> {
    const params = new URLSearchParams();
    
    if (filter?.category) params.append('category', filter.category);
    if (filter?.difficulty) params.append('difficulty', filter.difficulty);
    if (filter?.personalized) params.append('personalized', 'true');
    
    const queryString = params.toString();
    const endpoint = `/education/saving-tips${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<SavingTip[]>(endpoint);
    return response.data || [];
  }

  async rateSavingTip(tipId: number, isHelpful: boolean, feedback?: string): Promise<void> {
    await this.request(`/education/saving-tips/${tipId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ isHelpful, feedback }),
    });
  }

  // 개인화된 조언 관련 메서드
  async getPersonalizedAdvice(): Promise<PersonalizedAdvice[]> {
    const response = await this.request<PersonalizedAdvice[]>('/education/advice');
    return response.data || [];
  }

  async generateAdvice(): Promise<PersonalizedAdvice[]> {
    const response = await this.request<PersonalizedAdvice[]>('/education/advice/generate', {
      method: 'POST',
    });
    return response.data || [];
  }

  async markAdviceAsRead(adviceId: number): Promise<void> {
    await this.request(`/education/advice/${adviceId}/read`, {
      method: 'POST',
    });
  }

  async dismissAdvice(adviceId: number): Promise<void> {
    await this.request(`/education/advice/${adviceId}/dismiss`, {
      method: 'POST',
    });
  }

  // 교육 대시보드
  async getEducationDashboard(): Promise<EducationDashboard> {
    const response = await this.request<EducationDashboard>('/education/dashboard');
    return response.data!;
  }
}

export const educationService = new EducationService();
export default educationService;

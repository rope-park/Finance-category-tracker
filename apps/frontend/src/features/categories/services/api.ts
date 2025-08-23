import type { RecurringTemplate, Notification } from '../../types';

// ...기존 코드...

// API 클라이언트 클래스 내부에 반복 거래 템플릿 관련 함수 정의
// (아래 FinanceTrackerAPI 클래스 내부에 추가)


  // (옵션) 자동 실행 내역 조회 (추후 백엔드 구현 시)
  // async getRecurringExecutionLogs(): Promise<ApiResponse<{ logs: any[] }>> {
  //   return this.request('/recurring-templates/logs');
  // }
// API 기본 URL
const API_BASE_URL = 'http://localhost:3001/api';

// API 응답 타입
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 빈 응답 타입
interface EmptyResponse {
  message?: string;
}

// 페이지네이션 타입
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 통계 데이터 타입들
interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  averageTransaction: number;
  topCategories: Array<{
    category_key: string;
    category_name: string;
    total_amount: number;
    count: number;
  }>;
}

interface BudgetAnalysis {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overBudgetCategories: Array<{
    category_key: string;
    category_name: string;
    budget_amount: number;
    spent_amount: number;
    over_amount: number;
  }>;
  budgetUtilization: number;
}

interface CategoryUsageStats {
  categories: Array<{
    category_key: string;
    category_name: string;
    transaction_count: number;
    total_amount: number;
    average_amount: number;
    percentage: number;
  }>;
  totalTransactions: number;
  totalAmount: number;
}

interface MonthlyStats {
  year: number;
  month: number;
  income: number;
  expense: number;
  balance: number;
  transactionCount: number;
  topCategories: Array<{
    category_key: string;
    category_name: string;
    amount: number;
  }>;
}

interface DashboardData {
  currentMonth: {
    income: number;
    expense: number;
    balance: number;
    totalTransactions: number;
  };
  monthlyTrend: Array<{
    month: string;
    income: number;
    expense: number;
    balance: number;
  }>;
  topCategories: Array<{
    category_key: string;
    category_name: string;
    total_amount: number;
    count: number;
  }>;
  recentTransactions: Transaction[];
  budgetSummary: {
    totalBudget: number;
    totalSpent: number;
    categories: Array<{
      category_name: string;
      budget_amount: number;
      spent_amount: number;
      usage_percentage: number;
    }>;
  };
}

interface ComparisonAnalysis {
  period1: {
    startDate: string;
    endDate: string;
    income: number;
    expense: number;
    balance: number;
  };
  period2: {
    startDate: string;
    endDate: string;
    income: number;
    expense: number;
    balance: number;
  };
  comparison: {
    incomeChange: number;
    expenseChange: number;
    balanceChange: number;
    incomeChangePercent: number;
    expenseChangePercent: number;
    balanceChangePercent: number;
  };
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: 'connected' | 'disconnected';
  uptime: number;
  version: string;
  timestamp: string;
}

// 공통 타입 정의
interface User {
  id: number;
  email: string;
  name: string;
  profile_picture?: string;
  phone_number?: string;
  age_group?: string;
  bio?: string;
  profile_completed: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface Transaction {
  id: number;
  user_id: number;
  category_key: string;
  transaction_type: 'income' | 'expense';
  amount: number;
  description?: string;
  merchant?: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

interface Budget {
  id: number;
  user_id: number;
  category_key: string;
  year: number;
  month: number;
  budget_amount: number;
  description?: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  spent_amount?: number;
  remaining_amount?: number;
  usage_percentage?: number;
}

interface Category {
  category_key: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  display_order: number;
}

// API 클라이언트 클래스
class FinanceTrackerAPI {

  // ===================
  // 나이대/직업군별 카테고리 추천 API
  // ===================
  async getRecommendedCategories(ageGroup: string, jobGroup?: string): Promise<ApiResponse<{ recommended_categories: string[] }>> {
    const params = new URLSearchParams({ age_group: ageGroup, job_group: jobGroup || 'etc' });
    return this.request(`/categories/recommend?${params.toString()}`);
  }

  // ===================
  // 알림/경고 관련 API
  // ===================
  async fetchNotifications(): Promise<ApiResponse<{ notifications: Notification[] }>> {
    return this.request('/notifications');
  }
  async markNotificationRead(id: string): Promise<ApiResponse<object>> {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  }
  async deleteNotification(id: string): Promise<ApiResponse<object>> {
    return this.request(`/notifications/${id}`, { method: 'DELETE' });
  }
  // ===================
  // 반복 거래 템플릿 관련 API
  // ===================
  async getRecurringTemplates(): Promise<ApiResponse<{ templates: RecurringTemplate[] }>> {
    return this.request('/recurring-templates');
  }
  async createRecurringTemplate(templateData: Partial<RecurringTemplate>): Promise<ApiResponse<{ template: RecurringTemplate }>> {
    return this.request('/recurring-templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }
  async updateRecurringTemplate(id: string, templateData: Partial<RecurringTemplate>): Promise<ApiResponse<{ template: RecurringTemplate }>> {
    return this.request(`/recurring-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
  }
  async deleteRecurringTemplate(id: string): Promise<ApiResponse<EmptyResponse>> {
    return this.request(`/recurring-templates/${id}`, {
      method: 'DELETE',
    });
  }
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // 인증 토큰을 헤더에 추가하는 헬퍼 함수
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  // 기본 HTTP 요청 함수
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      console.log(`🌐 API 요청: ${options.method || 'GET'} ${url}`);
      if (config.body) {
        console.log('📤 요청 데이터:', config.body);
      }

      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`📥 응답 (${response.status}):`, data);

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ API 요청 실패 (${endpoint}):`, error);
      throw error;
    }
  }

  // ===================
  // 인증 관련 API
  // ===================

  // 회원가입
  async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // 로그인
  async login(credentials: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // 현재 사용자 정보 조회
  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/me');
  }

  // 로그아웃
  async logout(): Promise<ApiResponse<EmptyResponse>> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // 토큰 검증
  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/verify');
  }

  // ===================
  // 사용자 관련 API
  // ===================

  // 프로필 업데이트
  async updateProfile(profileData: {
    name?: string;
    profile_picture?: string;
    phone_number?: string;
    age_group?: string;
    bio?: string;
  }): Promise<ApiResponse<{ user: User }>> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // 비밀번호 변경
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<EmptyResponse>> {
    return this.request('/users/password', {
      method: 'PATCH',
      body: JSON.stringify(passwordData),
    });
  }

  // 계정 삭제
  async deleteAccount(): Promise<ApiResponse<EmptyResponse>> {
    return this.request('/users/account', {
      method: 'DELETE',
    });
  }

  // ===================
  // 거래 내역 관련 API
  // ===================

  // 거래 내역 목록 조회
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: 'income' | 'expense';
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<ApiResponse<{ transactions: Transaction[]; pagination: Pagination }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/transactions?${queryString}` : '/transactions';
    
    return this.request(endpoint);
  }

  // 거래 내역 생성
  async createTransaction(transactionData: {
    category_key: string;
    transaction_type: 'income' | 'expense';
    amount: number;
    description?: string;
    merchant?: string;
    transaction_date: string;
  }): Promise<ApiResponse<{ transaction: Transaction }>> {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // 거래 내역 수정
  async updateTransaction(
    id: number,
    transactionData: Partial<{
      category_key: string;
      transaction_type: 'income' | 'expense';
      amount: number;
      description: string;
      merchant: string;
      transaction_date: string;
    }>
  ): Promise<ApiResponse<{ transaction: Transaction }>> {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
  }

  // 거래 내역 삭제
  async deleteTransaction(id: number): Promise<ApiResponse<EmptyResponse>> {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // 거래 내역 통계
  async getTransactionStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<TransactionStats>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/transactions/stats?${queryString}` : '/transactions/stats';
    
    return this.request(endpoint);
  }

  // ===================
  // 예산 관련 API
  // ===================

  // 예산 목록 조회
  async getBudgets(params?: {
    year?: number;
    month?: number;
  }): Promise<ApiResponse<{ budgets: Budget[] }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/budgets?${queryString}` : '/budgets';
    
    return this.request(endpoint);
  }

  // 예산 생성
  async createBudget(budgetData: {
    category_key: string;
    year: number;
    month: number;
    budget_amount: number;
    description?: string;
  }): Promise<ApiResponse<{ budget: Budget }>> {
    return this.request('/budgets', {
      method: 'POST',
      body: JSON.stringify(budgetData),
    });
  }

  // 예산 수정
  async updateBudget(
    id: number,
    budgetData: Partial<{
      budget_amount: number;
      description: string;
    }>
  ): Promise<ApiResponse<{ budget: Budget }>> {
    return this.request(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budgetData),
    });
  }

  // 예산 삭제
  async deleteBudget(id: number): Promise<ApiResponse<EmptyResponse>> {
    return this.request(`/budgets/${id}`, {
      method: 'DELETE',
    });
  }

  // 예산 분석
  async getBudgetAnalysis(params?: {
    year?: number;
    month?: number;
  }): Promise<ApiResponse<BudgetAnalysis>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/budgets/analysis?${queryString}` : '/budgets/analysis';
    
    return this.request(endpoint);
  }

  // ===================
  // 카테고리 관련 API
  // ===================

  // 모든 카테고리 조회
  async getCategories(type?: 'income' | 'expense'): Promise<ApiResponse<{ categories: Category[] }>> {
    const endpoint = type ? `/categories?type=${type}` : '/categories';
    return this.request(endpoint);
  }

  // 특정 카테고리 조회
  async getCategory(categoryKey: string): Promise<ApiResponse<{ category: Category }>> {
    return this.request(`/categories/${categoryKey}`);
  }

  // 카테고리 사용 통계
  async getCategoryUsageStats(params?: {
    startDate?: string;
    endDate?: string;
    type?: 'income' | 'expense';
  }): Promise<ApiResponse<CategoryUsageStats>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/categories/usage/stats?${queryString}` : '/categories/usage/stats';
    
    return this.request(endpoint);
  }

  // 카테고리별 월별 통계
  async getCategoryMonthlyStats(
    categoryKey: string,
    year?: number
  ): Promise<ApiResponse<MonthlyStats[]>> {
    const endpoint = year 
      ? `/categories/${categoryKey}/monthly-stats?year=${year}`
      : `/categories/${categoryKey}/monthly-stats`;
    
    return this.request(endpoint);
  }

  // ===================
  // 분석 관련 API
  // ===================

  // 대시보드 데이터
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    return this.request('/analytics/dashboard');
  }

  // 월별 상세 분석
  async getMonthlyAnalysis(year: number, month: number): Promise<ApiResponse<MonthlyStats>> {
    return this.request(`/analytics/monthly/${year}/${month}`);
  }

  // 연간 분석
  async getYearlyAnalysis(year: number): Promise<ApiResponse<MonthlyStats[]>> {
    return this.request(`/analytics/yearly/${year}`);
  }

  // 기간별 비교 분석
  async getComparisonAnalysis(params: {
    startDate1: string;
    endDate1: string;
    startDate2: string;
    endDate2: string;
  }): Promise<ApiResponse<ComparisonAnalysis>> {
    const queryParams = new URLSearchParams(params);
    return this.request(`/analytics/compare?${queryParams.toString()}`);
  }

  // ===================
  // 헬스체크
  // ===================

  // 서버 상태 확인
  async getHealth(): Promise<ApiResponse<HealthStatus>> {
    return this.request('/health');
  }
}

// API 클라이언트 인스턴스 생성
const api = new FinanceTrackerAPI(API_BASE_URL);

// 개별 API 서비스 객체들 (기존 코드와의 호환성을 위해)
export const authAPI = {
  register: api.register.bind(api),
  login: api.login.bind(api),
  getCurrentUser: api.getCurrentUser.bind(api),
  logout: api.logout.bind(api),
  verifyToken: api.verifyToken.bind(api),
};

export const userAPI = {
  updateProfile: api.updateProfile.bind(api),
  changePassword: api.changePassword.bind(api),
  deleteAccount: api.deleteAccount.bind(api),
};

export const transactionAPI = {
  getTransactions: api.getTransactions.bind(api),
  createTransaction: api.createTransaction.bind(api),
  updateTransaction: api.updateTransaction.bind(api),
  deleteTransaction: api.deleteTransaction.bind(api),
  getStats: api.getTransactionStats.bind(api),
};

export const budgetAPI = {
  getBudgets: api.getBudgets.bind(api),
  createBudget: api.createBudget.bind(api),
  updateBudget: api.updateBudget.bind(api),
  deleteBudget: api.deleteBudget.bind(api),
  getAnalysis: api.getBudgetAnalysis.bind(api),
};

export const categoryAPI = {
  getCategories: api.getCategories.bind(api),
  getCategory: api.getCategory.bind(api),
  getUsageStats: api.getCategoryUsageStats.bind(api),
  getMonthlyStats: api.getCategoryMonthlyStats.bind(api),
};

export const analyticsAPI = {
  getDashboard: api.getDashboardData.bind(api),
  getMonthlyAnalysis: api.getMonthlyAnalysis.bind(api),
  getYearlyAnalysis: api.getYearlyAnalysis.bind(api),
  getComparison: api.getComparisonAnalysis.bind(api),
};

// 반복 거래 템플릿 관련 메서드 export (AppContext 연동용)

export const getRecurringTemplates = api.getRecurringTemplates.bind(api);
export const createRecurringTemplate = api.createRecurringTemplate.bind(api);
export const updateRecurringTemplate = api.updateRecurringTemplate.bind(api);
export const deleteRecurringTemplate = api.deleteRecurringTemplate.bind(api);

// 메인 API 클라이언트 export
export default api;

// 타입들도 export
export type { 
  User, 
  Transaction, 
  Budget, 
  Category, 
  ApiResponse,
  EmptyResponse,
  Pagination,
  TransactionStats,
  BudgetAnalysis,
  CategoryUsageStats,
  MonthlyStats,
  DashboardData,
  ComparisonAnalysis,
  HealthStatus
};

import { useState, useEffect, useCallback } from 'react';
import type {
  EducationContent,
  UserEducationProgress,
  FinancialHealthScore,
  SavingTip,
  PersonalizedAdvice,
  EducationContentFilter,
  ProgressUpdateData
} from '../../../index';
import type { EducationDashboard } from '../../../shared/types/education';
import educationService from '../services/educationService';

// 교육 콘텐츠 목록을 위한 hook
export const useEducationContent = (filter?: EducationContentFilter) => {
  const [content, setContent] = useState<EducationContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await educationService.getEducationContent(filter);
      setContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '콘텐츠를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return { content, loading, error, refetch: fetchContent };
};

// 추천 콘텐츠를 위한 hook
export const useFeaturedContent = () => {
  const [featuredContent, setFeaturedContent] = useState<EducationContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await educationService.getFeaturedContent();
        setFeaturedContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '추천 콘텐츠를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedContent();
  }, []);

  return { featuredContent, loading, error };
};

// 특정 교육 콘텐츠를 위한 hook
export const useEducationContentDetail = (contentId: number) => {
  const [content, setContent] = useState<(EducationContent & { userProgress?: UserEducationProgress }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await educationService.getContentById(contentId);
      setContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '콘텐츠를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const updateProgress = async (progressData: ProgressUpdateData) => {
    try {
      const updatedProgress = await educationService.updateProgress(contentId, progressData);
      setContent(prev => prev ? { ...prev, userProgress: updatedProgress } : null);
      return updatedProgress;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '진행 상황 업데이트에 실패했습니다.');
    }
  };

  return { content, loading, error, updateProgress, refetch: fetchContent };
};

// 재정 건강도 점수를 위한 hook
export const useHealthScore = () => {
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null);
  const [history, setHistory] = useState<FinancialHealthScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthScore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [currentScore, scoreHistory] = await Promise.all([
        educationService.getHealthScore(),
        educationService.getHealthScoreHistory()
      ]);
      setHealthScore(currentScore);
      setHistory(scoreHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : '재정 건강도 점수를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthScore();
  }, [fetchHealthScore]);

  return { healthScore, history, loading, error, refetch: fetchHealthScore };
};

// 절약 팁을 위한 hook
export const useSavingTips = (filter?: { category?: string; difficulty?: string; personalized?: boolean }) => {
  const [tips, setTips] = useState<SavingTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await educationService.getSavingTips(filter);
      setTips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '절약 팁을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  const rateTip = async (tipId: number, isHelpful: boolean, feedback?: string) => {
    try {
      await educationService.rateSavingTip(tipId, isHelpful, feedback);
      // 팁 목록을 다시 불러오지 않고 로컬 상태만 업데이트할 수도 있음
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '팁 평가에 실패했습니다.');
    }
  };

  return { tips, loading, error, rateTip, refetch: fetchTips };
};

// 개인화된 조언을 위한 hook
export const usePersonalizedAdvice = () => {
  const [advice, setAdvice] = useState<PersonalizedAdvice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await educationService.getPersonalizedAdvice();
      setAdvice(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '개인화된 조언을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvice();
  }, [fetchAdvice]);

  const generateNewAdvice = async () => {
    try {
      const newAdvice = await educationService.generateAdvice();
      setAdvice(newAdvice);
      return newAdvice;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '조언 생성에 실패했습니다.');
    }
  };

  const markAsRead = async (adviceId: number) => {
    try {
      await educationService.markAdviceAsRead(adviceId);
      setAdvice(prev => 
        prev.map(item => 
          item.id === adviceId ? { ...item, isRead: true } : item
        )
      );
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '조언 읽음 처리에 실패했습니다.');
    }
  };

  const dismissAdvice = async (adviceId: number) => {
    try {
      await educationService.dismissAdvice(adviceId);
      setAdvice(prev => 
        prev.map(item => 
          item.id === adviceId ? { ...item, isDismissed: true } : item
        )
      );
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '조언 해제에 실패했습니다.');
    }
  };

  return { 
    advice, 
    loading, 
    error, 
    generateNewAdvice, 
    markAsRead, 
    dismissAdvice, 
    refetch: fetchAdvice 
  };
};

// 교육 대시보드를 위한 hook
export const useEducationDashboard = () => {
  const [dashboard, setDashboard] = useState<EducationDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await educationService.getEducationDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '대시보드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, loading, error, refetch: fetchDashboard };
};

// 콘텐츠 검색을 위한 hook
export const useEducationSearch = () => {
  const [searchResults, setSearchResults] = useState<EducationContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchContent = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await educationService.searchContent(searchTerm);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색에 실패했습니다.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setError(null);
  };

  return { searchResults, loading, error, searchContent, clearSearch };
};

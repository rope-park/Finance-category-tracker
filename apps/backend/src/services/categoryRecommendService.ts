// categoryRecommendService.ts
// 나이대, 직업군 별 기본 카테고리 추천 서비스

import { Category } from '../types';

// 샘플: 나이대/직업군별 기본 카테고리 추천 매핑
const DEFAULT_CATEGORY_RECOMMENDATIONS: Record<string, Record<string, string[]>> = {
  '10s': {
    student: ['food', 'leisure', 'education', 'shopping'],
    etc: ['food', 'leisure', 'shopping']
  },
  '20s': {
    student: ['food', 'leisure', 'education', 'shopping'],
    office: ['food', 'transport', 'shopping', 'leisure', 'salary'],
    etc: ['food', 'shopping', 'leisure']
  },
  '30s': {
    office: ['food', 'transport', 'shopping', 'health', 'utility', 'salary'],
    self_employed: ['food', 'transport', 'shopping', 'salary', 'utility'],
    etc: ['food', 'shopping', 'leisure', 'health']
  },
  '40s': {
    office: ['food', 'transport', 'shopping', 'health', 'utility', 'salary'],
    self_employed: ['food', 'transport', 'shopping', 'salary', 'utility'],
    etc: ['food', 'shopping', 'leisure', 'health']
  },
  '50s': {
    office: ['food', 'health', 'utility', 'salary', 'leisure'],
    self_employed: ['food', 'health', 'utility', 'salary'],
    etc: ['food', 'health', 'leisure']
  },
  '60s+': {
    retired: ['health', 'utility', 'leisure', 'food'],
    etc: ['health', 'leisure', 'food']
  }
};

export class CategoryRecommendService {
  /**
   * 나이대, 직업군별 기본 카테고리 추천
   * @param ageGroup '10s' | '20s' | ...
   * @param jobGroup 'student' | 'office' | 'self_employed' | 'retired' | 'etc'
   */
  static recommendCategories(ageGroup: string, jobGroup: string = 'etc'): string[] {
    const ageMap = DEFAULT_CATEGORY_RECOMMENDATIONS[ageGroup] || DEFAULT_CATEGORY_RECOMMENDATIONS['20s'];
    return ageMap[jobGroup] || ageMap['etc'] || [];
  }
}
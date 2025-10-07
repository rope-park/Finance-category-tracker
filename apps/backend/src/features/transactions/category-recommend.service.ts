/**
 * 나이대/직업군별 기본 카테고리 추천 서비스
 * 
 * 사용자 프로필(나이대, 직업군 등)에 기반한 카테고리 추천 로직을 포함.
 * 사용자의 금융 습관과 선호도를 반영하여 맞춤형 카테고리 추천 제공.
 * 
 * - 주요 기능:
 *  - 나이대/직업군별 기본 카테고리 추천 매핑
 * - 사용자 프로필에 따른 카테고리 추천
 * - 확장 가능하도록 설계되어 향후 추가적인 추천 로직 통합 가능
 * 
 * @author Ju Eul Park (rope-park)
 */

import { Category } from '../../core/types';

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
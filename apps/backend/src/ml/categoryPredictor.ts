// categoryPredictor.ts
// 머신러닝 기반 카테고리 자동 분류기 (심플 룰+키워드+ML 구조)

export interface CategoryPrediction {
  category: string;
  confidence: number;
}

// 샘플 카테고리 키워드 맵 (실제 서비스에서는 더 정교하게 확장)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: ['식사', '점심', '저녁', '카페', '커피', '음식', '레스토랑', '배달'],
  transport: ['버스', '지하철', '택시', '교통', 'KTX', '기차', '고속버스'],
  shopping: ['쇼핑', '구매', '마켓', '쿠팡', 'G마켓', '11번가', '이마트'],
  salary: ['월급', '급여', '연봉', '보너스'],
  health: ['병원', '약국', '의료', '건강', '진료'],
  leisure: ['영화', '여행', '호텔', '공연', '레저', '관광'],
  utility: ['공과금', '수도', '전기', '가스', '관리비'],
  education: ['학원', '교육', '수강', '강의', '교재'],
  etc: []
};

export function predictCategory(text: string): CategoryPrediction {
  let bestCategory = 'etc';
  let maxScore = 0;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        if (maxScore < 1) {
          bestCategory = category;
          maxScore = 1;
        }
      }
    }
  }
  return { category: bestCategory, confidence: maxScore };
}
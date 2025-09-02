// categoryService 예시 (실제 로직은 기존 recommendCategory 함수 활용)
export async function recommendCategories(age_group: string, job_group: string) {
  // 실제 추천 로직 또는 DB/API 호출
  // 여기서는 더미 데이터 반환
  return [
    { category: '식비', score: 0.9 },
    { category: '교통', score: 0.7 },
    { category: '문화', score: 0.5 },
  ];
}

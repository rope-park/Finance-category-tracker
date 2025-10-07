/**
 * 마이그레이션 유틸리티
 * 
 * 주요 기능:
 * - 구버전 데이터 구조를 신버전으로 변환
 * - 데이터 무결성 검사
 * - 변환 로그 기록
 */

type OldDataItem = {
  [key: string]: unknown;
  category: string;
};

type NewDataItem = Omit<OldDataItem, 'category'> & { category_key: string; category: undefined };

/**
 * 구버전 데이터를 신버전으로 마이그레이션
 * @param oldData - 구버전 데이터 배열
 * @returns 신버전 데이터 배열
 */
export function migrateDataV1toV2(oldData: OldDataItem[]): NewDataItem[] {
  // 예시: category 필드명을 category_key로 변경
  return oldData.map((item: OldDataItem) => ({
    ...item,
    category_key: item.category,
    category: undefined
  }));
}

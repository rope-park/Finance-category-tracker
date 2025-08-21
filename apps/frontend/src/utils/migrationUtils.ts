// 데이터 마이그레이션 샘플 유틸
type OldDataItem = {
  [key: string]: unknown;
  category: string;
};

type NewDataItem = Omit<OldDataItem, 'category'> & { category_key: string; category: undefined };

export function migrateDataV1toV2(oldData: OldDataItem[]): NewDataItem[] {
  // 예시: category 필드명을 category_key로 변경
  return oldData.map((item: OldDataItem) => ({
    ...item,
    category_key: item.category,
    category: undefined
  }));
}

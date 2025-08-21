// 은행 API 연동 샘플 (실제 API 연동은 별도 구현 필요)
export async function importBankData(dummy: boolean = true) {
  if (dummy) {
    // 샘플 데이터 반환
    return [
      { date: '2025-08-01', description: '은행 입금', amount: 100000, type: 'income', category: 'salary' },
      { date: '2025-08-02', description: '카드 결제', amount: -50000, type: 'expense', category: 'food' }
    ];
  }
  // 실제 은행 API 연동 로직 작성
  throw new Error('은행 API 연동 미구현');
}

// TODO: Toss Payments API 통합 서비스 기능 구현
// Toss Payments API 응답 타입
interface TossPaymentData {
  paymentKey: string;
  approvedAt: string;
  totalAmount: number;
  orderName?: string;
  method: string;
  card?: {
    acquirerCode?: string;
  };
}

// Toss Payments API 관련 서비스
export class TossPaymentsService {
  private secretKey: string;
  private baseUrl = 'https://api.tosspayments.com/v1';

  constructor(_clientKey: string, secretKey: string) {
    // clientKey는 브라우저에서 사용되며 여기서는 secretKey만 사용
    this.secretKey = secretKey;
  }

  // 결제 내역 조회
  async getPaymentHistory() {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(this.secretKey + ':')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('결제 내역을 가져오는데 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('Toss Payments API 오류:', error);
      throw error;
    }
  }

  // 결제 상세 정보 조회
  async getPaymentDetail(paymentKey: string) {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentKey}`, {
        headers: {
          'Authorization': `Basic ${btoa(this.secretKey + ':')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('결제 상세 정보를 가져오는데 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('Toss Payments API 오류:', error);
      throw error;
    }
  }
}

// 환경 변수에서 API 키를 가져오는 함수
export const getTossPaymentsService = () => {
  const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
  const secretKey = import.meta.env.VITE_TOSS_SECRET_KEY;

  if (!clientKey || !secretKey) {
    console.warn('Toss Payments API 키가 설정되지 않았습니다. 테스트 데이터를 사용합니다.');
    return null;
  }

  return new TossPaymentsService(clientKey, secretKey);
};

// 결제 데이터를 Transaction 형태로 변환하는 함수
export const convertTossPaymentToTransaction = (payment: TossPaymentData) => {
  // Toss Payments API 응답을 우리 앱의 Transaction 타입으로 변환
  // 실제 API 응답 구조에 맞게 조정해야 함
  return {
    id: payment.paymentKey,
    date: payment.approvedAt,
    amount: payment.totalAmount,
    description: payment.orderName || '결제',
    category: categorizePayment(payment), // 결제 정보를 기반으로 카테고리 분류
    merchant: payment.card?.acquirerCode || payment.method,
    type: 'expense' as const,
  };
};

// 결제 정보를 기반으로 카테고리를 자동 분류하는 함수
const categorizePayment = (payment: TossPaymentData): string => {
  const orderName = payment.orderName?.toLowerCase() || '';
  
  // 간단한 키워드 기반 분류
  if (orderName.includes('음식') || orderName.includes('식당') || orderName.includes('카페')) {
    return 'food';
  }
  if (orderName.includes('교통') || orderName.includes('지하철') || orderName.includes('버스')) {
    return 'transport';
  }
  if (orderName.includes('쇼핑') || orderName.includes('의류') || orderName.includes('마트')) {
    return 'shopping';
  }
  if (orderName.includes('영화') || orderName.includes('게임') || orderName.includes('엔터')) {
    return 'entertainment';
  }
  
  return 'other';
};
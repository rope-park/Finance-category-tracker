// 브라우저 콘솔에서 실행할 샘플 데이터 추가 스크립트
const sampleData = {
  "darkMode": false,
  "notificationsEnabled": true,
  "transactions": [
    {
      "id": "1",
      "amount": 25000,
      "category": "FOOD_RESTAURANT",
      "description": "점심식사",
      "date": "2025-09-15",
      "type": "expense",
      "merchant": "맛있는 식당",
      "paymentMethod": "card",
      "tags": []
    },
    {
      "id": "2", 
      "amount": 8000,
      "category": "TRANSPORTATION_BUS_SUBWAY",
      "description": "지하철 이용",
      "date": "2025-09-15",
      "type": "expense",
      "merchant": "서울교통공사",
      "paymentMethod": "card",
      "tags": []
    },
    {
      "id": "3",
      "amount": 45000,
      "category": "SHOPPING_CLOTHES",
      "description": "의류 구매",
      "date": "2025-09-14",
      "type": "expense", 
      "merchant": "패션몰",
      "paymentMethod": "card",
      "tags": []
    },
    {
      "id": "4",
      "amount": 3000000,
      "category": "INCOME_SALARY",
      "description": "월급",
      "date": "2025-09-01",
      "type": "income",
      "merchant": "회사",
      "paymentMethod": "transfer",
      "tags": []
    },
    {
      "id": "5",
      "amount": 15000,
      "category": "FOOD_DELIVERY",
      "description": "저녁식사",
      "date": "2025-09-16", 
      "type": "expense",
      "merchant": "치킨집",
      "paymentMethod": "card",
      "tags": []
    },
    {
      "id": "6",
      "amount": 12000,
      "category": "TRANSPORTATION_TAXI",
      "description": "택시",
      "date": "2025-09-16",
      "type": "expense",
      "merchant": "카카오T",
      "paymentMethod": "card", 
      "tags": []
    },
    {
      "id": "7",
      "amount": 7000,
      "category": "FOOD_CAFE_COFFEE",
      "description": "커피",
      "date": "2025-09-17",
      "type": "expense",
      "merchant": "스타벅스",
      "paymentMethod": "card",
      "tags": []
    },
    {
      "id": "8", 
      "amount": 35000,
      "category": "SHOPPING_GROCERY_MART",
      "description": "생활용품",
      "date": "2025-09-18",
      "type": "expense",
      "merchant": "마트",
      "paymentMethod": "card",
      "tags": []
    }
  ],
  "budgets": [
    {
      "category": "FOOD_RESTAURANT",
      "limit": 200000,
      "warningThreshold": 80
    },
    {
      "category": "TRANSPORTATION_BUS_SUBWAY", 
      "limit": 100000,
      "warningThreshold": 80
    },
    {
      "category": "SHOPPING_CLOTHES",
      "limit": 150000,
      "warningThreshold": 80
    }
  ]
};

// localStorage에 데이터 저장
localStorage.setItem('finance-app-settings', JSON.stringify(sampleData));

console.log('샘플 데이터가 추가되었습니다. 페이지를 새로고침하세요.');
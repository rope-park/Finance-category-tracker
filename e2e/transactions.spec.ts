import { test, expect } from '@playwright/test';

test.describe('Transaction Management', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/');
    await page.click('text=로그인');
    await page.fill('[data-testid="login-email"]', 'test@example.com');
    await page.fill('[data-testid="login-password"]', 'testpassword123');
    await page.click('[data-testid="login-submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create a new transaction', async ({ page }) => {
    // 거래 추가 버튼 클릭
    await page.click('[data-testid="add-transaction-btn"]');
    
    // 거래 폼 작성
    await page.fill('[data-testid="transaction-amount"]', '15000');
    await page.fill('[data-testid="transaction-description"]', '점심식사');
    await page.selectOption('[data-testid="transaction-category"]', 'food');
    await page.fill('[data-testid="transaction-date"]', '2024-01-15');
    
    // 지출 선택
    await page.click('[data-testid="expense-btn"]');
    
    // 거래 저장
    await page.click('[data-testid="save-transaction"]');
    
    // 거래 목록에 새 거래가 추가되었는지 확인
    await expect(page.locator('text=점심식사')).toBeVisible();
    await expect(page.locator('text=-15,000원')).toBeVisible();
  });

  test('should edit an existing transaction', async ({ page }) => {
    // 첫 번째 거래의 편집 버튼 클릭
    await page.click('[data-testid="transaction-item"]:first-child [data-testid="edit-transaction"]');
    
    // 거래 정보 수정
    await page.fill('[data-testid="transaction-amount"]', '20000');
    await page.fill('[data-testid="transaction-description"]', '수정된 점심식사');
    
    // 수정 저장
    await page.click('[data-testid="save-transaction"]');
    
    // 수정된 거래 확인
    await expect(page.locator('text=수정된 점심식사')).toBeVisible();
    await expect(page.locator('text=-20,000원')).toBeVisible();
  });

  test('should delete a transaction', async ({ page }) => {
    // 첫 번째 거래의 삭제 버튼 클릭
    await page.click('[data-testid="transaction-item"]:first-child [data-testid="delete-transaction"]');
    
    // 삭제 확인 다이얼로그
    await page.click('[data-testid="confirm-delete"]');
    
    // 거래가 목록에서 제거되었는지 확인
    await expect(page.locator('[data-testid="transaction-item"]')).toHaveCount(0);
  });

  test('should filter transactions by category', async ({ page }) => {
    // 카테고리 필터 선택
    await page.selectOption('[data-testid="category-filter"]', 'food');
    
    // 식비 카테고리의 거래만 표시되는지 확인
    const transactionItems = page.locator('[data-testid="transaction-item"]');
    await expect(transactionItems).toHaveCount(1);
    await expect(page.locator('text=점심식사')).toBeVisible();
  });

  test('should filter transactions by date range', async ({ page }) => {
    // 날짜 범위 필터 설정
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.click('[data-testid="apply-date-filter"]');
    
    // 해당 기간의 거래만 표시되는지 확인
    const transactionItems = page.locator('[data-testid="transaction-item"]');
    await expect(transactionItems.count()).toBeGreaterThan(0);
  });

  test('should show transaction statistics', async ({ page }) => {
    // 통계 섹션이 표시되는지 확인
    await expect(page.locator('[data-testid="total-income"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-expense"]')).toBeVisible();
    await expect(page.locator('[data-testid="balance"]')).toBeVisible();
    
    // 통계 값들이 올바른지 확인
    const totalExpense = await page.locator('[data-testid="total-expense"]').textContent();
    expect(totalExpense).toContain('원');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Budget Management', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/');
    await page.click('text=로그인');
    await page.fill('[data-testid="login-email"]', 'test@example.com');
    await page.fill('[data-testid="login-password"]', 'testpassword123');
    await page.click('[data-testid="login-submit"]');
    
    // 예산 페이지로 이동
    await page.click('[data-testid="nav-budgets"]');
  });

  test('should create a new budget', async ({ page }) => {
    // 예산 추가 버튼 클릭
    await page.click('[data-testid="add-budget-btn"]');
    
    // 예산 폼 작성
    await page.selectOption('[data-testid="budget-category"]', 'food');
    await page.fill('[data-testid="budget-amount"]', '500000');
    await page.selectOption('[data-testid="budget-period"]', 'monthly');
    
    // 예산 저장
    await page.click('[data-testid="save-budget"]');
    
    // 예산 목록에 새 예산이 추가되었는지 확인
    await expect(page.locator('text=식비')).toBeVisible();
    await expect(page.locator('text=500,000원')).toBeVisible();
  });

  test('should show budget progress', async ({ page }) => {
    // 예산 진행률 바가 표시되는지 확인
    await expect(page.locator('[data-testid="budget-progress"]')).toBeVisible();
    
    // 사용량 표시 확인
    await expect(page.locator('[data-testid="budget-spent"]')).toBeVisible();
    await expect(page.locator('[data-testid="budget-remaining"]')).toBeVisible();
  });

  test('should show warning when budget exceeds 80%', async ({ page }) => {
    // 예산의 80% 이상 사용 시 경고 표시
    const warningMessage = page.locator('[data-testid="budget-warning"]');
    const budgetProgress = await page.locator('[data-testid="budget-progress"]').getAttribute('value');
    
    if (parseFloat(budgetProgress || '0') >= 80) {
      await expect(warningMessage).toBeVisible();
      await expect(warningMessage).toHaveText(/예산의 80% 이상 사용/);
    }
  });

  test('should edit budget amount', async ({ page }) => {
    // 첫 번째 예산의 편집 버튼 클릭
    await page.click('[data-testid="budget-item"]:first-child [data-testid="edit-budget"]');
    
    // 예산 금액 수정
    await page.fill('[data-testid="budget-amount"]', '600000');
    
    // 수정 저장
    await page.click('[data-testid="save-budget"]');
    
    // 수정된 예산 확인
    await expect(page.locator('text=600,000원')).toBeVisible();
  });

  test('should delete a budget', async ({ page }) => {
    // 첫 번째 예산의 삭제 버튼 클릭
    await page.click('[data-testid="budget-item"]:first-child [data-testid="delete-budget"]');
    
    // 삭제 확인
    await page.click('[data-testid="confirm-delete"]');
    
    // 예산이 목록에서 제거되었는지 확인
    await expect(page.locator('[data-testid="budget-item"]')).toHaveCount(0);
  });

  test('should show monthly budget overview', async ({ page }) => {
    // 월간 예산 개요 확인
    await expect(page.locator('[data-testid="monthly-budget-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="monthly-spent-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="monthly-remaining-total"]')).toBeVisible();
    
    // 예산 사용률 차트 확인
    await expect(page.locator('[data-testid="budget-chart"]')).toBeVisible();
  });
});

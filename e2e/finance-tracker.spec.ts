import { test, expect } from '@playwright/test'

test.describe('Finance Tracker E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should register and login user', async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.click('text=회원가입')
    
    // 회원가입 폼 작성
    await page.fill('[data-testid="email"]', 'e2e@test.com')
    await page.fill('[data-testid="password"]', 'testpassword123')
    await page.fill('[data-testid="name"]', 'E2E Test User')
    await page.click('[data-testid="register-submit"]')

    // 로그인 성공 확인
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=대시보드')).toBeVisible()
  })

  test('should create and manage transactions', async ({ page }) => {
    // 로그인 (사전 조건)
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'e2e@test.com')
    await page.fill('[data-testid="password"]', 'testpassword123')
    await page.click('[data-testid="login-submit"]')

    // 거래 추가 페이지로 이동
    await page.click('text=거래 추가')
    
    // 거래 폼 작성
    await page.fill('[data-testid="amount"]', '50000')
    await page.fill('[data-testid="description"]', 'E2E 테스트 거래')
    await page.selectOption('[data-testid="category"]', 'food')
    await page.selectOption('[data-testid="type"]', 'expense')
    await page.click('[data-testid="transaction-submit"]')

    // 거래 목록에서 확인
    await page.goto('/transactions')
    await expect(page.locator('text=E2E 테스트 거래')).toBeVisible()
    await expect(page.locator('text=50,000원')).toBeVisible()
  })

  test('should create and monitor budget', async ({ page }) => {
    // 로그인
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'e2e@test.com')
    await page.fill('[data-testid="password"]', 'testpassword123')
    await page.click('[data-testid="login-submit"]')

    // 예산 설정 페이지로 이동
    await page.click('text=예산 관리')
    await page.click('text=새 예산 추가')
    
    // 예산 폼 작성
    await page.selectOption('[data-testid="budget-category"]', 'food')
    await page.fill('[data-testid="budget-amount"]', '500000')
    await page.fill('[data-testid="budget-start"]', '2025-08-01')
    await page.fill('[data-testid="budget-end"]', '2025-08-31')
    await page.click('[data-testid="budget-submit"]')

    // 예산 목록에서 확인
    await expect(page.locator('text=식비')).toBeVisible()
    await expect(page.locator('text=500,000원')).toBeVisible()
    
    // 예산 사용률 확인
    await expect(page.locator('[data-testid="budget-progress"]')).toBeVisible()
  })

  test('should display dashboard with financial overview', async ({ page }) => {
    // 로그인
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'e2e@test.com')
    await page.fill('[data-testid="password"]', 'testpassword123')
    await page.click('[data-testid="login-submit"]')

    // 대시보드 요소들 확인
    await expect(page.locator('[data-testid="total-income"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-expense"]')).toBeVisible()
    await expect(page.locator('[data-testid="net-worth"]')).toBeVisible()
    
    // 차트 확인
    await expect(page.locator('[data-testid="expense-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="budget-overview"]')).toBeVisible()
    
    // 최근 거래 목록 확인
    await expect(page.locator('[data-testid="recent-transactions"]')).toBeVisible()
  })

  test('should handle mobile responsive design', async ({ page }) => {
    // 모바일 크기로 변경
    await page.setViewportSize({ width: 375, height: 667 })
    
    // 로그인
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'e2e@test.com')
    await page.fill('[data-testid="password"]', 'testpassword123')
    await page.click('[data-testid="login-submit"]')

    // 모바일 네비게이션 확인
    await page.click('[data-testid="mobile-menu-toggle"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    
    // 모바일에서 거래 추가 확인
    await page.click('text=거래 추가')
    await expect(page.locator('[data-testid="transaction-form"]')).toBeVisible()
  })
})

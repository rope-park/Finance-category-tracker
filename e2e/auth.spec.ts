import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should register a new user successfully', async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.click('text=회원가입');
    
    // 회원가입 폼 작성
    await page.fill('[data-testid="register-email"]', 'e2etest@example.com');
    await page.fill('[data-testid="register-password"]', 'testpassword123');
    await page.fill('[data-testid="register-confirm-password"]', 'testpassword123');
    await page.fill('[data-testid="register-name"]', 'E2E Test User');
    
    // 회원가입 제출
    await page.click('[data-testid="register-submit"]');
    
    // 회원가입 성공 확인 (대시보드로 리다이렉트)
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=E2E Test User')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.click('text=로그인');
    
    // 로그인 폼 작성
    await page.fill('[data-testid="login-email"]', 'test@example.com');
    await page.fill('[data-testid="login-password"]', 'testpassword123');
    
    // 로그인 제출
    await page.click('[data-testid="login-submit"]');
    
    // 로그인 성공 확인
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('text=로그인');
    
    await page.fill('[data-testid="login-email"]', 'invalid@example.com');
    await page.fill('[data-testid="login-password"]', 'wrongpassword');
    
    await page.click('[data-testid="login-submit"]');
    
    // 에러 메시지 확인
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=잘못된 이메일 또는 비밀번호')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // 먼저 로그인
    await page.click('text=로그인');
    await page.fill('[data-testid="login-email"]', 'test@example.com');
    await page.fill('[data-testid="login-password"]', 'testpassword123');
    await page.click('[data-testid="login-submit"]');
    
    // 로그아웃
    await page.click('[data-testid="user-menu"]');
    await page.click('text=로그아웃');
    
    // 로그아웃 확인 (홈페이지로 리다이렉트)
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=로그인')).toBeVisible();
  });
});

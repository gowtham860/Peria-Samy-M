const { test, expect } = require('@playwright/test');

test.describe('SkillPath AI End-to-End Test Suite', () => {

  test('1. Landing page loads correctly with branding and theme switch', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SkillPath AI/i);

    // Verify logo and headline
    const headline = page.locator('h1');
    await expect(headline).toContainText(/Master Any Skill with/i);

    // Verify theme toggle switch
    const themeBtn = page.locator('.theme-toggle-btn').first();
    await themeBtn.click();
    const htmlTheme = await page.locator('html').getAttribute('data-theme');
    expect(htmlTheme).toBe('dark');
  });

  test('2. User registration and modal interaction', async ({ page }) => {
    await page.goto('/');
    
    // Open Register tab in modal
    await page.click('button[data-open-auth][data-tab="register"]');
    const modal = page.locator('#auth-modal');
    await expect(modal).toHaveClass(/active/);

    // Fill form
    await page.fill('#reg-name', 'Alex Morgan');
    await page.fill('#reg-email', 'alex@example.com');
    await page.fill('#reg-password', 'SecretPass123!');
    await page.click('#register-form button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard\.html/);
  });

  test('3. Invalid form inputs handled with error states', async ({ page }) => {
    await page.goto('/');
    await page.click('button[data-open-auth][data-tab="login"]');

    // Submit without valid email
    await page.fill('#login-email', 'invalid-email');
    await page.fill('#login-password', '123');
    await page.click('#login-form button[type="submit"]');

    const errorEl = page.locator('#auth-login-view .form-error');
    await expect(errorEl).toBeVisible();
    await expect(errorEl).toContainText(/valid email/i);
  });

  test('4. Roadmap generator creates structured milestones', async ({ page }) => {
    await page.goto('/planner.html');
    await expect(page.locator('.page-title')).toContainText(/Roadmap Generator/i);

    // Select skill and submit
    await page.fill('#skill-input', 'Full-Stack Web Development');
    await page.selectOption('#level-select', 'beginner');
    await page.selectOption('#duration-select', '4');

    await page.click('#planner-form button[type="submit"]');

    // Wait for results
    const results = page.locator('#planner-results');
    await expect(results).toBeVisible({ timeout: 10000 });
    await expect(results).toContainText(/Roadmap/i);
    await expect(results.locator('.milestone-item')).toHaveCount(4);
  });

  test('5. Adaptive quiz system scoring and review', async ({ page }) => {
    await page.goto('/quizzes.html');
    await expect(page.locator('.page-title')).toContainText(/Adaptive Technical Practice/i);

    // Launch quiz
    await page.click('#quiz-launcher-form button[type="submit"]');

    // Wait for runner
    const runner = page.locator('#quiz-runner-view');
    await expect(runner).toBeVisible();

    // Select answer for question 1 and advance
    await page.locator('.quiz-option-card').first().click();
    
    // Complete questions
    for (let i = 0; i < 4; i++) {
      const nextBtn = page.locator('#quiz-next-btn');
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.locator('.quiz-option-card').first().click();
      }
    }

    // Submit quiz
    const submitBtn = page.locator('#quiz-submit-btn');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    }

    // Check results view
    const resultsView = page.locator('#quiz-results-view');
    await expect(resultsView).toBeVisible();
    await expect(page.locator('#quiz-score-display')).toBeVisible();
  });

  test('6. AI Tutor conversational assistant interaction', async ({ page }) => {
    await page.goto('/assistant.html');
    await expect(page.locator('.chat-container')).toBeVisible();

    // Send a question
    await page.fill('#chat-input', 'Explain JavaScript promises simply');
    await page.click('#chat-form button[type="submit"]');

    // Verify AI response arrives
    const aiBubble = page.locator('.message-ai').nth(1);
    await expect(aiBubble).toBeVisible({ timeout: 10000 });
  });

  test('7. Resource Explorer filter and search', async ({ page }) => {
    await page.goto('/resources.html');
    await expect(page.locator('#resources-grid .card')).toHaveCount(6);

    // Filter by DevOps
    await page.click('button[data-category="devops"]');
    const cards = page.locator('#resources-grid .card');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText(/Docker/i);
  });

  test('8. Dashboard progress metrics and study logging', async ({ page }) => {
    await page.goto('/dashboard.html');
    await expect(page.locator('#stat-active-plans')).toBeVisible();

    // Click quick study log +30m
    await page.locator('.quick-log-btn[data-minutes="30"]').click();
    const toast = page.locator('.toast');
    await expect(toast).toContainText(/Logged 30 minutes/i);
  });

  test('9. Mobile responsive drawer navigation', async ({ page, isMobile }) => {
    if (!isMobile) return;

    await page.goto('/dashboard.html');
    const drawerBtn = page.locator('.mobile-menu-btn');
    await expect(drawerBtn).toBeVisible();

    await drawerBtn.click();
    const sidebar = page.locator('.app-sidebar');
    await expect(sidebar).toHaveClass(/open/);
  });

  test('10. Account deletion and data cleanup', async ({ page }) => {
    await page.goto('/profile.html');
    page.on('dialog', dialog => dialog.accept());

    await page.click('#delete-account-btn');
    await expect(page).toHaveURL(/index\.html/);
  });

});

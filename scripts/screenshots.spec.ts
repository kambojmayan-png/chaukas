import { test, expect, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});

const SCREENS_DIR = path.resolve(process.cwd(), 'docs/screens');

async function prepCapture(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

test('generate screenshots', async ({ page }) => {
  fs.mkdirSync(SCREENS_DIR, { recursive: true });

  // 1. 01-home.png: the home screen ("/?fast=1")
  await page.goto('/?fast=1');
  await page.waitForLoadState('domcontentloaded');
  const homeStartBtn = page.locator('button:has-text("शुरू करें"), button:has-text("Start")').first();
  await expect(homeStartBtn).toBeVisible({ timeout: 10000 });
  await prepCapture(page);
  await page.screenshot({ path: path.join(SCREENS_DIR, '01-home.png') });

  // Walk into the first practice
  await homeStartBtn.click();

  // Sound Check
  const soundYes = page.locator('button:has-text("सुनाई दे रही है"), button:has-text("Yes, I can hear")').first();
  await expect(soundYes).toBeVisible({ timeout: 10000 });
  await soundYes.click();

  // Welcome
  const welcomeNext = page.locator('button:has-text("आगे बढ़ें"), button:has-text("Continue")').first();
  await expect(welcomeNext).toBeVisible({ timeout: 10000 });
  await welcomeNext.click();

  // How it works
  const howtoNext = page.locator('button:has-text("आगे बढ़ें"), button:has-text("Continue")').first();
  await expect(howtoNext).toBeVisible({ timeout: 10000 });
  await howtoNext.click();

  // Practice PIN
  const pinNext = page.locator('button:has-text("आगे बढ़ें"), button:has-text("Continue")').first();
  await expect(pinNext).toBeVisible({ timeout: 10000 });
  await pinNext.click();

  // Question (precheck)
  const questionYes = page.locator('button:has-text("हाँ"), button:has-text("Yes")').first();
  await expect(questionYes).toBeVisible({ timeout: 10000 });
  await questionYes.click();

  // Situation (setup)
  const setupNext = page.locator('button:has-text("आगे बढ़ें"), button:has-text("Continue")').first();
  await expect(setupNext).toBeVisible({ timeout: 10000 });
  await setupNext.click();

  // Conversation Node 1: Choose Option 1 (Great! Please send payment)
  const choice1Btn = page.locator('button:has-text("पेमेंट भेज दीजिए"), button:has-text("send the payment")').first();
  await expect(choice1Btn).toBeVisible({ timeout: 10000 });
  await choice1Btn.click();

  // Conversation Node 2: Buyer's second message with three numbered choices
  // 2. 02-message.png: first practice, conversation screen showing buyer's second message with three choices
  const choice2Btn = page.locator('button:has-text("QR कोड स्कैन करें"), button:has-text("Scan the QR")').first();
  await expect(choice2Btn).toBeVisible({ timeout: 10000 });
  await prepCapture(page);
  await page.screenshot({ path: path.join(SCREENS_DIR, '02-message.png') });

  // Go along with the buyer (Option 1) until the PIN pad
  await choice2Btn.click();

  // 3. 03-pin.png: capture PIN pad with "₹4,500 का भुगतान…" line visible and no digits typed
  const pinDetail = page.locator('text=₹4,500 का भुगतान').first();
  await expect(pinDetail).toBeVisible({ timeout: 10000 });
  await prepCapture(page);
  await page.screenshot({ path: path.join(SCREENS_DIR, '03-pin.png') });

  // Enter the practice PIN 4 8 2 7
  await page.locator('button:has-text("4")').first().click();
  await page.locator('button:has-text("8")').first().click();
  await page.locator('button:has-text("2")').first().click();
  await page.locator('button:has-text("7")').first().click();
  await page.locator('button:has-text("ठीक है"), button:has-text("OK")').first().click();

  // Result screen -> Continue past the result to the lesson
  const resultSeeHowBtn = page.locator('button:has-text("देखें कैसे"), button:has-text("See how")').first();
  await expect(resultSeeHowBtn).toBeVisible({ timeout: 10000 });
  await resultSeeHowBtn.click();

  // 4. 04-lesson.png: capture lesson screen with trick cards and rule
  const lessonNextBtn = page.locator('button:has-text("आगे बढ़ें"), button:has-text("Continue")').first();
  await expect(lessonNextBtn).toBeVisible({ timeout: 10000 });
  await prepCapture(page);
  await page.screenshot({ path: path.join(SCREENS_DIR, '04-lesson.png') });

  // 5. 05-check.png: "/check?fast=1", tap electricity example chip, tap Check, capture verdict card with highlights
  await page.goto('/check?fast=1');
  await page.waitForLoadState('domcontentloaded');
  const elecChip = page.locator('button:has-text("बिजली कटने का SMS"), button:has-text("Electricity Disconnection")').first();
  await expect(elecChip).toBeVisible({ timeout: 10000 });
  await elecChip.click();

  const checkBtn = page.locator('button:has-text("मैसेज जाँचें"), button:has-text("Check message"), button:has-text("Check")').first();
  await expect(checkBtn).toBeVisible({ timeout: 10000 });
  await checkBtn.click();

  const verdictRegion = page.locator('[role="region"][aria-label*="जाँच का नतीजा"], [role="region"][aria-label*="Verdict"], [role="region"]:has(mark)').first();
  await expect(verdictRegion).toBeVisible({ timeout: 10000 });
  await verdictRegion.scrollIntoViewIfNeeded();
  await prepCapture(page);
  await page.screenshot({ path: path.join(SCREENS_DIR, '05-check.png') });

  // 6. 06-insights.png: "/insights?fast=1", capture top of page (gap and per-practice bars)
  await page.goto('/insights?fast=1');
  await page.waitForLoadState('domcontentloaded');
  await prepCapture(page);
  const bodyHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const clipHeight = Math.min(1600, Math.max(844, bodyHeight));
  await page.screenshot({
    path: path.join(SCREENS_DIR, '06-insights.png'),
    clip: { x: 0, y: 0, width: 390, height: clipHeight },
  });
});

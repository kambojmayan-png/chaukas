import { test, expect, Page, Locator } from '@playwright/test';

const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 360, height: 800 },
  { width: 412, height: 915 },
];

async function assertScreenLayout(
  page: Page,
  options: {
    screenName: string;
    isPracticeScreen?: boolean;
    primaryButtonLocator?: Locator;
  }
) {
  // 1. document.documentElement.scrollWidth <= window.innerWidth + 1
  const scrollWidthCheck = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      ok: document.documentElement.scrollWidth <= window.innerWidth + 1,
    };
  });
  expect(
    scrollWidthCheck.ok,
    `${options.screenName}: scrollWidth (${scrollWidthCheck.scrollWidth}) <= innerWidth + 1 (${scrollWidthCheck.innerWidth + 1})`
  ).toBe(true);

  // 2. every visible button's right edge <= window.innerWidth
  const buttonsCheck = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const innerWidth = window.innerWidth;
    const overflowing: { text: string; right: number; innerWidth: number }[] = [];
    for (const b of buttons) {
      const rect = b.getBoundingClientRect();
      const style = window.getComputedStyle(b);
      const isVisible =
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        style.opacity !== '0';
      if (isVisible) {
        // Allow tiny sub-pixel tolerance of 1px
        if (rect.right > innerWidth + 1) {
          overflowing.push({
            text: b.innerText.trim().slice(0, 30),
            right: rect.right,
            innerWidth,
          });
        }
      }
    }
    return { overflowing };
  });
  expect(
    buttonsCheck.overflowing,
    `${options.screenName}: visible buttons right edge <= innerWidth`
  ).toEqual([]);

  // 3. the primary button's bottom edge <= window.innerHeight
  if (options.primaryButtonLocator) {
    const primaryBox = await options.primaryButtonLocator.boundingBox();
    expect(
      primaryBox,
      `${options.screenName}: primary button must be visible`
    ).not.toBeNull();
    const innerHeight = await page.evaluate(() => window.innerHeight);
    const bottom = primaryBox!.y + primaryBox!.height;
    expect(
      bottom,
      `${options.screenName}: primary button bottom (${bottom}) <= innerHeight (${innerHeight})`
    ).toBeLessThanOrEqual(innerHeight + 1);
  }

  // 4. and a "Hear again" button exists on practice screens
  if (options.isPracticeScreen) {
    const replayButton = page
      .locator('button:has-text("Hear again"), button:has-text("फिर से सुनें")')
      .first();
    await expect(
      replayButton,
      `${options.screenName}: "Hear again" button exists on practice screen`
    ).toBeVisible();
  }
}

for (const vp of VIEWPORTS) {
  test.describe(`Mobile layout check at ${vp.width}x${vp.height}`, () => {
    test.use({ viewport: vp });

    test(`walk practice flow at ${vp.width}x${vp.height}`, async ({ page }) => {
      // 1. Home screen
      await page.goto('/?fast=1');
      await page.waitForLoadState('domcontentloaded');

      const homeStartBtn = page
        .locator('button:has-text("शुरू करें"), button:has-text("Start")')
        .first();
      await expect(homeStartBtn).toBeVisible();
      await assertScreenLayout(page, {
        screenName: 'Home',
        isPracticeScreen: false,
        primaryButtonLocator: homeStartBtn,
      });

      // Click Start -> Sound Check screen
      await homeStartBtn.click();

      // 2. Sound Check screen
      const soundYesBtn = page
        .locator('button:has-text("सुनाई दे रही है"), button:has-text("Yes, I can hear")')
        .first();
      await expect(soundYesBtn).toBeVisible({ timeout: 10000 });
      await assertScreenLayout(page, {
        screenName: 'Sound Check',
        isPracticeScreen: false,
        primaryButtonLocator: soundYesBtn,
      });

      // Click Sound Yes -> Welcome (explain screens 1/2)
      await soundYesBtn.click();

      // 3. Explain screens: Welcome
      const welcomeNextBtn = page
        .locator('button:has-text("आगे बढ़ें"), button:has-text("Continue")')
        .first();
      await expect(welcomeNextBtn).toBeVisible({ timeout: 10000 });
      await assertScreenLayout(page, {
        screenName: 'Explain - Welcome',
        isPracticeScreen: false,
        primaryButtonLocator: welcomeNextBtn,
      });

      // Click Next -> Howto (explain screens 2/2)
      await welcomeNextBtn.click();

      // Explain screens: How it works
      const howtoNextBtn = page
        .locator('button:has-text("आगे बढ़ें"), button:has-text("Continue")')
        .first();
      await expect(howtoNextBtn).toBeVisible({ timeout: 10000 });
      await assertScreenLayout(page, {
        screenName: 'Explain - How it works',
        isPracticeScreen: false,
        primaryButtonLocator: howtoNextBtn,
      });

      // Click Next -> Practice PIN screen
      await howtoNextBtn.click();

      // 4. PIN screen
      const pinNextBtn = page
        .locator('button:has-text("आगे बढ़ें"), button:has-text("Continue")')
        .first();
      await expect(pinNextBtn).toBeVisible({ timeout: 10000 });
      await assertScreenLayout(page, {
        screenName: 'PIN screen',
        isPracticeScreen: false,
        primaryButtonLocator: pinNextBtn,
      });

      // Click Next -> Question (precheck) screen
      await pinNextBtn.click();

      // 5. Question (precheck) screen
      const questionYesBtn = page
        .locator('button:has-text("हाँ"), button:has-text("Yes")')
        .first();
      await expect(questionYesBtn).toBeVisible({ timeout: 10000 });
      await assertScreenLayout(page, {
        screenName: 'Question (precheck)',
        isPracticeScreen: true,
        primaryButtonLocator: questionYesBtn,
      });

      // Click Yes -> Situation (setup) screen
      await questionYesBtn.click();

      // 6. Situation (setup) screen
      const setupNextBtn = page
        .locator('button:has-text("आगे बढ़ें"), button:has-text("Continue")')
        .first();
      await expect(setupNextBtn).toBeVisible({ timeout: 10000 });
      await assertScreenLayout(page, {
        screenName: 'Situation (setup)',
        isPracticeScreen: true,
        primaryButtonLocator: setupNextBtn,
      });

      // Click Next -> Conversation screen
      await setupNextBtn.click();

      // 7. Conversation: Node 1 -> choose Option 1
      const choice1Btn = page
        .locator('button:has-text("पेमेंट भेज दीजिए"), button:has-text("send the payment")')
        .first();
      await expect(choice1Btn).toBeVisible({ timeout: 10000 });
      await assertScreenLayout(page, {
        screenName: 'Conversation Node 1',
        isPracticeScreen: true,
        primaryButtonLocator: choice1Btn,
      });

      // Click Option 1 -> Node 2
      await choice1Btn.click();

      // Conversation: Node 2 -> choose Option 1
      const choice2Btn = page
        .locator('button:has-text("QR कोड स्कैन करें"), button:has-text("Scan the QR")')
        .first();
      await expect(choice2Btn).toBeVisible({ timeout: 10000 });
      await assertScreenLayout(page, {
        screenName: 'Conversation Node 2',
        isPracticeScreen: true,
        primaryButtonLocator: choice2Btn,
      });

      // Click Option 1 -> Keypad screen
      await choice2Btn.click();

      // 8. Keypad screen
      const keypadOkBtn = page
        .locator('button:has-text("ठीक है"), button:has-text("OK")')
        .first();
      await expect(keypadOkBtn).toBeVisible({ timeout: 10000 });

      // Enter practice PIN 4 8 2 7
      await page.locator('button:has-text("4")').first().click();
      await page.locator('button:has-text("8")').first().click();
      await page.locator('button:has-text("2")').first().click();
      await page.locator('button:has-text("7")').first().click();

      await assertScreenLayout(page, {
        screenName: 'Keypad',
        isPracticeScreen: true,
        primaryButtonLocator: keypadOkBtn,
      });

      // Click OK -> Result screen
      await keypadOkBtn.click();

      // 9. Result screen
      const resultSeeHowBtn = page
        .locator('button:has-text("देखें कैसे"), button:has-text("See how")')
        .first();
      await expect(resultSeeHowBtn).toBeVisible({ timeout: 10000 });
      await assertScreenLayout(page, {
        screenName: 'Result screen',
        isPracticeScreen: true,
        primaryButtonLocator: resultSeeHowBtn,
      });

      // Click See How -> Lesson screen
      await resultSeeHowBtn.click();

      // 10. Lesson screen
      const lessonNextBtn = page
        .locator('button:has-text("आगे बढ़ें"), button:has-text("Continue")')
        .first();
      await expect(lessonNextBtn).toBeVisible({ timeout: 10000 });
      await assertScreenLayout(page, {
        screenName: 'Lesson screen',
        isPracticeScreen: true,
        primaryButtonLocator: lessonNextBtn,
      });
    });

    test(`check secondary pages for no horizontal overflow at ${vp.width}x${vp.height}`, async ({
      page,
    }) => {
      const routes = ['/check?fast=1', '/insights?fast=1', '/about?fast=1', '/judge?fast=1', '/drill?fast=1'];

      for (const route of routes) {
        await page.goto(route);
        await page.waitForLoadState('domcontentloaded');

        const scrollWidthCheck = await page.evaluate(() => {
          return {
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
            ok: document.documentElement.scrollWidth <= window.innerWidth + 1,
          };
        });

        expect(
          scrollWidthCheck.ok,
          `${route} at ${vp.width}x${vp.height}: scrollWidth (${scrollWidthCheck.scrollWidth}) <= innerWidth + 1 (${scrollWidthCheck.innerWidth + 1})`
        ).toBe(true);
      }
    });
  });
}

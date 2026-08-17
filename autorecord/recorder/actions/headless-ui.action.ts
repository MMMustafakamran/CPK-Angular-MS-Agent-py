import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';
import { waitForAgentResponseCompletion } from './index';

export const runHeadlessUiAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   🧩 [Headless UI Action]: Testing custom composer & transcript on injectAgentStore...`);

  // Wait for the custom textarea
  const textarea = page.locator('textarea[aria-label="Message"], app-headless-chat textarea').first();
  await textarea.waitFor({ state: 'visible', timeout: 15000 });
  await sleep(600);

  const box = await textarea.boundingBox();
  if (box) {
    await humanGlide(page, box.x + 80, box.y + box.height / 2, 22);
    await humanClick(page);
  } else {
    await textarea.click();
  }
  await sleep(300);

  const prompt = config.prompt || 'Tell me a short joke about Angular';
  for (const char of prompt) {
    await page.keyboard.type(char, { delay: 40 });
  }
  await sleep(500);

  // Click custom "Send" button
  const sendBtn = page.locator('app-headless-chat button:has-text("Send"), button:has-text("Send")').first();
  if (await sendBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    const btnBox = await sendBtn.boundingBox();
    if (btnBox) {
      console.log(`   👉 Clicking custom Headless Send button...`);
      await humanGlide(page, btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2, 20);
      await sleep(300);
      await humanClick(page);
    } else {
      await sendBtn.click();
    }
  }

  // Detect and wait for headless response streaming
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000);
};

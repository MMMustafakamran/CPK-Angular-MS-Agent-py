import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';
import { waitForAgentResponseCompletion } from './index';

export const runSharedStateAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   🔄 [Shared State & Context Action]: Testing two-way state & contexts...`);

  // 1. Click "Mark high priority" button in WorkspaceComponent
  const highPriorityBtn = page.locator('app-workspace button:has-text("Mark high priority")').first();
  if (await highPriorityBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    const btnBox = await highPriorityBtn.boundingBox();
    if (btnBox) {
      console.log(`   👉 Clicking "Mark high priority" button in app-workspace...`);
      await humanGlide(page, btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2, 20);
      await sleep(400);
      await humanClick(page);
    } else {
      await highPriorityBtn.click();
    }
    await sleep(1000);
  }

  // 2. Type question into chat
  const inputLocator = page
    .locator('textarea, input[type="text"], [contenteditable="true"]')
    .first();
  await inputLocator.waitFor({ state: 'visible', timeout: 15000 });

  const inputBox = await inputLocator.boundingBox();
  if (inputBox) {
    await humanGlide(page, inputBox.x + 80, inputBox.y + inputBox.height / 2, 22);
    await humanClick(page);
  } else {
    await inputLocator.click();
  }
  await sleep(400);

  const prompt = config.prompt || 'What is my current priority and what notes do I have?';
  for (const char of prompt) {
    await page.keyboard.type(char, { delay: 40 });
  }
  await sleep(500);

  // Submit prompt
  const sendBtn = page
    .locator(
      'button[type="submit"], button:has-text("Send"), .copilotKitSendButton, button[aria-label*="Send"]',
    )
    .first();

  if (await sendBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    const btnBox = await sendBtn.boundingBox();
    if (btnBox) {
      await humanGlide(page, btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2, 20);
      await humanClick(page);
    } else {
      await sendBtn.click();
    }
  } else {
    await page.keyboard.press('Enter');
  }

  // 3. Wait for AI response completion
  await waitForAgentResponseCompletion(page, 4000);

  // 4. Glide cursor over context panels (Account & Selection contexts)
  const accountContext = page.locator('app-account-context').first();
  if (await accountContext.isVisible({ timeout: 2000 }).catch(() => false)) {
    const ctxBox = await accountContext.boundingBox();
    if (ctxBox) {
      console.log(`   🎯 Showcasing read-only Account & Selection context components...`);
      await humanGlide(page, ctxBox.x + ctxBox.width / 2, ctxBox.y + ctxBox.height / 2, 22);
      await sleep(1500);
    }
  }
};

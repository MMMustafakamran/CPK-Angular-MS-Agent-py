import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';
import { waitForAgentResponseCompletion } from './index';

export const runHitlAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   🛡️ [Human-In-The-Loop Action]: Triggering decision tool confirmation...`);

  const inputLocator = page
    .locator('textarea, input[type="text"], [contenteditable="true"]')
    .first();
  await inputLocator.waitFor({ state: 'visible', timeout: 15000 });
  await sleep(600);

  const inputBox = await inputLocator.boundingBox();
  if (inputBox) {
    await humanGlide(page, inputBox.x + 80, inputBox.y + inputBox.height / 2, 22);
    await humanClick(page);
  } else {
    await inputLocator.click();
  }
  await sleep(400);

  const prompt = config.prompt || 'Delete my account, but ask me to approve it first.';
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

  // Wait for Approval Card to appear on screen
  console.log(`   ⏳ Waiting for HITL Approval Card (app-approval-card)...`);
  const approvalCard = page.locator('app-approval-card, article:has-text("Approve")').first();
  await approvalCard.waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
  await sleep(1500);

  // Locate the "Approve" button
  const approveBtn = page
    .locator('app-approval-card button:has-text("Approve"), button:has-text("Approve")')
    .first();

  if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    const btnBox = await approveBtn.boundingBox();
    if (btnBox) {
      console.log(`   👉 Human-like glide to "Approve" decision button...`);
      await humanGlide(
        page,
        btnBox.x + btnBox.width / 2,
        btnBox.y + btnBox.height / 2,
        22,
      );
      await sleep(600);
      await humanClick(page);
      console.log(`   ✅ Clicked "Approve" decision button.`);
    } else {
      await approveBtn.click();
    }
  }

  // Wait for agent to resume execution and stream completion
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000);
};

import { type Page } from 'playwright';
import { humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';
import { runStandardAction } from './index';

export const runVoiceAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   🎙️ [Voice & Multimodal Action]: Showcasing microphone & attachments...`);

  // Glide cursor over chat input area and attachment/mic affordance
  const inputLocator = page
    .locator('textarea, input[type="text"], [contenteditable="true"]')
    .first();
  await inputLocator.waitFor({ state: 'visible', timeout: 15000 });
  await sleep(600);

  const micBtn = page.locator('button[aria-label*="voice"], button[aria-label*="mic"], [class*="voice"], [class*="mic"]').first();
  if (await micBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    const micBox = await micBtn.boundingBox();
    if (micBox) {
      await humanGlide(page, micBox.x + micBox.width / 2, micBox.y + micBox.height / 2, 22);
      await sleep(1000);
    }
  }

  // Execute standard prompt
  await runStandardAction(page, config, '');
};

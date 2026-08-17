import { type Page } from 'playwright';
import { humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';
import { runStandardAction } from './index';

export const runMemoryAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   🧠 [Memory Action]: Showcasing injectMemories and fallback panel...`);

  // Glide cursor over memory list panel on the left
  const memoryPanel = page.locator('app-memory-list, section:has-text("injectMemories")').first();
  if (await memoryPanel.isVisible({ timeout: 4000 }).catch(() => false)) {
    const memBox = await memoryPanel.boundingBox();
    if (memBox) {
      await humanGlide(page, memBox.x + memBox.width / 2, memBox.y + 60, 22);
      await sleep(1500);
    }
  }

  // Execute standard chat prompt
  await runStandardAction(page, config, '');
};

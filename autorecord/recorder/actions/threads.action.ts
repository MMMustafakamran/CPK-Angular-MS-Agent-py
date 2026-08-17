import { type Page } from 'playwright';
import { humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';
import { runStandardAction } from './index';

export const runThreadsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   🧵 [Threads Action]: Showcasing thread list & CopilotThreadsDrawer...`);

  // Glide cursor over the Headless list (injectThreads)
  const threadList = page.locator('app-thread-list').first();
  if (await threadList.isVisible({ timeout: 4000 }).catch(() => false)) {
    const listPort = await threadList.boundingBox();
    if (listPort) {
      await humanGlide(page, listPort.x + listPort.width / 2, listPort.y + 40, 22);
      await sleep(1500);
    }
  }

  // Glide cursor over CopilotThreadsDrawer
  const drawer = page.locator('app-conversations').first();
  if (await drawer.isVisible({ timeout: 4000 }).catch(() => false)) {
    const drawerPort = await drawer.boundingBox();
    if (drawerPort) {
      await humanGlide(page, drawerPort.x + 100, drawerPort.y + 60, 22);
      await sleep(1500);
    }
  }

  // Execute standard chat prompt
  await runStandardAction(page, config, '');
};

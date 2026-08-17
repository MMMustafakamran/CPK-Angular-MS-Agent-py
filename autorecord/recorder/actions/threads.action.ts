import { type Page } from 'playwright';
import { humanGlide, sleep } from '../overlays/cursor';
import { closeNotepadNote, showNotepadNote } from '../overlays/notepad';
import { type PageActionHandler, type PageRecordConfig } from '../types';

export const runThreadsAction: PageActionHandler = async (
  page: Page,
  _config: PageRecordConfig,
) => {
  console.log(`   🧵 [Threads Action]: Showcasing thread list, drawer & cloud auth note in Notepad...`);

  // 1. Wait for thread sections to render
  const threadList = page.locator('app-thread-list').first();
  await threadList.waitFor({ state: 'visible', timeout: 15000 });
  await sleep(600);

  // 2. Glide cursor over the Headless list (injectThreads)
  const listPort = await threadList.boundingBox();
  if (listPort) {
    console.log(`   👉 Gliding cursor over Headless thread list (injectThreads)...`);
    await humanGlide(page, listPort.x + listPort.width / 2, listPort.y + 40, 22);
    await sleep(1200);
  }

  // 3. Glide cursor over CopilotThreadsDrawer
  const drawer = page.locator('app-conversations').first();
  if (await drawer.isVisible({ timeout: 4000 }).catch(() => false)) {
    const drawerPort = await drawer.boundingBox();
    if (drawerPort) {
      console.log(`   👉 Gliding cursor over CopilotThreadsDrawer...`);
      await humanGlide(page, drawerPort.x + 120, drawerPort.y + 60, 22);
      await sleep(1200);
    }
  }

  // 4. Open Notepad from taskbar and type developer explanation note
  await showNotepadNote(
    page,
    'Threads & Cloud Authentication Note',
    [
      'NOTE: Threads & Cloud Authentication',
      '',
      '- the project isnt authenticated by the copilotkit cloud via browser as the initial setup wasnt done through copilotkit cli',
    ],
  );

  // 5. Smoothly close Notepad overlay
  await closeNotepadNote(page);
  await sleep(1000);
};

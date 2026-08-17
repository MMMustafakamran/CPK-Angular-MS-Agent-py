import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import {
  closeNotepadNote,
  openNotepadWindow,
  typeInNotepad,
} from '../overlays/notepad';
import { waitForAgentResponseCompletion } from './index';
import { type PageActionHandler, type PageRecordConfig } from '../types';

export const runThreadsAction: PageActionHandler = async (
  page: Page,
  _config: PageRecordConfig,
) => {
  console.log(
    `   🧵 [Threads Action]: Testing headless threads, drawer sidebar & typing developer evaluation in Notepad...`,
  );

  // 1. Wait for thread demo components to mount
  const threadList = page.locator('app-thread-list').first();
  await threadList.waitFor({ state: 'visible', timeout: 15000 });
  await sleep(800);

  // 2. Test the Headless list (injectThreads)
  console.log(`   👉 Testing Headless thread list (injectThreads)...`);
  const newBtn = page.locator('app-thread-list button:has-text("New conversation")').first();
  if (await newBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    const box = await newBtn.boundingBox();
    if (box) {
      await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 22);
      await sleep(300);
      await humanClick(page);
      await sleep(1500);
    }
  }

  // Check and click Retry button if present
  const retryBtn = page.locator('app-thread-list button:has-text("Retry")').first();
  if (await retryBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    const rBox = await retryBtn.boundingBox();
    if (rBox) {
      await humanGlide(page, rBox.x + rBox.width / 2, rBox.y + rBox.height / 2, 20);
      await sleep(300);
      await humanClick(page);
      await sleep(1200);
    }
  }

  // 3. Test CopilotThreadsDrawer (show that nothing happens / empty state)
  console.log(`   👉 Testing CopilotThreadsDrawer sidebar...`);
  const drawerEl = page.locator('copilot-threads-drawer').first();
  if (await drawerEl.isVisible({ timeout: 4000 }).catch(() => false)) {
    const dBox = await drawerEl.boundingBox();
    if (dBox) {
      await humanGlide(page, dBox.x + 40, dBox.y + 30, 22);
      await sleep(400);
      await humanClick(page);
      await sleep(1500);
    }
  }

  // 4. Test live chat conversation beside the drawer
  console.log(`   👉 Testing agent chat conversation...`);
  const chatTextarea = page
    .locator('app-conversations textarea.copilot-chat-textarea, app-conversations textarea')
    .first();
  await chatTextarea.waitFor({ state: 'visible', timeout: 10000 });

  const areaBox = await chatTextarea.boundingBox();
  if (areaBox) {
    await humanGlide(page, areaBox.x + 30, areaBox.y + areaBox.height / 2, 22);
    await sleep(250);
    await humanClick(page);
    await sleep(300);

    const testPrompt = 'Hello! Can you help me test multi-turn thread conversations?';
    await chatTextarea.pressSequentially(testPrompt, { delay: 35 });
    await sleep(400);

    // Click Send button
    const sendBtn = page
      .locator('app-conversations button.copilot-chat-send-button, app-conversations button[type="submit"]')
      .first();
    if (await sendBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      const sBox = await sendBtn.boundingBox();
      if (sBox) {
        await humanGlide(page, sBox.x + sBox.width / 2, sBox.y + sBox.height / 2, 20);
        await sleep(200);
        await humanClick(page);
      } else {
        await chatTextarea.press('Enter');
      }
    } else {
      await chatTextarea.press('Enter');
    }

    // Wait for agent token streaming and response completion
    await waitForAgentResponseCompletion(page, 4000);
  }

  // 5. Glide cursor over completed agent response
  const lastMsg = page.locator('app-conversations .copilot-chat-message-assistant').last();
  if (await lastMsg.isVisible({ timeout: 3000 }).catch(() => false)) {
    const msgBox = await lastMsg.boundingBox();
    if (msgBox) {
      await humanGlide(page, msgBox.x + 60, msgBox.y + 40, 22);
      await sleep(1500);
    }
  }

  // 6. Open Windows 11 Notepad and type developer evaluation note
  console.log(`   📝 Opening Notepad to type Threads evaluation note...`);
  await openNotepadWindow(page, 'threads-issue.txt', {
    right: '32px',
    top: '95px',
    width: '680px',
    height: '560px',
  });

  await typeInNotepad(
    page,
    [
      'Issue in Threads & CopilotThreadsDrawer:',
      '',
      '- integrated ThreadListComponent (injectThreads) and CopilotThreadsDrawer from @copilotkit/angular',
      '- headless list shows "Loading conversations..." / no threads returned',
      '- CopilotThreadsDrawer sidebar does not load threads (requires CopilotKit Cloud auth / CLI setup)',
      '- chat conversation with agent works properly, but threads drawer is non-functional',
      '',
      'Package versions used:',
      '- @angular/core & @angular/cdk: 22.1.x',
      '- @copilotkit/angular: 0.3.1',
      '- @copilotkit/runtime: 1.68.1',
      '- @ag-ui/client: 0.0.57',
    ],
    1550,
    280,
  );

  // 7. Reading pause on the completed note
  console.log(`   📖 Pausing for reading typed Notepad error report...`);
  await sleep(5000);

  // 8. Smoothly close Notepad overlay
  await closeNotepadNote(page);
  await sleep(1200);
};

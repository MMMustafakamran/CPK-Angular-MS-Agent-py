import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';
import { runStandardAction, waitForAgentResponseCompletion } from './index';

export const runChatUiAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   🎨 [Chat UI Action]: Testing 4 Angular chat surfaces...`);

  // 1. Tab 1: Inline Chat (SupportChatComponent with scoped CSS)
  console.log(`   👉 Tab 1: Testing Inline Chat with scoped bubble styles...`);
  await runStandardAction(page, config, '');

  // 2. Tab 2: Custom Assistant Message
  console.log(`   👉 Tab 2: Switching to Custom Assistant Message tab...`);
  const customTab = page.locator('button[role="tab"]:has-text("Custom assistant message")');
  if (await customTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    const box = await customTab.boundingBox();
    if (box) {
      await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
      await humanClick(page);
    } else {
      await customTab.click();
    }
    await sleep(2000);

    // Glide cursor over the custom message surface
    const customChat = page.locator('app-custom-message-chat').first();
    if (await customChat.isVisible({ timeout: 2000 }).catch(() => false)) {
      const chatBox = await customChat.boundingBox();
      if (chatBox) {
        await humanGlide(page, chatBox.x + chatBox.width / 2, chatBox.y + 150, 22);
      }
    }
    await sleep(1500);
  }

  // 3. Tab 3: Popup Surface
  console.log(`   👉 Tab 3: Switching to Popup tab & testing copilot-popup...`);
  const popupTab = page.locator('button[role="tab"]:has-text("Popup")');
  if (await popupTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    const box = await popupTab.boundingBox();
    if (box) {
      await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
      await humanClick(page);
    } else {
      await popupTab.click();
    }
    await sleep(1000);

    // Click "Open popup" button
    const openPopupBtn = page.locator('button:has-text("Open popup"), button:has-text("popup")').first();
    if (await openPopupBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      const btnBox = await openPopupBtn.boundingBox();
      if (btnBox) {
        await humanGlide(page, btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2, 20);
        await humanClick(page);
      } else {
        await openPopupBtn.click();
      }
      await sleep(2000);

      // Glide over open popup window
      await humanGlide(page, 960, 540, 22);
      await sleep(1500);

      // Close popup
      const closePopupBtn = page.locator('button:has-text("Close popup")').first();
      if (await closePopupBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        const closeBox = await closePopupBtn.boundingBox();
        if (closeBox) {
          await humanGlide(page, closeBox.x + closeBox.width / 2, closeBox.y + closeBox.height / 2, 20);
          await humanClick(page);
        }
      }
    }
  }

  // 4. Tab 4: Sidebar Surface
  console.log(`   👉 Tab 4: Switching to Sidebar tab & testing copilot-sidebar...`);
  const sidebarTab = page.locator('button[role="tab"]:has-text("Sidebar")');
  if (await sidebarTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    const box = await sidebarTab.boundingBox();
    if (box) {
      await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
      await humanClick(page);
    } else {
      await sidebarTab.click();
    }
    await sleep(1000);

    // Click "Open sidebar" button
    const openSidebarBtn = page.locator('button:has-text("Open sidebar"), button:has-text("sidebar")').first();
    if (await openSidebarBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      const btnBox = await openSidebarBtn.boundingBox();
      if (btnBox) {
        await humanGlide(page, btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2, 20);
        await humanClick(page);
      } else {
        await openSidebarBtn.click();
      }
      await sleep(2000);

      // Glide over docked sidebar
      await humanGlide(page, 1600, 500, 22);
      await sleep(1500);
    }
  }

  // Switch back to Inline chat tab for neat final frame
  const inlineTab = page.locator('button[role="tab"]:has-text("Inline chat")');
  if (await inlineTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    const box = await inlineTab.boundingBox();
    if (box) {
      await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
      await humanClick(page);
    }
    await sleep(1500);
  }
};

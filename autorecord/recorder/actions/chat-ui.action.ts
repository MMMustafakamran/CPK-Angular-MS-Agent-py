import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';
import { runStandardAction, waitForAgentResponseCompletion } from './index';

export const runChatUiAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   🎨 [Chat UI Action]: Testing 4 Angular chat surfaces with prompt and toggle interactions...`);

  // =========================================================================
  // 1. Tab 1: Inline Chat (SupportChatComponent with scoped CSS)
  // =========================================================================
  console.log(`   👉 Tab 1: Testing Inline Chat with scoped bubble styles...`);
  await runStandardAction(page, config, '');

  // =========================================================================
  // 2. Tab 2: Custom Assistant Message
  // =========================================================================
  console.log(`   👉 Tab 2: Switching to Custom Assistant Message tab...`);
  const customTab = page.locator('button[role="tab"]:has-text("Custom assistant message")');
  await customTab.waitFor({ state: 'visible', timeout: 5000 });
  const customTabBox = await customTab.boundingBox();
  if (customTabBox) {
    await humanGlide(page, customTabBox.x + customTabBox.width / 2, customTabBox.y + customTabBox.height / 2, 20);
    await humanClick(page);
  } else {
    await customTab.click();
  }
  await sleep(1000);

  // Prompt the custom assistant chat
  console.log(`   💬 Tab 2: Typing prompt into Custom Assistant Message chat...`);
  const customTextarea = page.locator('app-custom-message-chat textarea, app-custom-message-chat input[type="text"]').first();
  await customTextarea.waitFor({ state: 'visible', timeout: 8000 });

  const customAreaBox = await customTextarea.boundingBox();
  if (customAreaBox) {
    await humanGlide(page, customAreaBox.x + 80, customAreaBox.y + customAreaBox.height / 2, 20);
    await humanClick(page);
  } else {
    await customTextarea.click();
  }
  await sleep(400);

  const customPrompt = 'Tell me what makes your custom assistant layout unique.';
  for (const char of customPrompt) {
    await page.keyboard.type(char, { delay: 40 });
  }
  await sleep(500);

  // Click Send button in Custom Assistant chat
  const customSendBtn = page.locator('app-custom-message-chat button[aria-label="Send message"], app-custom-message-chat button:has-text("Send")').first();
  if (await customSendBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    const sendBox = await customSendBtn.boundingBox();
    if (sendBox) {
      await humanGlide(page, sendBox.x + sendBox.width / 2, sendBox.y + sendBox.height / 2, 20);
      await humanClick(page);
    } else {
      await customSendBtn.click();
    }
  } else {
    await page.keyboard.press('Enter');
  }

  // Wait for custom assistant message response stream and pause 4s
  await waitForAgentResponseCompletion(page, 4000);

  // Glide cursor over the rendered custom assistant component (<article class="answer">)
  const answerArticle = page.locator('app-custom-assistant-message article, article.answer, .support-answer').last();
  if (await answerArticle.isVisible({ timeout: 3000 }).catch(() => false)) {
    const artBox = await answerArticle.boundingBox();
    if (artBox) {
      await humanGlide(page, artBox.x + artBox.width / 2, artBox.y + artBox.height / 2, 22);
      await sleep(1500);
    }
  }

  // =========================================================================
  // 3. Tab 3: Popup Surface
  // =========================================================================
  console.log(`   👉 Tab 3: Switching to Popup tab & testing copilot-popup...`);
  const popupTab = page.locator('button[role="tab"]:has-text("Popup")');
  await popupTab.waitFor({ state: 'visible', timeout: 5000 });
  const popupTabBox = await popupTab.boundingBox();
  if (popupTabBox) {
    await humanGlide(page, popupTabBox.x + popupTabBox.width / 2, popupTabBox.y + popupTabBox.height / 2, 20);
    await humanClick(page);
  } else {
    await popupTab.click();
  }
  await sleep(1000);

  // Click "Open popup" button
  const openPopupBtn = page.locator('button:has-text("Open popup"), button:has-text("popup")').first();
  await openPopupBtn.waitFor({ state: 'visible', timeout: 5000 });
  const openPopupBox = await openPopupBtn.boundingBox();
  if (openPopupBox) {
    console.log(`   👉 Clicking "Open popup" button...`);
    await humanGlide(page, openPopupBox.x + openPopupBox.width / 2, openPopupBox.y + openPopupBox.height / 2, 20);
    await humanClick(page);
  } else {
    await openPopupBtn.click();
  }
  await sleep(2000);

  // Glide over open popup window (bottom-right area)
  console.log(`   👉 Showcasing open copilot-popup window...`);
  await humanGlide(page, 1580, 720, 22);
  await sleep(1800);

  // =========================================================================
  // 4. Tab 4: Sidebar Surface
  // =========================================================================
  console.log(`   👉 Tab 4: Switching to Sidebar tab & testing copilot-sidebar...`);
  const sidebarTab = page.locator('button[role="tab"]:has-text("Sidebar")');
  await sidebarTab.waitFor({ state: 'visible', timeout: 5000 });

  // Click Sidebar tab (1st click dismisses popup if open)
  const sidebarTabBox = await sidebarTab.boundingBox();
  if (sidebarTabBox) {
    await humanGlide(page, sidebarTabBox.x + sidebarTabBox.width / 2, sidebarTabBox.y + sidebarTabBox.height / 2, 20);
    await humanClick(page);
  } else {
    await sidebarTab.click();
  }
  await sleep(600);

  // Ensure sidebar tab is active (click a 2nd time if popup backdrop absorbed the 1st click)
  const openSidebarBtn = page.locator('button:has-text("Open sidebar"), button:has-text("sidebar")').first();
  if (!(await openSidebarBtn.isVisible({ timeout: 1200 }).catch(() => false))) {
    console.log(`   👉 Re-clicking Sidebar tab to activate surface...`);
    if (sidebarTabBox) {
      await humanGlide(page, sidebarTabBox.x + sidebarTabBox.width / 2, sidebarTabBox.y + sidebarTabBox.height / 2, 15);
      await humanClick(page);
    } else {
      await sidebarTab.click();
    }
    await sleep(800);
  }

  // Click "Open sidebar" button
  await openSidebarBtn.waitFor({ state: 'visible', timeout: 5000 });
  const openSidebarBox = await openSidebarBtn.boundingBox();
  if (openSidebarBox) {
    console.log(`   👉 Clicking "Open sidebar" button...`);
    await humanGlide(page, openSidebarBox.x + openSidebarBox.width / 2, openSidebarBox.y + openSidebarBox.height / 2, 20);
    await humanClick(page);
  } else {
    await openSidebarBtn.click();
  }
  await sleep(2000);

  // Glide over docked sidebar on the right side
  console.log(`   👉 Showcasing docked copilot-sidebar...`);
  await humanGlide(page, 1680, 480, 22);
  await sleep(2200);

  console.log(`✅ Completed Chat UI 4-surface showcase.`);
};

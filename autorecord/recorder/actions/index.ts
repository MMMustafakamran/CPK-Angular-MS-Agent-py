import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';
import { runA2uiAction } from './a2ui.action';
import { runAttachmentsAction } from './attachments.action';
import { runChatUiAction } from './chat-ui.action';
import { runHeadlessUiAction } from './headless-ui.action';
import { runHitlAction } from './hitl.action';
import { runMemoryAction } from './memory.action';
import { runSharedStateAction } from './shared-state.action';
import { runThreadsAction } from './threads.action';
import { runToolsAction } from './tools.action';
import { runVoiceAction } from './voice.action';

const ASSISTANT_SELECTORS = [
  '.copilotKitAssistantMessage',
  '[data-message-role="assistant"]',
  '[data-role="assistant"]',
  'article[data-role="assistant"]',
  'app-custom-assistant-message',
  'article.answer',
  '.support-answer',
  '.answer',
  'app-weather-card',
  'app-approval-card',
  '.copilotKitMessage:not(:first-child)',
  '[class*="assistant"]',
].join(', ');

/**
 * Actively waits until:
 * 1. An assistant response message appears with text content or tool rendering.
 * 2. Streaming finishes (text content stops changing for 2+ seconds).
 * 3. Glides the mouse over the response and waits postWaitMs (default 4000ms) for reading.
 */
export async function waitForAgentResponseCompletion(
  page: Page,
  postWaitMs = 4000,
): Promise<void> {
  console.log(`   ⏳ Actively detecting AI agent response start & streaming progress...`);

  // Step 1: Wait until assistant message starts receiving content (up to 30s)
  let hasStarted = false;
  const startTime = Date.now();
  while (Date.now() - startTime < 30000) {
    const text = await page
      .evaluate((selectors) => {
        const msgs = document.querySelectorAll(selectors);
        if (msgs.length === 0) return '';
        const lastMsg = msgs[msgs.length - 1];
        return (lastMsg.textContent || '').trim();
      }, ASSISTANT_SELECTORS)
      .catch(() => '');

    if (text.length > 2) {
      hasStarted = true;
      break;
    }
    await sleep(400);
  }

  // Step 2: Stream completion detection — poll until text length stabilizes
  if (hasStarted) {
    console.log(`   🌊 AI agent is streaming response tokens...`);
    let previousText = '';
    let stableCount = 0;
    const streamStart = Date.now();

    while (Date.now() - streamStart < 45000) {
      const currentText = await page
        .evaluate((selectors) => {
          const msgs = document.querySelectorAll(selectors);
          if (msgs.length === 0) return '';
          const lastMsg = msgs[msgs.length - 1];
          return (lastMsg.textContent || '').trim();
        }, ASSISTANT_SELECTORS)
        .catch(() => '');

      if (currentText.length > 0 && currentText === previousText) {
        stableCount++;
        // If text is stable for 4 consecutive checks (2 full seconds), streaming has finished
        if (stableCount >= 4) {
          console.log(
            `   ✅ AI agent response completed (${currentText.length} characters).`,
          );
          break;
        }
      } else {
        stableCount = 0;
        previousText = currentText;
      }
      await sleep(500);
    }
  } else {
    console.warn(`   ⚠️ AI agent response timeout (waiting fallback)...`);
    await sleep(4000);
  }

  // Step 3: Glide cursor smoothly to the finished response message
  const assistantLocator = page.locator(ASSISTANT_SELECTORS).last();

  if (await assistantLocator.isVisible({ timeout: 3000 }).catch(() => false)) {
    const abBox = await assistantLocator.boundingBox();
    if (abBox) {
      console.log(
        `   🎯 Focusing cursor on response at (${Math.round(abBox.x)}, ${Math.round(abBox.y)})`,
      );
      await humanGlide(
        page,
        abBox.x + Math.min(abBox.width / 2, 240),
        abBox.y + Math.min(abBox.height / 2, 60),
        25,
      );
    }
  } else {
    await humanGlide(page, 960, 500, 25);
  }

  // Step 4: Generous reading pause after response completes
  console.log(`   📖 Reading completed response (pausing ${postWaitMs / 1000}s)...`);
  await sleep(postWaitMs);
}

export const runStandardAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  // 1. Detect that the demo page & chat interface are fully rendered
  console.log(`   🔍 Detecting demo page & chat component rendering...`);
  const inputLocator = page
    .locator('textarea, input[type="text"], [contenteditable="true"]')
    .first();
  await inputLocator.waitFor({ state: 'visible', timeout: 15000 });
  await sleep(600);

  const inputBox = await inputLocator.boundingBox();
  if (inputBox) {
    await humanGlide(
      page,
      inputBox.x + 80,
      inputBox.y + inputBox.height / 2,
      25,
    );
    await humanClick(page);
  } else {
    await inputLocator.click();
  }
  await sleep(400);

  for (const char of config.prompt) {
    await page.keyboard.type(char, { delay: 45 });
  }
  await sleep(600);

  // If text was wiped during typing by a sudden re-render, re-fill
  const currentVal = await inputLocator.inputValue().catch(() => '');
  if (!currentVal && config.prompt) {
    await inputLocator.fill(config.prompt);
    await sleep(300);
  }

  // Attempt to submit prompt via button click or Enter key
  const sendBtn = page
    .locator(
      'button[type="submit"], button:has-text("Send"), .copilotKitSendButton, button[aria-label*="Send"]',
    )
    .first();

  if (await sendBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    const btnBox = await sendBtn.boundingBox();
    if (btnBox) {
      await humanGlide(
        page,
        btnBox.x + btnBox.width / 2,
        btnBox.y + btnBox.height / 2,
        20,
      );
      await humanClick(page);
    } else {
      await sendBtn.click();
    }
  } else {
    await page.keyboard.press('Enter');
  }

  // Double-check after 800ms if input is still populated (swallowed submit), re-trigger Enter
  await sleep(800);
  const remainingVal = await inputLocator.inputValue().catch(() => '');
  if (remainingVal.trim().length > 0) {
    await page.keyboard.press('Enter');
  }

  // 2. Actively wait for the response to stream completely and pause for reading
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000);
};

const ACTION_MAP: Record<string, PageActionHandler> = {
  quickstart: runStandardAction,
  'chat-ui': runChatUiAction,
  'frontend-tools-generative-ui': runToolsAction,
  a2ui: runA2uiAction,
  'voice-multimodal': runVoiceAction,
  'human-in-the-loop': runHitlAction,
  'shared-state': runSharedStateAction,
  threads: runThreadsAction,
  memory: runMemoryAction,
  attachments: runAttachmentsAction,
  headless: runHeadlessUiAction,
  'copilot-runtime': runStandardAction,
  'backend-agent': runStandardAction,
};

export async function executePageAction(
  page: Page,
  config: PageRecordConfig,
  rootPath: string,
): Promise<void> {
  const handler = ACTION_MAP[config.id] ?? runStandardAction;
  await handler(page, config, rootPath);
}

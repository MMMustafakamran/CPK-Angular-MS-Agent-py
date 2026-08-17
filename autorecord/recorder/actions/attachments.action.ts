import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';
import { waitForAgentResponseCompletion } from './index';

/** Valid 1x1 red PNG */
const DUMMY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function ensureDummyAttachment(rootPath: string): { filePath: string; base64: string } {
  const assetsDir = join(rootPath, 'autorecord', 'recorder', 'assets');
  if (!existsSync(assetsDir)) {
    mkdirSync(assetsDir, { recursive: true });
  }
  const filePath = join(assetsDir, 'sample_chart.png');
  const buffer = Buffer.from(DUMMY_PNG_BASE64, 'base64');
  writeFileSync(filePath, buffer);
  const base64 = readFileSync(filePath).toString('base64');
  return { filePath, base64 };
}

export const runAttachmentsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  rootPath: string,
) => {
  console.log(`   📎 [Attachments Action]: Clicking + attachment icon and uploading dummy file...`);

  const { base64: fileBase64 } = ensureDummyAttachment(rootPath);

  // 1. Wait for the chat composer to be visible
  const inputLocator = page
    .locator('textarea, input[type="text"], [contenteditable="true"]')
    .first();
  await inputLocator.waitFor({ state: 'visible', timeout: 15000 });
  await sleep(600);

  // 2. Find and glide to the '+' / Add photos or files button
  const addBtn = page
    .locator(
      'button[aria-label*="Add photos or files" i], button[aria-label*="attach" i], button[title*="Add photos" i], .cdk-menu-trigger'
    )
    .first();

  await addBtn.waitFor({ state: 'visible', timeout: 8000 });
  const addBox = await addBtn.boundingBox();
  if (addBox) {
    console.log(`   👉 Gliding cursor to attachment '+' icon at (${Math.round(addBox.x)}, ${Math.round(addBox.y)})...`);
    await humanGlide(
      page,
      addBox.x + addBox.width / 2,
      addBox.y + addBox.height / 2,
      22,
    );
    await sleep(350);
    await humanClick(page);
  } else {
    await addBtn.click();
  }
  await sleep(600);

  // 3. Glide to the menu item in the CDK popup and click
  const menuItem = page
    .locator('[role="menuitem"]:has-text("Add photos or files"), .cdk-menu-item')
    .first();

  if (await menuItem.isVisible({ timeout: 4000 }).catch(() => false)) {
    const menuBox = await menuItem.boundingBox();
    if (menuBox) {
      console.log(`   👉 Gliding cursor to 'Add photos or files' menu item...`);
      await humanGlide(
        page,
        menuBox.x + menuBox.width / 2,
        menuBox.y + menuBox.height / 2,
        20,
      );
      await sleep(350);
      await humanClick(page);
    } else {
      await menuItem.click();
    }
  }

  // 4. Attach the file via DataTransfer and trigger change event
  console.log(`   📁 Attaching sample_chart.png to file input queue...`);
  await page.evaluate(
    async ({ base64, filename }) => {
      let fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (!fileInput) {
        const triggerBtn = document.querySelector('button[aria-label*="Add photos"]') as HTMLElement;
        triggerBtn?.click();
        await new Promise((r) => setTimeout(r, 200));
        const item = document.querySelector('[role="menuitem"]') as HTMLElement;
        item?.click();
        await new Promise((r) => setTimeout(r, 200));
        fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      }

      if (fileInput) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        const file = new File([blob], filename, { type: 'image/png' });

        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    },
    { base64: fileBase64, filename: 'sample_chart.png' },
  );

  await sleep(1500);

  // 5. Locate and showcase the rendered attachment queue preview thumbnail
  const previewThumbnail = page
    .locator(
      'copilot-chat-attachment-queue, .copilotKitAttachmentQueueItem, .copilotKitAttachmentQueuePreviewImage, [data-testid="copilot-attachment-queue"]'
    )
    .first();

  if (await previewThumbnail.isVisible({ timeout: 5000 }).catch(() => false)) {
    const thumbBox = await previewThumbnail.boundingBox();
    if (thumbBox) {
      console.log(`   🎯 Showcasing attached file thumbnail at (${Math.round(thumbBox.x)}, ${Math.round(thumbBox.y)})...`);
      await humanGlide(
        page,
        thumbBox.x + thumbBox.width / 2,
        thumbBox.y + thumbBox.height / 2,
        22,
      );
      await sleep(1200);
    }
  }

  // 6. Focus textarea at updated post-attachment position and type prompt
  const updatedInputLocator = page.locator('textarea').first();
  await updatedInputLocator.waitFor({ state: 'visible', timeout: 5000 });
  const updatedBox = await updatedInputLocator.boundingBox();
  if (updatedBox) {
    console.log(`   👉 Focusing chat input textarea at updated position (${Math.round(updatedBox.x)}, ${Math.round(updatedBox.y)})...`);
    await humanGlide(
      page,
      updatedBox.x + 80,
      updatedBox.y + updatedBox.height / 2,
      20,
    );
    await humanClick(page);
  } else {
    await updatedInputLocator.click();
  }
  await sleep(350);

  const prompt = config.prompt || 'Can you analyze this chart attachment?';
  for (const char of prompt) {
    await page.keyboard.type(char, { delay: 40 });
  }
  await sleep(400);

  // Guarantee Angular signal receives the input event
  await page.evaluate((text) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = text;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, prompt);
  await sleep(400);

  // 7. Submit prompt via Send button
  const sendBtn = page
    .locator(
      'button[aria-label*="Send message" i], button[aria-label*="Send" i], button[type="submit"], button:has-text("Send"), .copilotKitSendButton'
    )
    .first();

  if (await sendBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    const sendBox = await sendBtn.boundingBox();
    if (sendBox) {
      console.log(`   👉 Clicking Send message button...`);
      await humanGlide(
        page,
        sendBox.x + sendBox.width / 2,
        sendBox.y + sendBox.height / 2,
        20,
      );
      await humanClick(page);
    } else {
      await sendBtn.click();
    }
  } else {
    await page.keyboard.press('Enter');
  }

  // 8. Wait for AI response completion and pause 4s for reading
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000);
};

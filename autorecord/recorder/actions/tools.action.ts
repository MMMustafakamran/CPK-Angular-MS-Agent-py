import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../types';
import { waitForAgentResponseCompletion } from './index';

export const runToolsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   🛠️ [Frontend Tools & Gen UI Action]: Testing server & client tools...`);

  // Ensure sidebar is visible/focused
  const inputLocator = page
    .locator('textarea, input[type="text"], [contenteditable="true"]')
    .first();
  await inputLocator.waitFor({ state: 'visible', timeout: 15000 });
  await sleep(600);

  // 1. Tool 1: Server-side getWeather tool -> renders WeatherCardComponent
  console.log(`   🌤️ Triggering server tool: "What's the weather in Tokyo?"...`);
  const inputBox = await inputLocator.boundingBox();
  if (inputBox) {
    await humanGlide(page, inputBox.x + 80, inputBox.y + inputBox.height / 2, 22);
    await humanClick(page);
  } else {
    await inputLocator.click();
  }
  await sleep(400);

  const prompt1 = config.prompt || "What's the weather in Tokyo?";
  for (const char of prompt1) {
    await page.keyboard.type(char, { delay: 40 });
  }
  await sleep(400);

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

  // Wait for WeatherCardComponent to render
  console.log(`   ⏳ Waiting for WeatherCardComponent tool result rendering...`);
  const weatherCard = page.locator('app-weather-card').first();
  await weatherCard.waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});

  // Wait for stream completion
  await waitForAgentResponseCompletion(page, 4000);

  // Glide cursor over the rendered WeatherCardComponent
  if (await weatherCard.isVisible({ timeout: 2000 }).catch(() => false)) {
    const cardBox = await weatherCard.boundingBox();
    if (cardBox) {
      console.log(`   🎯 Focusing cursor on rendered WeatherCardComponent...`);
      await humanGlide(page, cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2, 22);
      await sleep(2000);
    }
  }

  // 2. Tool 2: Browser-executed change_background tool
  console.log(`   🎨 Triggering client tool: "Change the background to violet"...`);
  if (inputBox) {
    await humanGlide(page, inputBox.x + 80, inputBox.y + inputBox.height / 2, 22);
    await humanClick(page);
  } else {
    await inputLocator.click();
  }
  await sleep(300);

  const prompt2 = 'Change the background to violet';
  for (const char of prompt2) {
    await page.keyboard.type(char, { delay: 40 });
  }
  await sleep(400);

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

  await waitForAgentResponseCompletion(page, 3000);

  // Glide cursor across the newly painted background panel
  console.log(`   ✨ Showcasing updated background gradient...`);
  await humanGlide(page, 500, 350, 25);
  await sleep(1000);
  await humanGlide(page, 700, 500, 25);
  await sleep(2000);
};

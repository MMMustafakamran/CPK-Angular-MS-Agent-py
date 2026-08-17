import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import { closeNotepadNote, showNotepadNote } from '../overlays/notepad';
import { type PageActionHandler, type PageRecordConfig } from '../types';

export const runVoiceAction: PageActionHandler = async (
  page: Page,
  _config: PageRecordConfig,
) => {
  console.log(`   🎙️ [Voice & Multimodal Action]: Targeting Voice Recorder (Transcribe) button and typing developer note...`);

  // 1. Wait for the chat composer to be visible
  const inputLocator = page
    .locator('textarea, input[type="text"], [contenteditable="true"]')
    .first();
  await inputLocator.waitFor({ state: 'visible', timeout: 15000 });
  await sleep(600);

  // 2. Find the exact Voice Recorder / Transcribe microphone button (aria-label="Transcribe")
  const micBtn = page
    .locator('button[aria-label="Transcribe"], button[aria-label*="Transcribe" i], copilot-chat-start-transcribe-button button')
    .first();

  await micBtn.waitFor({ state: 'visible', timeout: 8000 });
  const micBox = await micBtn.boundingBox();
  if (micBox) {
    console.log(`   👉 Gliding cursor directly to Voice Mic (Transcribe) button at (${Math.round(micBox.x)}, ${Math.round(micBox.y)})...`);
    await humanGlide(
      page,
      micBox.x + micBox.width / 2,
      micBox.y + micBox.height / 2,
      22,
    );
    await sleep(400);

    // Click the voice recorder button
    await humanClick(page);
    console.log(`   🎙️ Clicked Voice Mic (Transcribe) button.`);
  } else {
    await micBtn.click();
  }

  // Showcase the clicked / active recording state
  await sleep(1800);

  // 3. Open Notepad from taskbar and type developer explanation note
  await showNotepadNote(
    page,
    'Voice & Audio Transcription Note',
    [
      'NOTE: Voice & Audio Transcription',
      '',
      '- voice works on browser but no tts implemented in the server file thus not working',
    ],
  );

  // 4. Smoothly close Notepad overlay
  await closeNotepadNote(page);
  await sleep(1000);
};

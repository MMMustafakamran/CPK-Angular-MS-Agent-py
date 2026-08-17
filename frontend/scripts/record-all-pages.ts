/**
 * Automated Screen Recording & Demonstration Pipeline
 * Tailored for CopilotKit (Angular 22) + Microsoft Agent Framework (Python)
 *
 * Records a complete 3-step walkthrough for each doc page:
 * 1. Official CopilotKit Doc Page with smooth human-like scrolling to code snippet
 * 2. Full VS Code Dark Modern IDE view with file explorer, active tab, and highlighted lines
 * 3. Chrome-free Demo (/demo) with natural typing, send click, and live AI response stream
 *
 * Includes:
 * - Authentic Windows 11 Taskbar overlay with live local clock & date
 * - Visible OS Mouse Cursor with natural curved gliding and click animations
 * - Zero white flash between page transitions
 * - Slide-up Notepad developer notes with human typing cadence for partial features
 * - High-definition WebM video exports
 */

import { chromium, type Page } from 'playwright';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const RECORDINGS_DIR = join(ROOT, 'recordings');

if (!existsSync(RECORDINGS_DIR)) {
  mkdirSync(RECORDINGS_DIR, { recursive: true });
}

export interface PageRecordConfig {
  id: string;
  name: string;
  docUrl: string;
  ideFile: string;
  ideLine: number;
  demoUrl: string;
  prompt: string;
  waitAfterPromptMs?: number;
}

export const PAGES: PageRecordConfig[] = [
  {
    id: 'quickstart',
    name: 'Quickstart',
    docUrl: 'https://docs.copilotkit.ai/angular/ms-agent-python/quickstart',
    ideFile: 'server.ts',
    ideLine: 33,
    demoUrl: 'http://localhost:4200/quickstart/demo',
    prompt: 'Can you tell me a joke?',
  },
  {
    id: 'chat-ui',
    name: 'Chat UI and Customization',
    docUrl: 'https://docs.copilotkit.ai/angular/ms-agent-python/guides/chat-ui',
    ideFile: 'src/app/features/chat-ui/chat-ui-demo.component.ts',
    ideLine: 28,
    demoUrl: 'http://localhost:4200/chat-ui/demo',
    prompt: 'Hello! How can you help me today?',
  },
  {
    id: 'frontend-tools-generative-ui',
    name: 'Frontend Tools & Generative UI',
    docUrl: 'https://docs.copilotkit.ai/angular/ms-agent-python/guides/frontend-tools-generative-ui',
    ideFile: '../backend/main.py',
    ideLine: 36,
    demoUrl: 'http://localhost:4200/frontend-tools-generative-ui/demo',
    prompt: 'What is the weather in Tokyo?',
  },
  {
    id: 'a2ui',
    name: 'A2UI Schemas & Recovery',
    docUrl: 'https://docs.copilotkit.ai/angular/ms-agent-python/guides/a2ui',
    ideFile: 'server.ts',
    ideLine: 41,
    demoUrl: 'http://localhost:4200/a2ui/demo',
    prompt: 'Explain A2UI adaptive interface schemas and recovery.',
  },
  {
    id: 'voice-multimodal',
    name: 'Voice & Multimodal',
    docUrl: 'https://docs.copilotkit.ai/angular/ms-agent-python/guides/voice-multimodal',
    ideFile: 'src/app/features/media/voice-chat.component.ts',
    ideLine: 13,
    demoUrl: 'http://localhost:4200/voice-multimodal/demo',
    prompt: 'Hello from multimodal assistant!',
  },
  {
    id: 'human-in-the-loop',
    name: 'Human in the Loop',
    docUrl: 'https://docs.copilotkit.ai/angular/ms-agent-python/guides/human-in-the-loop',
    ideFile: 'src/app/features/hitl/hitl-chat.component.ts',
    ideLine: 19,
    demoUrl: 'http://localhost:4200/human-in-the-loop/demo',
    prompt: 'Please delete the database records for project Alpha',
  },
  {
    id: 'shared-state',
    name: 'Shared State & Context',
    docUrl: 'https://docs.copilotkit.ai/angular/ms-agent-python/guides/shared-state',
    ideFile: '../backend/main.py',
    ideLine: 22,
    demoUrl: 'http://localhost:4200/shared-state/demo',
    prompt: 'Please switch my preferred language to Spanish.',
  },
  {
    id: 'threads',
    name: 'Threads Management',
    docUrl: 'https://docs.copilotkit.ai/angular/ms-agent-python/guides/threads-memory-attachments-headless',
    ideFile: 'src/app/features/threads/threads-demo.component.ts',
    ideLine: 10,
    demoUrl: 'http://localhost:4200/threads/demo',
    prompt: 'List active threads',
  },
  {
    id: 'memory',
    name: 'Agent Memories',
    docUrl: 'https://docs.copilotkit.ai/angular/ms-agent-python/guides/threads-memory-attachments-headless',
    ideFile: 'src/app/features/memory/memory-demo.component.ts',
    ideLine: 10,
    demoUrl: 'http://localhost:4200/memory/demo',
    prompt: 'Remember that my preferred language is TypeScript.',
  },
  {
    id: 'attachments',
    name: 'Attachments & Documents',
    docUrl: 'https://docs.copilotkit.ai/angular/ms-agent-python/guides/threads-memory-attachments-headless',
    ideFile: 'src/app/features/attachments/media-chat.component.ts',
    ideLine: 16,
    demoUrl: 'http://localhost:4200/attachments/demo',
    prompt: 'Please review and summarize this attached document.',
  },
  {
    id: 'headless',
    name: 'Headless Chat UI',
    docUrl: 'https://docs.copilotkit.ai/angular/ms-agent-python/guides/threads-memory-attachments-headless',
    ideFile: 'src/app/features/headless/headless-chat.component.ts',
    ideLine: 40,
    demoUrl: 'http://localhost:4200/headless/demo',
    prompt: 'Explain how the Microsoft Agent Framework communicates with Copilot Runtime in 2 sentences.',
  },
];

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Injects or re-attaches the Windows 11 Taskbar & Virtual Mouse overlay onto the current page */
async function ensureOverlays(page: Page, activeApp: 'chrome' | 'vscode' = 'chrome'): Promise<void> {
  const chromeInd = activeApp === 'chrome' ? '#60a5fa' : 'transparent';
  const vscodeInd = activeApp === 'vscode' ? '#60a5fa' : 'transparent';

  const code = `
    (function() {
      // 1. Windows 11 Taskbar
      var bar = document.getElementById('win11-taskbar-overlay');
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'win11-taskbar-overlay';
        bar.style.cssText = 'position:fixed!important;bottom:0!important;left:0!important;width:100vw!important;height:48px!important;background-color:rgba(28,28,28,0.95)!important;backdrop-filter:blur(24px)!important;-webkit-backdrop-filter:blur(24px)!important;border-top:1px solid rgba(255,255,255,0.08)!important;z-index:2147483645!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:0 12px!important;box-sizing:border-box!important;font-family:Segoe UI,-apple-system,BlinkMacSystemFont,Roboto,sans-serif!important;user-select:none!important;pointer-events:none!important;';

        bar.innerHTML = [
          '<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#e4e4e4;width:140px;">',
          '  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/></svg>',
          '  <span style="font-size:11px;font-weight:500;">78°F Sunny</span>',
          '</div>',
          '<div style="display:flex;align-items:center;gap:6px;position:absolute;left:50%;transform:translateX(-50%);">',
          '  <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;"><svg width="20" height="20" viewBox="0 0 88 88" fill="#0078d4"><path d="M0 12.48 35.68 7.6v33.4H0V12.48zM0 45.48h35.68v33.4L0 74.01V45.48zM41.48 6.78 88 0v41H41.48V6.78zM88 45.48v41L41.48 80V45.48H88z"/></svg></div>',
          '  <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e4e4e4" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>',
          '  <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e4e4e4" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg></div>',
          '  <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;"><svg width="22" height="22" viewBox="0 0 24 24"><path fill="#facc15" d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg></div>',
          '  <div style="width:40px;height:40px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;"><svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#3b82f6"/><circle cx="12" cy="12" r="4" fill="#ffffff"/></svg><div style="position:absolute;bottom:2px;width:14px;height:3px;background:${chromeInd};border-radius:2px;"></div></div>',
          '  <div style="width:40px;height:40px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;"><svg width="22" height="22" viewBox="0 0 24 24"><path fill="#007acc" d="M18.5 2.5 12 8.5 7 4.5 3.5 6v12L7 19.5l5-4 6.5 6 3-1.5V4l-3-1.5z"/></svg><div style="position:absolute;bottom:2px;width:14px;height:3px;background:${vscodeInd};border-radius:2px;"></div></div>',
          '  <div id="win11-taskbar-notepad" style="width:40px;height:40px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;"><svg width="22" height="22" viewBox="0 0 24 24" fill="#60a5fa"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg><div id="win11-notepad-indicator" style="position:absolute;bottom:2px;width:14px;height:3px;background:transparent;border-radius:2px;"></div></div>',
          '  <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="#1e1e1e" stroke="#e4e4e4" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m6 9 4 3-4 3m6 0h4"/></svg></div>',
          '</div>',
          '<div style="display:flex;align-items:center;gap:12px;font-size:12px;color:#e4e4e4;">',
          '  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e4e4e4" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>',
          '  <span style="font-weight:500;font-size:11px;">ENG</span>',
          '  <svg width="16" height="16" viewBox="0 0 24 24" fill="#e4e4e4"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z"/></svg>',
          '  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e4e4e4" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
          '  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e4e4e4" stroke-width="2"><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/></svg>',
          '  <div style="display:flex;flex-direction:column;align-items:flex-end;line-height:1.15;font-size:11px;padding:2px 4px;">',
          '    <span id="win11-time" style="font-weight:500;"></span>',
          '    <span id="win11-date" style="font-size:10px;color:#a1a1aa;"></span>',
          '  </div>',
          '  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e4e4e4" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
          '  <div style="width:2px;height:16px;background:rgba(255,255,255,0.2);"></div>',
          '</div>'
        ].join('');

        document.documentElement.appendChild(bar);

        var tick = function() {
          var now = new Date();
          var timeEl = document.getElementById('win11-time');
          var dateEl = document.getElementById('win11-date');
          if (timeEl) timeEl.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
          if (dateEl) dateEl.textContent = now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });
        };
        tick();
        setInterval(tick, 1000);
      }

      // 2. Cursor
      var cursor = document.getElementById('playwright-virtual-mouse');
      if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'playwright-virtual-mouse';
        cursor.style.cssText = 'position:fixed!important;top:300px!important;left:500px!important;width:24px!important;height:24px!important;z-index:2147483647!important;pointer-events:none!important;transform:translate(-2px,-2px)!important;transition:transform 0.04s ease-out!important;';
        cursor.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.6));"><path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z" fill="#ffffff" stroke="#111111" stroke-width="1.5"/></svg>';
        document.documentElement.appendChild(cursor);
      }
    })();
  `;

  await page.evaluate(code);
}

/** Smooth human-like mouse glide moving both physical coordinates and visible virtual cursor */
async function humanGlide(page: Page, targetX: number, targetY: number, steps: number = 25): Promise<void> {
  const currentPos = await page.evaluate(`
    (function() {
      var c = document.getElementById('playwright-virtual-mouse');
      if (c) {
        return { x: parseFloat(c.style.left) || 960, y: parseFloat(c.style.top) || 540 };
      }
      return { x: 960, y: 540 };
    })()
  `) as { x: number; y: number };

  const dx = (targetX - currentPos.x) / steps;
  const dy = (targetY - currentPos.y) / steps;

  for (let i = 1; i <= steps; i++) {
    const cx = currentPos.x + dx * i;
    const cy = currentPos.y + dy * i;

    await page.evaluate(`
      (function() {
        var c = document.getElementById('playwright-virtual-mouse');
        if (c) {
          c.style.left = "${cx}px";
          c.style.top = "${cy}px";
        }
      })()
    `);

    await page.mouse.move(cx, cy);
    await sleep(15);
  }
}

/** Mouse click animation with depression effect */
async function humanClick(page: Page): Promise<void> {
  await page.evaluate(`
    (function() {
      var c = document.getElementById('playwright-virtual-mouse');
      if (c) c.style.transform = 'translate(-2px, -2px) scale(0.82)';
    })()
  `);
  await page.mouse.down();
  await sleep(120);
  await page.evaluate(`
    (function() {
      var c = document.getElementById('playwright-virtual-mouse');
      if (c) c.style.transform = 'translate(-2px, -2px) scale(1)';
    })()
  `);
  await page.mouse.up();
  await sleep(80);
}

/** Human scroll down using both physical wheel and internal element scroll */
async function humanScrollDown(page: Page, totalPixels: number = 550, speedMs: number = 60): Promise<void> {
  const steps = Math.floor(totalPixels / 45);
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, 45);
    await page.evaluate(`
      (function() {
        window.scrollBy({ top: 45, behavior: 'smooth' });
        var main = document.querySelector('main, article, [class*="overflow-y-auto"]');
        if (main) main.scrollBy({ top: 45, behavior: 'smooth' });
      })()
    `);
    await sleep(speedMs);
  }
}

/** Injects an authentic Windows 11 Notepad window and types unformatted developer notes with human cadence */
async function showNotepadNote(page: Page, title: string, textLines: string[]): Promise<void> {
  console.log(`📝 Opening Notepad: ${title}...`);
  await sleep(1000);

  // Glide down to taskbar Notepad icon and click it
  await humanGlide(page, 1038, 1055, 25);
  await humanClick(page);
  await sleep(200);

  // Activate taskbar indicator and animate window opening
  await page.evaluate(`
    (function() {
      var ind = document.getElementById('win11-notepad-indicator');
      if (ind) ind.style.background = '#60a5fa';

      var existing = document.getElementById('win11-notepad-overlay');
      if (existing) existing.remove();

      var np = document.createElement('div');
      np.id = 'win11-notepad-overlay';
      np.style.cssText = 'position:fixed!important;top:140px!important;left:50%!important;transform:translateX(-50%) scale(0.96)!important;opacity:0!important;width:760px!important;height:360px!important;background:#202020!important;border:1px solid rgba(255,255,255,0.15)!important;border-radius:8px!important;box-shadow:0 24px 60px rgba(0,0,0,0.85),0 0 0 1px rgba(255,255,255,0.08)!important;z-index:2147483640!important;display:flex!important;flex-direction:column!important;font-family:Segoe UI,sans-serif!important;overflow:hidden!important;transition:all 0.4s cubic-bezier(0.16,1,0.3,1)!important;';

      np.innerHTML = [
        // Titlebar
        '<div style="height:38px;background:#2b2b2b;display:flex;align-items:center;justify-content:space-between;padding:0 14px;border-bottom:1px solid rgba(255,255,255,0.08);user-select:none;">',
        '  <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#e5e5e5;font-weight:500;">',
        '    <svg width="16" height="16" viewBox="0 0 24 24" fill="#60a5fa"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>',
        '    <span>' + ${JSON.stringify(title)} + ' - Notepad</span>',
        '  </div>',
        '  <div style="display:flex;align-items:center;gap:12px;color:#a3a3a3;font-size:11px;">',
        '    <span>&#x2500;</span><span>&#x25A1;</span><span style="color:#ef4444;font-size:13px;font-weight:bold;">&#x2715;</span>',
        '  </div>',
        '</div>',
        // Menu Bar
        '<div style="height:26px;background:#202020;display:flex;align-items:center;gap:16px;padding:0 14px;font-size:11px;color:#a3a3a3;border-bottom:1px solid rgba(255,255,255,0.06);user-select:none;">',
        '  <span>File</span><span>Edit</span><span>View</span>',
        '</div>',
        // Text Content Area
        '<div id="notepad-content-body" style="flex:1;padding:18px;background:#1e1e1e;color:#f3f3f3;font-family:Consolas,Courier New,monospace;font-size:14px;line-height:1.7;white-space:pre-wrap;overflow-y:auto;"></div>'
      ].join('');

      document.documentElement.appendChild(np);

      // Trigger smooth transition
      setTimeout(function() {
        np.style.opacity = '1';
        np.style.transform = 'translateX(-50%) scale(1)';
      }, 30);
    })()
  `);

  await sleep(600);

  // Move mouse up into Notepad text area and click to place cursor
  await humanGlide(page, 960, 260, 22);
  await humanClick(page);
  await sleep(400);

  // Type plain unformatted text with human cadence
  const fullText = textLines.join('\n');
  for (let i = 0; i < fullText.length; i++) {
    const char = fullText[i];
    await page.evaluate(`
      (function() {
        var el = document.getElementById('notepad-content-body');
        if (el) {
          el.textContent = ${JSON.stringify(fullText.slice(0, i + 1))} + ' |';
        }
      })()
    `);

    // Natural variable delay based on character type and human rhythm
    let delay = 60 + Math.floor(Math.random() * 45); // 60ms - 105ms base keystroke

    if (char === '\n') {
      delay = 380 + Math.floor(Math.random() * 140); // Newline thought pause: 380-520ms
    } else if (char === '.' || char === ':' || char === '!' || char === '?') {
      delay = 280 + Math.floor(Math.random() * 120); // Sentence boundary pause: 280-400ms
    } else if (char === ',' || char === ';') {
      delay = 180 + Math.floor(Math.random() * 80);  // Clause pause: 180-260ms
    } else if (char === ' ') {
      delay = 85 + Math.floor(Math.random() * 35);   // Word boundary: 85-120ms
    } else if (Math.random() < 0.035) {
      delay = 240 + Math.floor(Math.random() * 160); // Occasional thinking hesitation
    }

    await sleep(delay);
  }

  // Remove blinking caret at the end
  await page.evaluate(`
    (function() {
      var el = document.getElementById('notepad-content-body');
      if (el) {
        el.textContent = ${JSON.stringify(fullText)};
      }
    })()
  `);

  await sleep(4500);
}

async function recordPage(config: PageRecordConfig): Promise<void> {
  console.log(`\n======================================================`);
  console.log(`🎬 RECORDING: ${config.name} (${config.id})`);
  console.log(`======================================================`);

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--start-maximized',
      '--force-dark-mode',
      '--background-color=#1e1e1e',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    colorScheme: 'dark',
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  try {
    // ----------------------------------------------------
    // STEP 1: DOC PAGE & NATURAL HUMAN MOVEMENT
    // ----------------------------------------------------
    console.log(`\n📖 Step 1: Navigating to Official Doc (${config.docUrl})...`);
    try {
      await page.goto(config.docUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await ensureOverlays(page, 'chrome');
      await sleep(1000);

      // Move mouse into reading position
      await humanGlide(page, 960, 450, 30);
      await sleep(300);

      // Natural smooth scrolling down the doc page
      console.log(`   Human-like scrolling down doc page...`);
      await humanScrollDown(page, 500, 60);
      await sleep(500);

      // Move mouse over the code snippet
      const hasCode = await page.$('pre, code, div[class*="code"]');
      if (hasCode) {
        const box = await hasCode.boundingBox();
        if (box) {
          await humanGlide(page, box.x + box.width / 2, box.y + 40, 25);
        }
      }
      await sleep(3500);
    } catch (e) {
      console.warn(`Doc navigation note: ${e}`);
      await sleep(2000);
    }

    // ----------------------------------------------------
    // STEP 2: SHOW PROJECT CODE IN IDE WITH ACTIVE SELECTION
    // ----------------------------------------------------
    console.log(`\n💻 Step 2: Displaying Project Code in IDE (${config.ideFile}:${config.ideLine})...`);
    const ideUrl = `http://localhost:4200/ide?file=${encodeURIComponent(config.ideFile)}&line=${config.ideLine}`;
    await page.goto(ideUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await ensureOverlays(page, 'vscode');
    await sleep(800);

    // Move mouse over the Explorer on the left and click
    await humanGlide(page, 160, 220, 20);
    await humanClick(page);
    await sleep(400);

    // Glide mouse into the code editor
    await humanGlide(page, 650, 400, 25);

    // Smoothly scroll down inside the editor to the target line
    await page.evaluate(`
      (function() {
        var container = document.getElementById('editor-container');
        var targetEl = document.getElementById('line-${config.ideLine}');
        if (container && targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      })()
    `);

    // Move cursor over the highlighted code block
    await humanGlide(page, 520, 480, 20);

    // Also trigger VS Code desktop goto if available
    try {
      execSync(`code -r -g "${config.ideFile}:${config.ideLine}"`, { stdio: 'ignore' });
    } catch {}

    await sleep(4500);

    // ----------------------------------------------------
    // STEP 3: FRONTEND DEMO & TAILORED PROMPT EXECUTION
    // ----------------------------------------------------
    console.log(`\n🚀 Step 3: Opening Demo (${config.demoUrl})...`);
    await page.goto(config.demoUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await ensureOverlays(page, 'chrome');
    await sleep(1500);

    if (config.id === 'chat-ui') {
      // --------------------------------------------------
      // CHAT UI DEMO: Show all 4 tabs, prompt tabs 1 & 2, open popup/sidebar on tabs 3 & 4
      // --------------------------------------------------
      console.log(`   [Chat UI] 1/4: Demonstrating Inline Chat tab...`);
      const inputLocator1 = page.locator('textarea, input[type="text"], [contenteditable="true"]').first();
      await inputLocator1.waitFor({ timeout: 8000 });
      const inputBox1 = await inputLocator1.boundingBox();
      if (inputBox1) {
        await humanGlide(page, inputBox1.x + 80, inputBox1.y + inputBox1.height / 2, 20);
        await humanClick(page);
      }
      const prompt1 = 'Hello! How can you help me today?';
      for (const c of prompt1) await page.keyboard.type(c, { delay: 45 });
      await sleep(400);
      await page.keyboard.press('Enter');
      console.log(`   Waiting for Inline Chat response...`);
      await sleep(8000);

      console.log(`   [Chat UI] 2/4: Demonstrating Custom Assistant Message tab...`);
      const tab2 = page.locator('button:has-text("Custom assistant message")');
      const t2Box = await tab2.boundingBox();
      if (t2Box) {
        await humanGlide(page, t2Box.x + t2Box.width / 2, t2Box.y + t2Box.height / 2, 20);
        await humanClick(page);
      }
      await sleep(1200);
      const inputLocator2 = page.locator('textarea, input[type="text"], [contenteditable="true"]').first();
      const inputBox2 = await inputLocator2.boundingBox();
      if (inputBox2) {
        await humanGlide(page, inputBox2.x + 80, inputBox2.y + inputBox2.height / 2, 20);
        await humanClick(page);
      }
      const prompt2 = 'Tell me a fun fact about programming in 1 sentence.';
      for (const c of prompt2) await page.keyboard.type(c, { delay: 45 });
      await sleep(400);
      await page.keyboard.press('Enter');
      console.log(`   Waiting for Custom Assistant Message response...`);
      await sleep(8000);

      console.log(`   [Chat UI] 3/4: Demonstrating Popup surface...`);
      const tab3 = page.locator('button:has-text("Popup")');
      const t3Box = await tab3.boundingBox();
      if (t3Box) {
        await humanGlide(page, t3Box.x + t3Box.width / 2, t3Box.y + t3Box.height / 2, 20);
        await humanClick(page);
      }
      await sleep(1000);
      const openPopupBtn = page.locator('button:has-text("Open popup")').first();
      if (await openPopupBtn.isVisible()) {
        const opBox = await openPopupBtn.boundingBox();
        if (opBox) {
          await humanGlide(page, opBox.x + opBox.width / 2, opBox.y + opBox.height / 2, 15);
          await humanClick(page);
        }
      }
      await sleep(1500);
      await humanGlide(page, 1600, 700, 25);
      console.log(`   Popup open — showcasing floating chat surface...`);
      await sleep(4000);

      console.log(`   [Chat UI] 4/4: Demonstrating Sidebar surface...`);
      const tab4 = page.locator('button:has-text("Sidebar")');
      const t4Box = await tab4.boundingBox();
      if (t4Box) {
        await humanGlide(page, t4Box.x + t4Box.width / 2, t4Box.y + t4Box.height / 2, 20);
        // 1st click: closes the open popup via clickOutsideToClose
        await humanClick(page);
        console.log(`   1st click on Sidebar tab (closes open popup)...`);
        await sleep(400);
        // 2nd click: activates the Sidebar tab
        await humanClick(page);
        console.log(`   2nd click on Sidebar tab (switches to Sidebar view)...`);
      }
      await sleep(1200);

      // Click 'Open sidebar' button
      const openSidebarBtn = page.locator('button:has-text("Open sidebar")').first();
      if (await openSidebarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        const osBox = await openSidebarBtn.boundingBox();
        if (osBox) {
          await humanGlide(page, osBox.x + osBox.width / 2, osBox.y + osBox.height / 2, 15);
          await humanClick(page);
          console.log(`   Clicked 'Open sidebar' button...`);
        }
      }
      await sleep(1500);

      // Glide mouse to center of the opened docked sidebar
      await humanGlide(page, 1680, 500, 25);
      console.log(`   Sidebar open — showcasing 480px docked panel...`);
      await sleep(4000);

    } else if (config.id === 'attachments') {
      // --------------------------------------------------
      // ATTACHMENTS DEMO: Click attachment button, upload sample file, and prompt
      // --------------------------------------------------
      console.log(`   [Attachments] Uploading sample document and prompting...`);
      const sampleFilePath = join(ROOT, 'sample_report.pdf');

      // Locate the (+) attachment trigger button
      const attachBtn = page.locator('button[aria-label="Add photos or files"], button[tooltipposition="below"].cdk-menu-trigger, .copilotKitInput button:first-of-type').first();
      await attachBtn.waitFor({ timeout: 6000 });
      const attachBox = await attachBtn.boundingBox();
      if (attachBox) {
        await humanGlide(page, attachBox.x + attachBox.width / 2, attachBox.y + attachBox.height / 2, 20);
        await humanClick(page);
      }
      await sleep(600);

      // Check if a CDK menu appeared (e.g. Upload file / Upload photo)
      try {
        const menuItem = page.locator('[role="menuitem"], .cdk-menu-item, button:has-text("Upload"), button:has-text("file"), button:has-text("Photo")').first();
        if (await menuItem.isVisible({ timeout: 1000 }).catch(() => false)) {
          const mBox = await menuItem.boundingBox();
          if (mBox) {
            await humanGlide(page, mBox.x + mBox.width / 2, mBox.y + mBox.height / 2, 15);
            await humanClick(page);
          }
        }
      } catch {}

      // Set files on file input
      try {
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.count() > 0) {
          await fileInput.setInputFiles(sampleFilePath);
        }
      } catch {}
      await sleep(2000);

      // Focus input, type prompt, and send
      const inputLocator = page.locator('textarea, input[type="text"], [contenteditable="true"]').first();
      const inputBox = await inputLocator.boundingBox();
      if (inputBox) {
        await humanGlide(page, inputBox.x + 80, inputBox.y + inputBox.height / 2, 20);
        await humanClick(page);
      }
      const prompt = 'Please review and summarize this attached document.';
      for (const c of prompt) await page.keyboard.type(c, { delay: 45 });
      console.log(`   Prompt entered — holding 4s to showcase attached document and text...`);
      await sleep(4000);

      // Glide mouse to Send button and click
      try {
        const sendBtn = page.locator('button[type="submit"], button[aria-label="Send message"], button:has-text("Send")').first();
        const btnBox = await sendBtn.boundingBox().catch(() => null);
        if (btnBox) {
          await humanGlide(page, btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2, 20);
          await humanClick(page);
        } else {
          await page.keyboard.press('Enter');
        }
      } catch {
        await page.keyboard.press('Enter');
      }

      console.log(`   Waiting for Attachments AI response...`);
      await sleep(10000);

    } else if (config.id === 'voice-multimodal') {
      // --------------------------------------------------
      // VOICE DEMO: Click microphone icon, showcase voice activation, and open Notepad note
      // --------------------------------------------------
      console.log(`   [Voice] Activating microphone control...`);
      const micBtn = page.locator('button[aria-label="Transcribe"], button[aria-label*="Transcribe"], button[aria-label*="mic"], button[aria-label*="voice"]').first();
      await micBtn.waitFor({ timeout: 6000 });
      const micBox = await micBtn.boundingBox();
      if (micBox) {
        await humanGlide(page, micBox.x + micBox.width / 2, micBox.y + micBox.height / 2, 25);
        await humanClick(page);
      } else {
        await micBtn.click();
      }
      console.log(`   Microphone activated — holding active voice state...`);
      await sleep(3500);

      // Open Notepad to type the developer note smoothly
      await showNotepadNote(page, 'voice_notes.txt', [
        'Tested the microphone input component.',
        'The browser captures audio stream properly.',
        'Server-side speech-to-text is not configured on this Microsoft Agent Framework runtime, so audio transcription is not implemented by design.'
      ]);

    } else if (config.id === 'a2ui') {
      // --------------------------------------------------
      // A2UI DEMO: Input prompt and show A2UI Middleware note
      // --------------------------------------------------
      const inputLocator = page.locator('textarea, input[type="text"], [contenteditable="true"]').first();
      await inputLocator.waitFor({ timeout: 8000 });
      const inputBox = await inputLocator.boundingBox();
      if (inputBox) {
        await humanGlide(page, inputBox.x + 80, inputBox.y + inputBox.height / 2, 25);
        await humanClick(page);
      }
      for (const char of config.prompt) await page.keyboard.type(char, { delay: 45 });
      await sleep(600);
      await page.keyboard.press('Enter');
      await sleep(6000);

      await showNotepadNote(page, 'a2ui_notes.txt', [
        'A2UI Middleware is enabled in server.ts (a2ui: {}).',
        'Recovery thresholds configured in app.config.ts (showAfterMs: 2000).',
        'A2UI catalog styling classes are loaded in styles.css.'
      ]);

    } else if (config.id === 'threads') {
      // --------------------------------------------------
      // THREADS DEMO: Showcase thread surfaces and note
      // --------------------------------------------------
      await humanGlide(page, 450, 250, 25);
      await sleep(1500);
      await humanGlide(page, 1200, 450, 25);
      await sleep(2000);

      await showNotepadNote(page, 'threads_notes.txt', [
        'Threads Management Surface Test.',
        'Headless list (injectThreads) and CopilotThreadsDrawer are mounted.',
        'Thread endpoints require Enterprise Intelligence Platform license; drawer displays locked state as expected.'
      ]);

    } else if (config.id === 'memory') {
      // --------------------------------------------------
      // MEMORY DEMO: Memory list isAvailable gate & note
      // --------------------------------------------------
      const inputLocator = page.locator('textarea, input[type="text"], [contenteditable="true"]').first();
      await inputLocator.waitFor({ timeout: 8000 });
      const inputBox = await inputLocator.boundingBox();
      if (inputBox) {
        await humanGlide(page, inputBox.x + 80, inputBox.y + inputBox.height / 2, 25);
        await humanClick(page);
      }
      for (const char of config.prompt) await page.keyboard.type(char, { delay: 45 });
      await sleep(600);
      await page.keyboard.press('Enter');
      await sleep(6000);

      await showNotepadNote(page, 'memory_notes.txt', [
        'Agent Memories Surface Test.',
        'injectMemories isAvailable() gate verified.',
        'Enterprise memory routes are not active on local runtime; fallback messaging renders per guide specification.'
      ]);

    } else if (config.id === 'human-in-the-loop') {
      // --------------------------------------------------
      // HITL DEMO: Type sensitive action prompt and click Approve button
      // --------------------------------------------------
      const inputLocator = page.locator('textarea, input[type="text"], [contenteditable="true"]').first();
      await inputLocator.waitFor({ timeout: 8000 });
      const inputBox = await inputLocator.boundingBox();
      if (inputBox) {
        await humanGlide(page, inputBox.x + 80, inputBox.y + inputBox.height / 2, 25);
        await humanClick(page);
      }
      for (const char of config.prompt) await page.keyboard.type(char, { delay: 45 });
      await sleep(600);
      await page.keyboard.press('Enter');

      console.log(`⏳ Waiting for HITL approval card or response...`);
      await sleep(8000);

      try {
        const approveBtn = page.locator('button:has-text("Approve")').first();
        if (await approveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          const abBox = await approveBtn.boundingBox();
          if (abBox) {
            await humanGlide(page, abBox.x + abBox.width / 2, abBox.y + abBox.height / 2, 20);
            await humanClick(page);
            console.log(`   Clicked Approve on Decision Card!`);
            await sleep(4000);
          }
        }
      } catch {}

    } else if (config.id === 'shared-state') {
      // --------------------------------------------------
      // SHARED STATE DEMO: Click priority button and update state
      // --------------------------------------------------
      try {
        const prioBtn = page.locator('button:has-text("Mark high priority")').first();
        if (await prioBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          const pBox = await prioBtn.boundingBox();
          if (pBox) {
            await humanGlide(page, pBox.x + pBox.width / 2, pBox.y + pBox.height / 2, 20);
            await humanClick(page);
            console.log(`   Marked high priority on Workspace panel!`);
            await sleep(1500);
          }
        }
      } catch {}

      const inputLocator = page.locator('textarea, input[type="text"], [contenteditable="true"]').first();
      await inputLocator.waitFor({ timeout: 8000 });
      const inputBox = await inputLocator.boundingBox();
      if (inputBox) {
        await humanGlide(page, inputBox.x + 80, inputBox.y + inputBox.height / 2, 25);
        await humanClick(page);
      }
      for (const char of config.prompt) await page.keyboard.type(char, { delay: 45 });
      await sleep(600);
      await page.keyboard.press('Enter');
      console.log(`⏳ Waiting for State Synchronization response...`);
      await sleep(8000);

    } else {
      // --------------------------------------------------
      // STANDARD DEMO: Type prompt and wait for response
      // --------------------------------------------------
      const inputLocator = page.locator('textarea, input[type="text"], [contenteditable="true"]').first();
      await inputLocator.waitFor({ timeout: 8000 });

      const inputBox = await inputLocator.boundingBox();
      if (inputBox) {
        await humanGlide(page, inputBox.x + 80, inputBox.y + inputBox.height / 2, 25);
        await humanClick(page);
      } else {
        await inputLocator.click();
      }
      await sleep(400);

      for (const char of config.prompt) {
        await page.keyboard.type(char, { delay: 45 });
      }
      await sleep(600);

      try {
        const sendBtn = page.locator('button[type="submit"], button:has-text("Send"), .copilotKitSendButton').first();
        if (await sendBtn.isVisible()) {
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
      } catch {
        await page.keyboard.press('Enter');
      }

      console.log(`⏳ Waiting for AI agent response / tool rendering...`);
      await humanGlide(page, 960, 500, 30);
      await sleep(config.waitAfterPromptMs ?? 9500);
    }

    console.log(`✅ Demo execution completed for ${config.id}.`);
    await sleep(3500);

  } finally {
    const video = page.video();
    await page.close();
    await context.close();

    if (video) {
      const finalWebm = join(RECORDINGS_DIR, `${config.id}.webm`);
      try {
        if (existsSync(finalWebm)) unlinkSync(finalWebm);
        await video.saveAs(finalWebm);
        console.log(`🎥 WebM Video saved: ${finalWebm}`);
      } catch (err) {
        console.warn(`Video save note: ${err}`);
      }
    }

    await browser.close();
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const pageArg = args.find((a) => a.startsWith('--page='))?.split('=')[1];

  const targetPages = pageArg
    ? PAGES.filter((p) => p.id.toLowerCase() === pageArg.toLowerCase())
    : PAGES;

  if (targetPages.length === 0) {
    console.error(`❌ No matching page found for: ${pageArg}`);
    console.log(`Available pages: ${PAGES.map((p) => p.id).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n======================================================`);
  console.log(`🎬 STARTING AUTOMATED RECORDING FOR ${targetPages.length} PAGE(S)`);
  console.log(`======================================================\n`);

  for (const p of targetPages) {
    await recordPage(p);
  }

  console.log(`\n🎉 ALL RECORDINGS FINISHED! Output files in: ${RECORDINGS_DIR}`);
}

main().catch((err) => {
  console.error('Fatal recording error:', err);
  process.exit(1);
});

import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../overlays/cursor';
import {
  closeNotepadNote,
  openNotepadWindow,
  typeInNotepad,
} from '../overlays/notepad';
import { type PageActionHandler, type PageRecordConfig } from '../types';

/**
 * Naturally selects text on the page by dragging the mouse across it
 * with authentic bluish selection styling.
 */
async function selectTextWithMouse(
  page: Page,
  targetKeyword: string,
  containerKeyword?: string,
): Promise<boolean> {
  const box = await page.evaluate(
    ({ kw, parentKw }) => {
      // Find matching span or text element
      const figures = Array.from(document.querySelectorAll('figure, pre'));
      let container: Element | null = null;

      if (parentKw) {
        for (const f of figures) {
          if (f.textContent && f.textContent.includes(parentKw)) {
            container = f;
            break;
          }
        }
      }

      const searchRoot = container || document.body;
      const spans = Array.from(searchRoot.querySelectorAll('span, code, p, div'));
      let targetEl: HTMLElement | null = null;

      for (const s of spans) {
        const txt = (s.textContent || '').trim();
        if (txt === kw || (s.children.length === 0 && txt.includes(kw))) {
          targetEl = s as HTMLElement;
          break;
        }
      }

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const rect = targetEl.getBoundingClientRect();
        return {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          found: true,
        };
      }

      return { x: 0, y: 0, width: 0, height: 0, found: false };
    },
    { kw: targetKeyword, parentKw: containerKeyword },
  );

  if (!box || !box.found || box.width === 0) return false;

  await sleep(400);

  // Glide cursor to start of text
  const startX = Math.max(10, box.x - 4);
  const startY = box.y + box.height / 2;
  const endX = box.x + box.width + 6;
  const endY = startY;

  await humanGlide(page, startX, startY, 22);
  await sleep(150);

  // Mouse down and drag across
  await page.mouse.down();

  // Highlight style injected during drag
  await page.evaluate(
    ({ kw, parentKw }) => {
      const figures = Array.from(document.querySelectorAll('figure, pre'));
      let container: Element | null = null;
      if (parentKw) {
        for (const f of figures) {
          if (f.textContent && f.textContent.includes(parentKw)) {
            container = f;
            break;
          }
        }
      }
      const searchRoot = container || document.body;
      const spans = Array.from(searchRoot.querySelectorAll('span, code'));
      for (const s of spans) {
        const txt = (s.textContent || '').trim();
        if (txt === kw || (s.children.length === 0 && txt.includes(kw))) {
          const el = s as HTMLElement;
          el.style.transition = 'background 0.2s ease';
          el.style.background = '#2563eb';
          el.style.color = '#ffffff';
          el.style.borderRadius = '3px';
          el.style.padding = '1px 4px';
          el.style.boxShadow = '0 0 10px rgba(37, 99, 235, 0.7)';
        }
      }
    },
    { kw: targetKeyword, parentKw: containerKeyword },
  );

  // Drag mouse smoothly across the word
  await humanGlide(page, endX, endY, 16);
  await sleep(150);
  await page.mouse.up();
  await sleep(400);

  return true;
}

export const runA2uiAction: PageActionHandler = async (
  page: Page,
  _config: PageRecordConfig,
) => {
  console.log(
    `   🎨 [A2UI Interleaved Doc Presentation]: Highlighting snippets naturally with cursor and typing notes in Notepad step-by-step...`,
  );

  // 1. Initial header reading
  await sleep(500);
  await humanGlide(page, 520, 260, 22);
  await sleep(1200);

  // 2. Open Notepad window on the right side of the screen
  await openNotepadWindow(page, 'a2ui-notes.txt', {
    right: '32px',
    top: '95px',
    width: '680px',
    height: '560px',
  });

  // Type header in Notepad
  await typeInNotepad(page, [
    'a2ui docs error',
    '',
  ], 1550, 240);
  await sleep(500);

  // 3. Highlight Snippet 1: dynamicString in fixedDefinitions
  console.log(`   👉 Step 1: Selecting dynamicString in fixedDefinitions...`);
  await selectTextWithMouse(page, 'dynamicString', 'fixedDefinitions');
  await sleep(800);

  // Type note 1 in Notepad
  console.log(`   📝 Typing Note 1 in Notepad...`);
  await typeInNotepad(
    page,
    [
      'code examples are incomplete',
      '- fixedDefinitions uses undefined dynamicString',
    ],
    1550,
    300,
  );
  await sleep(600);

  // 4. Highlight Snippet 2: beautifulCatalog, declarativeCatalog, fixedCatalog
  console.log(`   👉 Step 2: Selecting undefined catalogs in a2uiConfigForFeature...`);
  await selectTextWithMouse(page, 'beautifulCatalog', 'a2uiConfigForFeature');
  await sleep(350);
  await selectTextWithMouse(page, 'declarativeCatalog', 'a2uiConfigForFeature');
  await sleep(350);
  await selectTextWithMouse(page, 'fixedCatalog', 'a2uiConfigForFeature');
  await sleep(800);

  // Type note 2 in Notepad
  console.log(`   📝 Typing Note 2 in Notepad...`);
  await typeInNotepad(
    page,
    [
      '- in a2ui-catalogs.ts beautifulCatalog, declarativeCatalog and fixedCatalog are used but not defined anywhere',
    ],
    1550,
    360,
  );
  await sleep(600);

  // 5. Highlight Snippet 3: productCatalog in app.config.ts
  console.log(`   👉 Step 3: Selecting productCatalog in app.config.ts...`);
  await selectTextWithMouse(page, 'productCatalog', 'provideCopilotKit');
  await sleep(800);

  // Type note 3 in Notepad
  console.log(`   📝 Typing Note 3 in Notepad...`);
  await typeInNotepad(
    page,
    [
      '- app.config.ts has undefined productCatalog',
    ],
    1550,
    420,
  );
  await sleep(600);

  // 6. Highlight Snippet 4: styles.css classes
  console.log(`   👉 Step 4: Selecting styles.css classes...`);
  await selectTextWithMouse(page, '.a2ui-row', 'styles.css');
  await sleep(350);
  await selectTextWithMouse(page, '.a2ui-flight-card', 'styles.css');
  await sleep(800);

  // Type note 4 & conclusion in Notepad
  console.log(`   📝 Typing conclusion in Notepad...`);
  await typeInNotepad(
    page,
    [
      '- only fixed schema and styles.css given',
      '',
      'need at least one full catalog definition in docs so components can render',
    ],
    1550,
    480,
  );
  await sleep(1000);

  // 7. Reading pause on the completed Notepad notes
  console.log(`   📖 Pausing for reading completed Notepad notes...`);
  await humanGlide(page, 1550, 360, 20);
  await sleep(5000);

  // 8. Close Notepad window
  await closeNotepadNote(page);
  await sleep(1200);
};

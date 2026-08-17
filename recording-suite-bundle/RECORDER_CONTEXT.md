# 🎬 Automated Screen Recording & Demonstration Suite — Context & Porting Guide

This folder contains a complete, self-contained template of the **Automated Screen Recording & Demonstration Pipeline** built for CopilotKit + Angular test harnesses.

It captures high-definition walkthrough videos that showcase documentation compliance, real project source code, and live UI interactions.

---

## 📦 Bundle File Structure

```
recording-suite-bundle/
├── scripts/
│   ├── record-all-pages.ts        # 🎥 Playwright automation & video recording engine
│   └── generate-sources.ts       # 📄 Extracts real source files for the in-app IDE viewer
├── src/app/pages/
│   └── ide-view.component.ts      # 💻 Angular VS Code Dark IDE simulator component
├── sample_report.pdf              # 📑 Sample PDF document for attachment upload testing
└── RECORDER_CONTEXT.md            # 📖 This architecture & migration context guide
```

---

## 🏗️ Core Architecture & 3-Step Walkthrough

Every recorded page executes an automated **3-step sequence**:

```
[ Step 1: Official Doc Page ] ──> [ Step 2: VS Code IDE View ] ──> [ Step 3: Live Demo Interaction ]
  • Smooth human scrolling         • File Explorer tree selection    • Natural typing cadence
  • Code snippet glide & pause     • Line highlighting & scrolling   • Send button click & SSE stream
```

### 1. Built-in OS Simulation Elements:
- **Windows 11 Frosted Glass Taskbar**: Fixed 48px bottom bar with live ticking clock/date (`win11-time`, `win11-date`), sunny weather badge, Windows Start button, and dynamic active task indicators for Chrome, VS Code, and Notepad.
- **Visible OS Mouse Cursor**: Custom SVG mouse cursor rendered on a top z-index layer (`playwright-virtual-mouse`) with curved glide mathematics (`humanGlide`) and click-depression physics (`humanClick`).
- **Zero White Flash**: Pre-warmed dark canvas with dark background defaults between route transitions.
- **Windows 11 Notepad Developer Notes**: When a route encounters a known server-side limitation or partial status (e.g., Voice STT/TTS not enabled on backend), the engine clicks the taskbar Notepad icon, smoothly slides up a native Notepad window, and types casual developer explanations with human variable-speed cadence.

---

## 🚀 How to Port to a New Project (e.g., Angular + MS Agent Python)

### Step 1: Copy Files
Copy the contents into your new project:
- `scripts/record-all-pages.ts` ➔ `<new_project>/frontend/scripts/record-all-pages.ts`
- `scripts/generate-sources.ts` ➔ `<new_project>/frontend/scripts/generate-sources.ts`
- `src/app/pages/ide-view.component.ts` ➔ `<new_project>/frontend/src/app/pages/ide-view.component.ts`
- `sample_report.pdf` ➔ `<new_project>/frontend/sample_report.pdf`

### Step 2: Add Package Dependencies & Scripts
In `<new_project>/frontend/package.json`:
```json
"scripts": {
  "gen:sources": "tsx scripts/generate-sources.ts",
  "record": "tsx scripts/record-all-pages.ts"
},
"devDependencies": {
  "playwright": "^1.50.0",
  "tsx": "^4.19.0"
}
```
Install Playwright browser binaries:
```bash
npx playwright install chromium
```

### Step 3: Register the IDE Route in Angular
In your Angular routing file (`app.routes.ts`):
```typescript
import { Routes } from '@angular/router';
import { IdeViewComponent } from './pages/ide-view.component';

export const routes: Routes = [
  { path: 'ide', component: IdeViewComponent },
  // ... other demo routes
];
```

### Step 4: Adapt `record-all-pages.ts` Configurations
In `scripts/record-all-pages.ts`, update the `PAGES` array with your new framework's documentation URLs and backend file paths:

```typescript
export const PAGES: PageRecordConfig[] = [
  {
    id: 'quickstart',
    name: 'Quickstart',
    docUrl: 'https://docs.copilotkit.ai/angular/msagent/quickstart', // 👈 Doc URL
    ideFile: 'server.ts',                                           // 👈 File with agent runtime
    ideLine: 24,                                                    // 👈 Line with agent instantiation
    demoUrl: 'http://localhost:4200/quickstart/demo',
    prompt: 'Can you tell me a joke?',
  },
  {
    id: 'frontend-tools-generative-ui',
    name: 'Frontend Tools & Generative UI',
    docUrl: 'https://docs.copilotkit.ai/angular/msagent/guides/frontend-tools-generative-ui',
    ideFile: '../backend/agent.py',                                 // 👈 Point to MS Agent Python file
    ideLine: 18,
    demoUrl: 'http://localhost:4200/frontend-tools-generative-ui/demo',
    prompt: 'What is the weather in Tokyo?',
  },
  // ... configure other routes
];
```

### Step 5: Update `generate-sources.ts` Target Files
In `scripts/generate-sources.ts`, update `TARGETS` to point to your new backend files:
```typescript
const TARGETS = [
  'server.ts',
  'src/styles.css',
  'src/app/app.config.ts',
  'src/app/features',
  '../backend/agent.py',        // 👈 Update backend file name
  '../backend/pyproject.toml',
  '../.env.example',
];
```
Run:
```bash
npm run gen:sources
```

---

## 🎯 Key Angular Component Selectors Reference

These selectors match `@copilotkit/angular` components across all frameworks:

| Element | Angular DOM Selector |
| :--- | :--- |
| **Input Textarea** | `textarea, input[type="text"], [contenteditable="true"]` |
| **Send Button** | `button[type="submit"], button[aria-label="Send message"], button:has-text("Send")` |
| **Attachment `+` Button** | `button[aria-label="Add photos or files"], button[tooltipposition="below"].cdk-menu-trigger` |
| **Microphone Button** | `button[aria-label="Transcribe"], button[aria-label*="Transcribe"]` |
| **Dropdown Menu Items** | `[role="menuitem"], .cdk-menu-item` |
| **Tab Buttons** | `button:has-text("Inline chat"), button:has-text("Popup"), button:has-text("Sidebar")` |

---

## 🏃 Execution Commands

Run from the `frontend/` directory:

```bash
# Record all pages in sequence
npm run record

# Record a specific page individually
npm run record -- --page=quickstart
npm run record -- --page=chat-ui
npm run record -- --page=frontend-tools-generative-ui
npm run record -- --page=human-in-the-loop
npm run record -- --page=shared-state
npm run record -- --page=attachments
npm run record -- --page=headless
npm run record -- --page=voice-multimodal
```

### Output Location
All videos are automatically saved as high-definition `.webm` files in:
👉 `frontend/recordings/<page_id>.webm`

# Autorecording Suite — Project Porting & Integration Guide 🚀

Guide for porting/adapting the **3-step automated recording engine** to any project:

**Official Doc → Standalone VS Code → Live Demo**

Includes interactive Taskbar, human cursor, dynamic AI token-stream detection, Angular signal & zoneless compatibility, and service diagnostics.

## Architecture & Decoupling

The suite uses modular, plug-and-play layers:

```mermaid
graph TD
    A[record-all-pages.ts / CLI] --> B[recorder/engine.ts]
    B --> C[Step 1: Doc Scroller]
    B --> D[Step 2: Standalone VS Code IDE Simulator]
    B --> E[Step 3: Live Demo + Action Dispatcher]

    subgraph Fully Generic / Zero-Change Modules
        D
        F[overlays/taskbar.ts]
        G[overlays/cursor.ts]
        H[overlays/nextjs-error.ts]
        I[overlays/notepad.ts]
        J[ide/generator.ts]
    end

    subgraph Project-Specific Adaptation
        K[recorder/config.ts - Route Registry]
        L[recorder/actions/* - Page Interactions]
        M[recorder/diagnostics.ts - Health Checks]
    end

    B --> F
    B --> G
    B --> H
    E --> L
```

**Generic/zero-change:** `overlays/taskbar.ts`, `overlays/cursor.ts`, `overlays/nextjs-error.ts`, `overlays/notepad.ts`, `ide/generator.ts`.

**Project-specific:** `recorder/config.ts` (route registry), `recorder/actions/*` (page interactions), `recorder/diagnostics.ts` (health checks).

---

## Step 1 — Verify Dependencies & Environment

Inside `autorecord/package.json`:

```json
{
  "name": "autorecord",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "record": "tsx record-all-pages.ts"
  },
  "dependencies": {
    "playwright": "^1.51.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "tsx": "^4.19.3",
    "typescript": "^5"
  }
}
```

Install dependencies + Chromium:

```bash
cd autorecord
npm install
npx playwright install chromium
```

---

## Step 2 — 3-Tier Port Configuration

In this Angular + Microsoft Agent Framework harness:
1. **Frontend (Angular 22)**: Port `4200` (`http://localhost:4200`)
2. **Copilot Runtime (Node.js)**: Port `8201` (`http://localhost:8201/api/copilotkit`)
3. **Backend (Python / FastAPI)**: Port `8200` (`http://localhost:8200`)

`autorecord/recorder/diagnostics.ts` verifies all three ports before recording begins.

---

## Step 3 — Route Registry in `recorder/config.ts`

`recorder/config.ts` is the **single source of truth** for recorded pages.

Each `PageRecordConfig` defines:

| Field               | Purpose                                                  |
| ------------------- | -------------------------------------------------------- |
| `id`                | Unique CLI ID used by `--page=<id>`                      |
| `name`              | Clean feature title                                      |
| `filename`          | Exported video filename, e.g. `MSPY-angular-01-Quickstart` |
| `docUrl`            | Official documentation URL for Step 1                    |
| `demoUrl`           | Local Step 3 URL, e.g. `http://localhost:4200/quickstart/demo` |
| `ideFile`           | Source file highlighted in Step 2                        |
| `startLine`, `endLine` | VS Code highlighted range                             |
| `prompt`            | Prompt typed in Step 3                                   |
| `waitAfterPromptMs` | Post-stream reading pause                                |

---

## Step 4 — Active Token-Stream Stability & Response Detection

Do **not** rely on fixed timers or brittle spinner selectors. Use `waitForAgentResponseCompletion()` with text-stability polling.

Behavior:
1. Wait up to **30s** for an assistant message or generative UI component (`app-weather-card`, `app-approval-card`) to begin receiving content.
2. Poll the latest assistant message every **400ms**.
3. Once started, poll every **500ms**, up to **45s**.
4. Compare current vs previous text.
5. **4 consecutive identical checks = 2 seconds of stability = streaming complete.**
6. Log completion with character count.
7. Glide cursor over the completed assistant response or tool card.
8. Pause `postWaitMs` for comfortable reading.

---

## Step 5 — Running the Suite

```bash
cd autorecord

# Individual feature test
npm run record -- --page=quickstart
npm run record -- --page=chat-ui
npm run record -- --page=frontend-tools-generative-ui
npm run record -- --page=human-in-the-loop
npm run record -- --page=shared-state
npm run record -- --page=headless

# All registered routes
npm run record
```

Videos are exported to `autorecord/videos/` as **1080p, 60fps WebM** files (`MSPY-angular-*.webm`).

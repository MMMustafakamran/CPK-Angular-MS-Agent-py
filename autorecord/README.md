# CopilotKit + Microsoft Agent Framework (Python) Autorecording Suite — Angular 🎬

Automated, high-fidelity Playwright screen-demo/video engine for the **CopilotKit Angular 22 + Microsoft Agent Framework (Python)** integration test harness.

## Contents

- [Overview](#overview)
- [3-Step Video Workflow](#3-step-video-workflow)
- [Architecture & 3-Tier Model](#architecture--3-tier-model)
- [Directory Structure](#directory-structure)
- [Specialized Action Handlers & Overlays](#specialized-action-handlers--overlays)
- [Prerequisites & Getting Started](#prerequisites--getting-started)
- [Usage & CLI Reference](#usage--cli-reference)
- [Configured Pages & Route Mapping](#configured-pages--route-mapping)
- [Output Videos](#output-videos)
- [Troubleshooting & Diagnostics](#troubleshooting--diagnostics)

---

## Overview

The **Autorecord Suite** is a Playwright recording pipeline for professional, human-like demos covering official documentation, generative UI components, human-in-the-loop (HITL) decisions, shared agent state, attachments, and headless custom transcripts.

### Key capabilities

- **Zero black screen / instant paint:** Uses `domcontentloaded` to start on the rendered docs page without dead frames.
- **Realistic app switching:** Virtual cursor clicks simulated Windows 11 Taskbar icons; active apps receive blue glow bars (`#60a5fa`).
- **Pure VS Code simulation:** Step 2 is isolated HTML/CSS generated from local files, independent of frontend dev servers.
- **Angular 22 reactivity & zoneless readiness:** Waits for Angular component readiness, signal rendering, and DOM stability.
- **Interactive Attachments & UI Actions:** Automates multi-step Angular CDK menus, file upload injection via `DataTransfer`, and coordinate re-measuring for dynamic thumbnail containers.
- **Windows 11 Notepad Developer Overlays:** Automatically slides up an authentic Notepad window to type developer notes (e.g. for voice TTS, cloud authentication requirements, and A2UI catalog schema documentation gaps) with human typing cadence.
- **Dynamic AI response detection:** Observes chat DOM with text-stability polling across streaming assistant tokens, tool card renderers (`WeatherCardComponent`, `ApprovalCardComponent`), and custom headless transcripts with a comfortable **4-second** post-response pause.
- **Pre-flight diagnostics:** Automatically verifies the 3-tier distributed stack:
  - Angular Frontend (`http://localhost:4200`)
  - Node.js Copilot Runtime (`http://localhost:8201/api/copilotkit`)
  - Microsoft Agent Framework FastAPI (`http://localhost:8200`)
- **Human-like motion:** Cubic Bézier cursor paths, Fitts's-law acceleration, typing jitter, and smooth scrolling.

---

## 3-Step Video Workflow

```mermaid
graph LR
    A[Step 1: Official Doc Page] -- Click Taskbar: VS Code --> B[Step 2: VS Code IDE View]
    B -- Click Taskbar: Chrome --> C[Step 3: Live Interactive Demo]
    C --> D[Video Export: autorecord/videos/*.webm]
```

### 1. Official Documentation
- Opens the official CopilotKit Angular docs URL: `https://docs.copilotkit.ai/angular/ms-agent-python/...`
- Moves cursor to reading position, scrolls at human cadence, and hovers over code.
- Moves to `#win11-taskbar-vscode`, clicks VS Code, and activates its blue glow bar (`#60a5fa`).

### 2. VS Code IDE View
- **Step 2a (Quickstart):** Displays `frontend/package.json` highlighting `@copilotkit/angular`, `@copilotkit/runtime`, and `@ag-ui/client`.
- **Step 2b:** Displays the implementation file (e.g. `quickstart-chat.ts`, `tools-chat.component.ts`, `server.ts`, `main.py`) with `startLine`/`endLine` highlighting in VS Code Dark+ (`vs-dark`).
- Cursor moves naturally across the code.
- Cursor moves to `#win11-taskbar-chrome`, clicks Chrome, and activates its blue glow bar.

### 3. Live Interactive Demo
- Opens isolated chrome-free demo endpoint: `http://localhost:4200/<route>/demo`.
- Injects simulated Windows 11 Taskbar with live clock, Start menu, and active-app indicators.
- Executes tailored interactions:
  - **Attachments:** Clicks `+` button → selects `Add photos or files` CDK menuitem → attaches `sample_chart.png` → showcases `copilot-chat-attachment-queue` preview chip → types prompt & submits.
  - **Voice & Multimodal:** Clicks the Voice Mic (`button[aria-label="Transcribe"]`) → opens Notepad typing server TTS explanation note → closes Notepad.
  - **Threads:** Showcases `injectThreads` list & `CopilotThreadsDrawer` → opens Notepad typing cloud auth requirement note → closes Notepad.
  - **Chat UI:** Cycles across all 4 surfaces (Inline scoped CSS, Custom Assistant Message, Popup, Sidebar).
  - **Tools & Gen UI:** Renders `WeatherCardComponent` server tool & applies `change_background` client gradient.
  - **Human-In-The-Loop:** Detects `ApprovalCardComponent` & glides to click "Approve".
  - **Shared State:** Clicks "Mark high priority" in `WorkspaceComponent` & queries agent context.
- Detects AI token-stream completion and pauses **4 seconds** for reading.

---

## Architecture & 3-Tier Model

Unlike single-backend architectures, this project operates in a **3-tier distributed model**:

```mermaid
flowchart LR
    subgraph Browser ["Frontend (Angular 22)"]
        UI["@copilotkit/angular\n(Port 4200)"]
    end

    subgraph Runtime ["Copilot Runtime (Node.js)"]
        CR["@copilotkit/runtime/v2\n(Port 8201 /api/copilotkit)"]
    end

    subgraph Backend ["Agent Framework (Python / FastAPI)"]
        AF["FastAPI + Agent Framework\n(Port 8200 /)"]
    end

    UI -- "SSE Events" --> CR
    CR -- "AG-UI protocol" --> AF
```

---

## Directory Structure

```text
autorecord/
├── record-all-pages.ts        # CLI entrypoint + batch runner + summary
├── README.md                  # Root guide (this file)
├── PORTING_GUIDE.md           # Architecture/porting docs
├── package.json               # Playwright + TSX dependencies
├── tsconfig.json              # TypeScript config
├── videos/                    # Exported WebM videos (MSPY-angular - <NN><Feature>.webm)
│   ├── MSPY-angular - 01Quickstart.webm
│   ├── MSPY-angular - 05VoiceMultimodal.webm
│   ├── MSPY-angular - 08Threads.webm
│   ├── MSPY-angular - 10Attachments.webm
│   └── ...
└── recorder/
    ├── README.md              # Recorder architecture
    ├── types.ts               # Interfaces/config schemas
    ├── config.ts              # Route registry + files/line ranges + 4s pause
    ├── engine.ts              # Playwright lifecycle + recording coordinator
    ├── diagnostics.ts         # Health checks + error matcher
    ├── ide/
    │   └── generator.ts       # Pure HTML/CSS VS Code Dark+ simulator
    ├── overlays/
    │   ├── taskbar.ts         # Windows 11 Taskbar + app switching
    │   ├── cursor.ts          # Cursor physics/Bézier easing/typing
    │   └── notepad.ts         # Slide-up Notepad developer-note simulator (showNotepadNote / closeNotepadNote)
    ├── assets/
    │   └── sample_chart.png   # Sample image attachment asset
    └── actions/
        ├── a2ui.action.ts          # Prompt submission + Notepad catalog incompleteness explanation note
        ├── attachments.action.ts   # Interactive + button, CDK menu, DataTransfer & thumbnail showcase
        ├── voice.action.ts         # Transcribe mic button click + Notepad TTS explanation note
        ├── threads.action.ts       # Thread list & drawer showcase + Notepad cloud auth note
        ├── chat-ui.action.ts       # 4-surface tab switcher (Inline -> Custom -> Popup -> Sidebar)
        ├── tools.action.ts         # WeatherCardComponent + change_background tool
        ├── hitl.action.ts          # HITL ApprovalCardComponent + "Approve" click
        ├── shared-state.action.ts  # Workspace priority toggle + reactive contexts
        ├── headless-ui.action.ts   # Custom headless composer & transcript
        ├── memory.action.ts        # Memory list & fallback state
        └── index.ts                # Dispatcher + standard chat fallback (4s reading pause)
```

---

## Special Action Handlers & Overlays

### 1. Interactive Attachments (`attachments.action.ts`)
- Glides cursor to the `+` (`Add photos or files`) button.
- Clicks `+` to open the Angular CDK Menu.
- Glides to and clicks the `Add photos or files` menu item.
- Dynamically assigns `sample_chart.png` via `DataTransfer` to `input[type="file"]` and dispatches `change`.
- Glides over the rendered `<copilot-chat-attachment-queue>` preview thumbnail.
- Re-measures the shifted textarea position, types the prompt, and submits.

### 2. Voice & Multimodal (`voice.action.ts`)
- Targets the microphone button `button[aria-label="Transcribe"]` next to Send.
- Clicks the microphone button and showcases the active recording state.
- Opens Windows 11 **Notepad** from the taskbar and types:
  ```text
  NOTE: Voice & Audio Transcription

  - voice works on browser but no tts implemented in the server file thus not working
  ```
- Closes Notepad and completes the recording.

### 3. Threads & Cloud Auth (`threads.action.ts`)
- Showcases the Headless thread list (`app-thread-list` on `injectThreads`) and `CopilotThreadsDrawer`.
- Opens Windows 11 **Notepad** and types:
  ```text
  NOTE: Threads & Cloud Authentication

  - the project isnt authenticated by the copilotkit cloud via browser as the initial setup wasnt done through copilotkit cli
  ```
- Closes Notepad and completes the recording.

### 4. A2UI Schemas & Incomplete Catalog Documentation (`a2ui.action.ts`)
- **Doc-Only Interleaved Presentation Mode**: Stays on the official documentation page while opening a side-by-side Windows 11 Notepad window (`a2ui-issue.txt`) on the right.
- **Natural Mouse Drag-Selection (Blue Text Highlight)**:
  - **Step 1**: Drags cursor across `dynamicString` in `fixedDefinitions` in blue -> moves to Notepad and types Note 1.
  - **Step 2**: Drags cursor across `beautifulCatalog`, `declarativeCatalog`, and `fixedCatalog` in `a2uiConfigForFeature` in blue -> moves to Notepad and types Note 2.
  - **Step 3**: Drags cursor across `productCatalog` in `app.config.ts` in blue -> moves to Notepad and types Note 3.
  - **Step 4**: Drags cursor across `.a2ui-row` and `.a2ui-flight-card` in `styles.css` in blue -> moves to Notepad and types the conclusion.
- **Hurried Developer Notepad Note**:
  ```text
  Issue in A2UI schemas styling & recovery docs:

  - code examples provided are incomplete
  - in a2ui-catalogs.ts, fixedDefinitions uses undefined dynamicString
  - beautifulCatalog, declarativeCatalog & fixedCatalog are referenced in a2uiConfigForFeature but not defined anywhere
  - app.config.ts references undefined productCatalog
  - only raw fixed schema definition and styles.css are given
  - without catalog definition a2ui components cannot render in chat

  please elaborate docs to include at least one complete catalog definition so users can integrate it
  ```
- **Reading Pause & Cleanup**: Pauses 5 seconds on the completed notes, clicks `✕` to close Notepad, and finishes.

---

## Prerequisites & Getting Started

### 1. Microsoft Agent Framework backend (Port 8200)

```bash
cd backend
uv run main.py
```

### 2. Copilot Runtime (Port 8201) & Angular Frontend (Port 4200)

```bash
cd frontend
npm run dev
```

### 3. Autorecord dependencies

```bash
cd autorecord
npm install
npx playwright install chromium
```

---

## Usage & CLI Reference

Record an individual feature:

```bash
npm run record -- --page=<id>
```

Available page IDs:

| #   | ID                             | Route                                  |
| --- | ------------------------------ | -------------------------------------- |
| 1   | `quickstart`                   | `/quickstart/demo`                     |
| 2   | `chat-ui`                      | `/chat-ui/demo`                        |
| 3   | `frontend-tools-generative-ui` | `/frontend-tools-generative-ui/demo`   |
| 4   | `a2ui`                         | `/a2ui/demo`                           |
| 5   | `voice-multimodal`             | `/voice-multimodal/demo`               |
| 6   | `human-in-the-loop`            | `/human-in-the-loop/demo`              |
| 7   | `shared-state`                 | `/shared-state/demo`                   |
| 8   | `threads`                      | `/threads/demo`                        |
| 9   | `memory`                       | `/memory/demo`                         |
| 10  | `attachments`                  | `/attachments/demo`                    |
| 11  | `headless`                     | `/headless/demo`                       |
| 12  | `copilot-runtime`              | `/quickstart/demo` (server.ts focus)   |
| 13  | `backend-agent`                | `/quickstart/demo` (main.py focus)     |

Examples:

```bash
npm run record -- --page=quickstart
npm run record -- --page=chat-ui
npm run record -- --page=frontend-tools-generative-ui
npm run record -- --page=voice-multimodal
npm run record -- --page=human-in-the-loop
npm run record -- --page=shared-state
npm run record -- --page=threads
npm run record -- --page=attachments
npm run record -- --page=headless
```

Record **all configured pages sequentially**:

```bash
npm run record
```

---

## Configured Pages & Route Mapping

| ID                             | Video Output                              | Demo Route                             | Highlighted Source File                                   | Lines  |
| ------------------------------ | ----------------------------------------- | -------------------------------------- | --------------------------------------------------------- | ------ |
| `quickstart`                   | `MSPY-angular - 01Quickstart.webm`        | `/quickstart/demo`                     | `frontend/src/app/features/quickstart/quickstart-chat.ts` | 1–16   |
| `chat-ui`                      | `MSPY-angular - 02ChatUi.webm`            | `/chat-ui/demo`                        | `frontend/src/app/features/chat-ui/chat-ui-demo.component.ts` | 28–110 |
| `frontend-tools-generative-ui` | `MSPY-angular - 03FrontendToolsGenUI.webm`| `/frontend-tools-generative-ui/demo`   | `frontend/src/app/features/tools/tools-chat.component.ts` | 22–66  |
| `a2ui`                         | `MSPY-angular - 04A2UI.webm`              | `Doc-Only` (`guides/a2ui`)             | `Official A2UI Doc + a2ui-issue.txt`                     | Interleaved |
| `voice-multimodal`             | `MSPY-angular - 05VoiceMultimodal.webm`   | `/voice-multimodal/demo`               | `frontend/src/app/features/media/voice-chat.component.ts` | 13–32  |
| `human-in-the-loop`            | `MSPY-angular - 06HumanInTheLoop.webm`    | `/human-in-the-loop/demo`              | `frontend/src/app/features/hitl/approval-card.component.ts` | 18–42  |
| `shared-state`                 | `MSPY-angular - 07SharedState.webm`       | `/shared-state/demo`                   | `frontend/src/app/features/shared-state/workspace.component.ts` | 21–51  |
| `threads`                      | `MSPY-angular - 08Threads.webm`           | `/threads/demo`                        | `frontend/src/app/features/threads/threads-demo.component.ts` | 10–35  |
| `memory`                       | `MSPY-angular - 09Memory.webm`            | `/memory/demo`                         | `frontend/src/app/features/memory/memory-demo.component.ts` | 10–30  |
| `attachments`                  | `MSPY-angular - 10Attachments.webm`       | `/attachments/demo`                    | `frontend/src/app/features/attachments/media-chat.component.ts` | 8–28   |
| `headless`                     | `MSPY-angular - 11HeadlessUI.webm`        | `/headless/demo`                       | `frontend/src/app/features/headless/headless-chat.component.ts` | 12–66  |
| `copilot-runtime`              | `MSPY-angular - 12CopilotRuntime.webm`    | `/quickstart/demo`                     | `frontend/server.ts`                                      | 24–61  |
| `backend-agent`                | `MSPY-angular - 13BackendAgent.webm`      | `/quickstart/demo`                     | `backend/main.py`                                         | 74–111 |

---

## Output Videos

- **Directory:** `autorecord/videos/`
- **Resolution:** 1920 × 1080 (1080p Full HD)
- **Framerate:** 60 FPS
- **Container:** WebM
- **Naming format:** `MSPY-angular - <NN><FeatureName>.webm`

---

## Troubleshooting & Diagnostics

### 1. Python Backend unreachable (Port 8200)
- **Error:** `Microsoft Agent Framework Backend (port 8200) is unreachable`
- **Fix:**
  ```bash
  cd backend
  uv run main.py
  ```

### 2. Copilot Runtime unreachable (Port 8201)
- **Error:** `Copilot Runtime Node.js (port 8201) is unreachable`
- **Fix:**
  ```bash
  cd frontend
  npm run runtime
  ```

### 3. Angular Frontend unreachable (Port 4200)
- **Error:** `Angular Frontend (port 4200) is unreachable`
- **Fix:**
  ```bash
  cd frontend
  npm start
  ```
  *(Or run `npm run dev` in `frontend/` to launch runtime and Angular concurrently)*

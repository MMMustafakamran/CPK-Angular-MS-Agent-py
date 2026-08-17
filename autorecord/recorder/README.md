# Screen Recording Automation Suite — Angular 22 & CopilotKit

Automated Playwright test and recording engine for **Angular 22 (Zoneless + Signal-based)** and **CopilotKit + Microsoft Agent Framework (Python)**.

## Directory Structure

```text
autorecord/
├── record-all-pages.ts        # CLI entrypoint & batch runner with summary report
├── README.md                  # Comprehensive root guide
├── PORTING_GUIDE.md           # Architecture & porting reference
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript compilation configuration
├── videos/                    # Output directory for exported WebM videos
└── recorder/
    ├── README.md              # Architecture reference (this file)
    ├── types.ts               # Interface definitions
    ├── config.ts              # Page configurations and line ranges for all 13 routes
    ├── engine.ts              # Playwright browser lifecycle, taskbar transitions & coordinator
    ├── diagnostics.ts         # Pre-flight service checks (Angular :4200, Runtime :8201, Backend :8200)
    ├── ide/
    │   └── generator.ts       # Standalone pure HTML/CSS VS Code Dark+ simulator
    ├── overlays/
    │   ├── taskbar.ts         # Windows 11 taskbar simulation & app switching
    │   ├── cursor.ts          # Virtual mouse cursor physics and Bézier animations
    │   ├── nextjs-error.ts    # Error overlay fallback utilities
    │   └── notepad.ts         # Slide-up Notepad developer notes
    └── actions/
        ├── chat-ui.action.ts       # 4-surface switcher: Inline chat -> Custom message -> Popup -> Sidebar
        ├── tools.action.ts         # Server tool (WeatherCardComponent) + Client tool (change_background)
        ├── hitl.action.ts          # Human-in-the-loop decision card + "Approve" button interaction
        ├── shared-state.action.ts  # Workspace priority toggle + reactive context cards
        ├── headless-ui.action.ts   # Hand-built headless composer & transcript over injectAgentStore
        ├── voice.action.ts         # Voice input & multimodal attachments controls
        ├── threads.action.ts       # Headless thread list & CopilotThreadsDrawer
        ├── memory.action.ts        # injectMemories list & runtime fallback
        └── index.ts                # Action dispatcher & standard chat submission
```

---

## 3-Step Demonstration Workflow

1. **Step 1 — Official Documentation View**:
   - Opens the official CopilotKit Angular docs URL (`https://docs.copilotkit.ai/angular/ms-agent-python/...`).
   - Smoothly scrolls through content at human reading cadence and focuses cursor on the code block.
   - Glides cursor down to the simulated Windows 11 Taskbar and clicks the **VS Code** icon (illuminating its blue glow bar).

2. **Step 2 — Visual Studio Code IDE View**:
   - Renders a standalone VS Code dark theme interface (`vs-dark`) generated directly from project source files on disk via `autorecord/recorder/ide/generator.ts`.
   - Renders a clean Explorer sidebar with expanded Angular project structure (`frontend/src/app/`, `frontend/server.ts`, `backend/main.py`).
   - Highlights the exact snippet lines (`startLine` to `endLine`) in the project source file and smoothly glides cursor down the code.
   - Glides cursor down to the Taskbar and clicks the **Chrome** icon (illuminating its blue glow bar).

3. **Step 3 — Live Interactive Demonstration**:
   - Navigates directly to the isolated demo endpoint (`http://localhost:4200/<route>/demo`).
   - Injects the simulated Windows 11 Taskbar + Virtual Mouse cursor.
   - Types tailored prompts with natural keystroke timing and executes interactions (e.g. Chat UI tab switching, Generative WeatherCard rendering, HITL approval gate, Headless custom transcript, Shared State priority updates).

4. **Video Export**:
   - Clean runs saved to `autorecord/videos/MSPY-angular-<FeatureName>.webm` (`✅ [PASS]`).

---

## Prerequisites & Running

### 1. Ensure services are running:

- **Terminal 1 — Python Backend (port 8200):**
  ```bash
  cd backend
  uv run main.py
  ```

- **Terminal 2 — Copilot Runtime (port 8201) & Angular Frontend (port 4200):**
  ```bash
  cd frontend
  npm run dev
  # Alternatively:
  # npm run runtime  (Terminal 2 - Port 8201)
  # npm start        (Terminal 3 - Port 4200)
  ```

### 2. Run recordings:

```bash
cd autorecord

# Record an individual page
npm run record -- --page=quickstart
npm run record -- --page=chat-ui
npm run record -- --page=frontend-tools-generative-ui
npm run record -- --page=human-in-the-loop
npm run record -- --page=shared-state
npm run record -- --page=headless

# Record all 13 configured pages sequentially
npm run record
```

# CopilotKit + Microsoft Agent Framework — Angular test harness

A navigable test harness for the Angular + Microsoft Agent Framework (Python)
section of the CopilotKit docs. Every guide in the sidebar is a route, and each
route runs the thing its doc page teaches rather than restating it.

Tracks **<https://docs.copilotkit.ai/angular/ms-agent-python>**.

| | |
|---|---|
| **Frontend** | Angular 22.1.1 · TypeScript 6.0 · Tailwind 4 · zoneless |
| **CopilotKit** | `@copilotkit/angular` 0.3.1 · `@copilotkit/runtime` 1.67.1 |
| **AG-UI binding** | `@ag-ui/client` 0.0.57 (`HttpAgent`) |
| **Backend** | Python 3.13 · `agent-framework-ag-ui` 1.0.1 · FastAPI on uvicorn |

---

## Architecture

Three processes, not two. Unlike the React/Next quickstart — where the runtime
lives inside the Next app as an API route — Angular has no server route to host
it, so the Copilot Runtime is its own Node process.

```
Browser (Angular 22, zoneless)          ← localhost:4200
  │  @copilotkit/angular — provideCopilotKit, <copilot-chat>, signal APIs
  │  POST http://localhost:8201/api/copilotkit
  ▼
Copilot Runtime  ·  localhost:8201      ← Node, frontend/server.ts
  │  agents: { default, support } → new HttpAgent({ url })
  │  a2ui: {}  → A2UIMiddleware
  │  POST http://localhost:8200/        ← AG-UI over SSE
  ▼
Microsoft Agent Framework · localhost:8200   ← Python / FastAPI
  │  add_agent_framework_fastapi_endpoint(app, agent, path="/")
  ▼
OpenAI  (gpt-4o-mini)
```

Two things worth knowing:

- **The model key never reaches the browser**, and never reaches the runtime
  either. Only the Python process holds it.
- **`default` and `support` both resolve to the same agent.** `default` is the
  id CopilotKit's prebuilt components use with no configuration; `support`
  exists so the Chat UI and Threads guides' snippets — written as
  `agentId="support"` — run exactly as published.

There is no `@ag-ui/microsoft-agent-framework` package. The Agent Framework
mounts a plain AG-UI-over-HTTP endpoint, so the generic `HttpAgent` from
`@ag-ui/client` is the binding.

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 22+ (built on 24.16.0) | The Angular quickstart specifies Node 22. |
| npm | 10+ (built on 12.0.1) | Or pnpm/yarn. |
| Python | 3.13+ | Per `backend/.python-version`. |
| [`uv`](https://docs.astral.sh/uv/) | 0.11+ | Used for the backend. `pip` works too. |
| OpenAI **or** Azure OpenAI key | — | Required — the backend refuses to start without one. |

`@angular/cdk` must share your Angular major version. If you hit a
peer-dependency error, pin it explicitly (`@angular/cdk@^22` on Angular 22).

---

## Setup

**1. Install frontend dependencies**

```bash
cd frontend && npm install && cd ..
```

**2. Install backend dependencies**

```bash
cd backend && uv sync && cd ..
```

**3. Provide a model key**

The backend calls `load_dotenv()`, so create `backend/.env`:

```bash
echo 'OPENAI_API_KEY=sk-...' > backend/.env
```

`_build_chat_client()` in `backend/main.py` picks a client in this order — Azure
first, then plain OpenAI — and raises `RuntimeError` if neither is configured:

| Variable | Where | What it does |
|---|---|---|
| `AZURE_OPENAI_ENDPOINT` | `backend/.env` | Set this **and** `AZURE_OPENAI_API_KEY` to use Azure. |
| `AZURE_OPENAI_API_KEY` | `backend/.env` | Azure key. |
| `AZURE_OPENAI_CHAT_DEPLOYMENT_NAME` | `backend/.env` | Azure deployment. Defaults to `gpt-4o-mini`. |
| `OPENAI_API_KEY` | `backend/.env` | **Required** unless using Azure. |
| `OPENAI_CHAT_MODEL_ID` | `backend/.env` | Defaults to `gpt-4o-mini`. |
| `MICROSOFT_AGENT_FRAMEWORK_URL` | shell, for the runtime | Where the runtime finds the agent. Defaults to `http://localhost:8200/`. |
| `PORT` | shell, for the runtime | Runtime port. Defaults to `8201`. |
| `COPILOTKIT_TELEMETRY_DISABLED` | shell, for the runtime | Opt out of anonymous runtime telemetry. |

> The Angular app's `runtimeUrl` is hardcoded to
> `http://localhost:8201/api/copilotkit` in `frontend/src/app/app.config.ts`,
> following the quickstart. If you change `PORT`, change that too.

**Default ports:** frontend **4200**, runtime **8201**, agent **8200**.

---

## Running the project

Two terminals. The Python agent gets its own; the two Node processes share one.

**Terminal 1 — the agent:**

```bash
cd backend
uv run main.py
```

Success looks like:

```
INFO:     Uvicorn running on http://0.0.0.0:8200 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

**Terminal 2 — the runtime and the app together:**

```bash
cd frontend
npm run dev
```

`dev` runs the Copilot Runtime and `ng serve` side by side under `concurrently`,
each line prefixed by which process wrote it. Success looks like:

```
[runtime] Copilot Runtime listening at http://localhost:8201/api/copilotkit
[runtime] Microsoft Agent Framework agent: http://localhost:8200/
[angular]   ➜  Local:   http://localhost:4200/
```

Ctrl-C stops both. `--kill-others` means a crash in either one takes the other
down rather than leaving half a stack running.

To run them separately — different terminals, independent restarts:

```bash
npm run runtime   # Copilot Runtime only, :8201
npm start         # Angular dev server only, :4200
```

Then open **<http://localhost:4200>**.

---

## Verify it works

The Introduction route (`/`) probes both processes and shows a connection panel
with a green or red dot for each — check it first if anything misbehaves.

From the command line, the check the quickstart prescribes:

```bash
curl -s http://localhost:8201/api/copilotkit/info
```

It should list `default` and `support` under `agents`, with
`"a2uiEnabled": true`.

The agent's AG-UI endpoint is **POST-only**, so there is no health route to
`GET`. FastAPI's generated schema is the reachability signal:

```bash
curl -s http://localhost:8200/openapi.json | head -c 100
```

End to end, go to `/quickstart` and send *Can you tell me a joke?* — tokens
should stream in one at a time and render as markdown.

---

## Troubleshooting

**`EADDRINUSE` on 8200 or 8201.** Something else holds the port. Both are
overridable: `PORT=9000 npm run runtime` for the runtime, and the agent's port
is the `uvicorn.run(...)` call at the bottom of `backend/main.py`. If you move
the runtime, update `runtimeUrl` in `frontend/src/app/app.config.ts` too.

**`RuntimeError: Set either AZURE_OPENAI_ENDPOINT + AZURE_OPENAI_API_KEY, or
OPENAI_API_KEY.`** The backend found no key — `backend/.env` is missing or
empty.

**Chat sends but nothing streams; `RUN_ERROR` with `ChatClientException`.** The
runtime reached the agent and the agent's model call failed. Check the Python
terminal — a `401` there means a bad or expired model key.

**Chat sends and the runtime logs a connection error.** The agent process is
down, or `MICROSOFT_AGENT_FRAMEWORK_URL` points somewhere else. The endpoint is
`POST /` at the root, *not* a sub-path.

**Threads and Memory routes look empty.** Expected. Both are Enterprise
Intelligence Platform capabilities served by the runtime; without a license key
the list is empty and the drawer renders its locked state by design.

**Voice transcription fails.** Expected. The microphone records, but this
runtime has no transcription service configured — `/info` reports
`audioFileTranscriptionEnabled: false`.

---

## Known gaps

Two demos are wired correctly but won't produce their intended result against
the agent as currently written in `backend/main.py`. Both are backend-shape
mismatches, not connection problems.

| Route | Frontend expects | Backend declares | Fix |
|---|---|---|---|
| `/shared-state` | state `{ notes, priority }` | `state_schema` of `{ language }` | Align the schema on either side. |
| `/frontend-tools-generative-ui` | tool `getWeather(city)` | `get_weather(location)` | Rename one side — `registerRenderToolCall({ name })` matches by exact string, and a mismatch fails silently as plain text. |

`/human-in-the-loop`'s interrupt panel also stays idle: the agent is built with
`require_confirmation=False`, so it never emits an AG-UI interrupt.

A2UI is inert until a catalog is supplied. `/info` reports `a2uiEnabled: true`,
but it is `a2ui.catalog` on the frontend that registers the `render_a2ui`
renderer, and the guide's catalog snippet is not self-contained.

---

## Project layout

```
ms-agent-py/
├── backend/
│   ├── main.py            ← the agent, its tools, and the AG-UI endpoint
│   └── pyproject.toml
└── frontend/
    ├── server.ts          ← Copilot Runtime; the one file that ties CopilotKit to the agent
    ├── scripts/
    │   └── generate-sources.ts   ← reads real source off disk for the on-page listings
    └── src/app/
        ├── app.config.ts  ← provideCopilotKit, runtimeUrl
        ├── lib/nav-config.ts     ← routes, doc links, and status, described once
        ├── pages/         ← one page per doc guide: notes, pass/fail, source
        └── features/      ← the code each guide teaches, mounted for real
```

Routes with a live feature are split in two: `<route>` holds the notes and the
exact source that runs, and `<route>/demo` holds just the running feature with
no page chrome.

---

## Other scripts

All run from `frontend/`.

```bash
npm run build        # production build to dist/frontend
npm test             # Vitest
npm run gen:sources  # refresh the on-page source listings (runs automatically on start/build)
npm run watch        # development build in watch mode
```

`gen:sources` reads the real files off disk into
`src/app/lib/generated-sources.ts`, so the code shown on a route is what
actually runs. Angular's esbuild pipeline has no `?raw` import, which is why
this is a `prestart`/`prebuild` step rather than an import.

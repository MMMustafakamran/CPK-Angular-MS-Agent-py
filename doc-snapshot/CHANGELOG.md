# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-08-18

### 07:00 UTC — 3 pages, highest severity high

**High — Introduction** · _local snapshot edit, not an upstream change_

`/angular/ms-agent-python` · routes `/`, `/doc-sync` · under “Create your Angular app” · in a `bash` block

2 code lines changed.

````diff
- 
+ cd my-copilot-app
````

**High — Human-in-the-loop and interrupts** · _local snapshot edit, not an upstream change_

`/angular/ms-agent-python/guides/human-in-the-loop` · route `/human-in-the-loop` · under “Human-in-the-loop and interrupts”

4 code lines, 2 prose lines changed.

````diff
+ Use a tool when the model should decide whether to ask. Use an interrupt when
+ the backend workflow must stop at a fixed checkpoint.
+ type ApprovalArgs = {
+ action: string;
+ reason: string;
+ };
````

**Low — Voice and multimodal input** · _local snapshot edit, not an upstream change_

`/angular/ms-agent-python/guides/voice-multimodal` · route `/voice-multimodal` · under “Accept voice input”

2 prose lines changed.

````diff
+ Voice requests can call the same backend tools as typed requests. Register
+ renderers only for the exact tool names your backend exposes:
````

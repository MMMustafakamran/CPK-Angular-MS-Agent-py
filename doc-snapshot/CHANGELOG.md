# Doc drift changelog

What the CopilotKit Angular + Microsoft Agent Framework docs changed under this repo.
Only pages that actually moved are recorded — a sync that finds everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth date, the oldest entry is dropped.

## 2026-08-26

### 20:04 UTC — 4 pages, highest severity high

**Medium — Angular**

`/angular/ms-agent-python` · route `/` · under “Next steps”

0 code lines, 227 prose lines changed.

```diff
- # Introduction
+ # Angular
  
- > Bring your Microsoft Agent Framework agents to your Angular users with CopilotKit via AG-UI.
+ > Connect an Angular app to Copilot Runtime with CopilotKit.
  
- <FrameworkOverview
-   frameworkName="Microsoft Agent Framework"
-   frameworkIcon={<MicrosoftIcon className="h-10 w-10 text-primary" width={40} height={40} />}
-   header="Bring your Microsoft Agent Framework agents to your Angular users"
-   subheader="Give your Microsoft Agent Framework agents real user-interactivity using CopilotKit and AG-UI. Build rich, interactive, agent-powered Angular applications."
-   bannerVideo="https://cdn.copilotkit.ai/docs/copilotkit/videos/coagents/overview.mp4"
-   guideLink="/angular/ms-agent-python/quickstart"
-   initCommand="npx copilotkit@latest init"
-   featuresLink="https://feature-viewer.copilotkit.ai/microsoft-agent-framework-python/feature/agentic_chat"
-   supportedFeatures={[
-     {
-       title: "Generative UI",
-       description: "Render your agent's state, progress, outputs, and tool calls with custom Angular components in real-time.",
-       documentationLink: "/angular/ms-agent-python/guides/frontend-tools-generative-ui",
-       demoLink: "https://feature-viewer.copilotkit.ai",
-       videoUrl: "https://cdn.copilotkit.ai/docs/copilotkit/videos/coagents/haiku.mp4"
-     },
-     {
-       title: "Human in the Loop",
-       description: "Empower users to guide agents at key checkpoints. Combine AI and human judgment for controllable agent behavior.",
-       documentationLink: "/angular/ms-agent-python/guides/human-in-the-loop",
-       demoLink: "https://feature-viewer.copilotkit.ai",
-       videoUrl: "https://cdn.copilotkit.ai/docs/copilotkit/images/coagents/human-in-the-loop-example.mp4"
-     },
-     {
-       title: "Shared State",
-       description: "Keep your agent and your Angular app in sync with reactive signals in real-time.",
-       documentationLink: "/angular/ms-agent-python/guides/shared-state",
-       demoLink: "https://feature-viewer.copilotkit.ai",
-       videoUrl: "https://cdn.copilotkit.ai/docs/copilotkit/videos/coagents/shared-state.mp4"
-     }
-   ]}
-   architectureImage="https://cdn.copilotkit.ai/docs/copilotkit/images/microsoft-agent-framework/maf-ag-ui.png"
-   afterFeatures={
-     <OpsPlatformCTA
-       variant="card"
-       title="Bring your Agent Framework agents to production"
-       body="Add persistent threads and the inspector with the Enterprise Intelligence Platform."
-       ctaLabel="Create a free account"
-       surface="docs_microsoft_agent_framework_overview"
-     />
-   }
-   tutorialLink="/angular/ms-agent-python/quickstart"
+ 
+ `@copilotkit/angular` provides Angular components, directives, and services for CopilotKit. This guide gets you to a working Angular app with a chat UI backed by [Copilot Runtime](/angular/ms-agent-python/backend/copilot-runtime). When you select an agent backend in the sidebar, the backend step below changes with it; without a selection, the guide uses CopilotKit's `BuiltInAgent`.
+ 
+ The runtime runs on your server, keeps model credentials out of the browser, and exposes the `default` agent that `CopilotChat` uses automatically.
+ 
+ <OpsPlatformCTA
+   variant="inline"
+   title="Take your Angular copilot from local to production"
+   body="Add durable threads, inspection, and managed or self-hosted CopilotKit Intelligence without changing the Angular frontend APIs in this guide."
+   surface="docs:angular/quickstart:production"
  />
  
- ## Resources
+ ## What is CopilotKit for Angular?
  
- - [Agent Framework User Guide](https://learn.microsoft.com/en-us/agent-framework/user-guide/overview)
- - [Agent Framework Tutorials](https://learn.microsoft.com/en-us/agent-framework/tutorials/overview)
+ CopilotKit for Angular is the first-party, signal-based Angular frontend for
+ AG-UI agents and Copilot Runtime. It provides complete chat surfaces and
+ headless APIs, and it supports zoneless applications.
+ 
+ ## Prerequisites
+ 
+ - An OpenAI API key (or another model provider supported by [Model Selection](/angular/model-selection))
+ - Angular 22
+ - Node.js 22
+ 
+ ## Getting started
+ 
+ <Steps>
+     <Step>
+         ### Create your Angular app
+ 
+         If you don't have one already, pin the CLI to the supported major:
+ 
+         ```bash
+         npx @angular/cli@22 new my-copilot-app
+         cd my-copilot-app
+         ```
+     </Step>
+     <Step>
+         ### Install CopilotKit
+ 
+         Install the Angular frontend package, `@angular/cdk`, and `@copilotkit/runtime` for your local Copilot Runtime server:
+ 
+         <Tabs groupId="package-manager" items={['npm', 'pnpm', 'yarn']}>
+             <Tab value="npm">
+                 ```bash
+                 npm install @copilotkit/angular @angular/cdk @copilotkit/runtime
+                 npm install -D tsx typescript @types/node
+                 ```
+             </Tab>
+             <Tab value="pnpm">
+                 ```bash
+                 pnpm add @copilotkit/angular @angular/cdk @copilotkit/runtime
+                 pnpm add -D tsx typescript @types/node
+                 ```
+             </Tab>
+             <Tab value="yarn">
+                 ```bash
+                 yarn add @copilotkit/angular @angular/cdk @copilotkit/runtime
+                 yarn add -D tsx typescript @types/node
+                 ```
+             </Tab>
+         </Tabs>
+ 
+         <Callout type="info" title="Match @angular/cdk to your Angular version">
+           `@angular/cdk` must share your Angular major version. Most package managers resolve this for you, but if you hit a peer-dependency error, pin it explicitly (for example `@angular/cdk@^22`).
+         </Callout>
+     </Step>
+     
+     
+       <Step>
+         ### Connect the selected agent backend
+ 
+         This URL keeps the agent backend selected. The Angular setup remains
+         shared; the backend setup below comes from that integration's canonical
+         showcase source.
+ 
+         <!-- setup skipped: agent-setup is not bundled for ms-agent-python -->
+ 
+         <Callout type="info" title="Expose the selected backend through Copilot Runtime">
+           Configure Copilot Runtime to register this backend as the `default`
+           agent at `/api/copilotkit`. Continue with the selected backend's
+           [Copilot Runtime guide](backend/copilot-runtime) for its runtime
+           adapter, credentials, and server command. Do not replace it with the
+           `BuiltInAgent` server from the standalone Angular path.
+         </Callout>
+       </Step>
+     
+     <Step>
+         ### Import the styles
+ 
+         Add the package stylesheet to your global styles. It's self-contained, so the chat renders without any other CSS.
+ 
+         ```css title="src/styles.css"
+         @import "@copilotkit/angular/styles.css"; /* [!code highlight] */
+         ```
+     </Step>
+     <Step>
+         ### Connect to Copilot Runtime
+ 
+         Point `provideCopilotKit` at the runtime endpoint. The chat uses the agent that your runtime registers as `default`.
+ 
+         ```ts title="src/app/app.config.ts"
+         import { ApplicationConfig } from "@angular/core";
+         import { provideCopilotKit } from "@copilotkit/angular"; // [!code highlight]
+ 
+         export const appConfig: ApplicationConfig = {
+           providers: [
+             // [!code highlight:3]
+             provideCopilotKit({
+               runtimeUrl: "http://localhost:8200/api/copilotkit",
+             }),
+           ],
+         };
+         ```
+     </Step>
+     <Step>
+         ### Add the chat UI
+ 
+         Import the `CopilotChat` component into your root component and drop it into the template.
+ 
+         ```ts title="src/app/app.ts"
+         import { Component } from "@angular/core";
+         import { CopilotChat } from "@copilotkit/angular"; // [!code highlight]
+ 
+         @Component({
+           selector: "app-root",
+           imports: [CopilotChat], // [!code highlight]
+           template: `
+             <!-- [!code highlight:3] -->
+             <div style="height: 100vh">
+               <copilot-chat />
+             </div>
+           `,
+         })
+         export class App {}
+         ```
+ 
+     </Step>
+     
+     
+       <Step>
+         ### Run the backend, runtime, and Angular app
+ 
+         Start the selected agent backend and Copilot Runtime with the commands
+         from its runtime guide. Confirm
+         `http://localhost:8200/api/copilotkit/info` reports the `default`
+         agent, then start Angular:
+ 
+         ```bash
+         npm start
+         ```
+ 
+         Open the Angular CLI URL (usually `http://localhost:4200`) and send a
+         message. The request now follows the selected path end to end:
+         Angular → Copilot Runtime → your selected agent backend.
+       </Step>
+     
+     <Step>
+         ### Open Inspector and confirm setup
+ 
+ Angular does not mount Inspector by default. First follow [Inspector for Angular](/angular/ms-agent-python/inspector). Then, on localhost, click the Inspector button.
+ 
+ 1. Open **Agents**, then **Agent**. Your agent is listed.
+ 2. Send a chat message. Open **Agents**, then **AG-UI Events**. Events are moving.
+ 3. Open **Threads**. The list is unlocked (Intelligence is on), or locked with Enable Intelligence (Intelligence is off).
+ 
+ More detail: [Inspector](/angular/ms-agent-python/inspector).
+ 
+     </Step>
+ 
+ </Steps>
+ 
+ ## Next steps
+ 
+ - [Runtime and backend docs](backend/copilot-runtime): configure the server, secure requests, and deploy without leaving the selected Angular surface.
+ - [CopilotKit Intelligence](premium/overview): add durable threads, inspection, and cloud-hosted or self-hosted operations.
+ - [Angular task guides](guides/chat-ui): build chat UI, tools, generative UI, interrupts, shared state, threads, memory, attachments, and headless UI.
+ - [Angular feature examples](features): find runnable examples and canonical shared Angular source for each supported feature.
+ - [Angular API reference](/reference/angular): use components, signals, tools, context, and runtime services.
+ - [Production and lifecycle](/reference/angular/production-lifecycle): handle cleanup, errors, server rendering, hydration, zoneless Angular, and browser-only features.
  
```

**Medium — Angular**

`/angular/ms-agent-python/quickstart` · route `/quickstart` · under “Angular”

0 code lines, 21 prose lines changed.

```diff
  
  > Connect an Angular app to Copilot Runtime with CopilotKit.
+ 
  
    variant="inline"
    title="Take your Angular copilot from local to production"
-   body="Add durable threads, inspection, and managed or self-hosted Enterprise Intelligence without changing the Angular frontend APIs in this guide."
+   body="Add durable threads, inspection, and managed or self-hosted CopilotKit Intelligence without changing the Angular frontend APIs in this guide."
    surface="docs:angular/quickstart:production"
  
  - An OpenAI API key (or another model provider supported by [Model Selection](/angular/model-selection))
- - Angular 20, 21, or 22
+ - Angular 22
  - Node.js 22
```

**Low — A2UI schemas, styling, and recovery**

`/angular/ms-agent-python/guides/a2ui` · route `/a2ui` · under “Angular support boundaries”

0 code lines, 2 prose lines changed.

```diff
  ## Angular support boundaries
  
- - **Hashbrown is unsupported.** The stable Hashbrown Angular package does not support the complete Angular 20 through 22 policy.
+ - **Hashbrown is unsupported.** The stable Hashbrown Angular package does not support the Angular 22 policy.
    Do not add it to an Angular integration; use A2UI with a typed catalog instead.
```

**High — Human-in-the-loop and interrupts**

`/angular/ms-agent-python/guides/human-in-the-loop` · route `/human-in-the-loop` · under “Human-in-the-loop and interrupts”

24 code lines, 31 prose lines changed.

```diff
  | --- | --- | --- |
  | Human-in-the-loop tool | The agent calls a registered browser tool | `registerHumanInTheLoop` |
- | Interrupt | The backend agent emits an AG-UI interrupt | `injectInterrupt` |
+ | Interrupt | The backend agent emits an AG-UI interrupt | `AgentStore.interruptController`, `injectInterrupt` |
  
  when the owning injector is destroyed.
  
- ## Handle an interrupt
+ ## Handle an interrupt from the store
+ 
+ An interrupt is a state of one conversation: this agent, this thread, this run
+ is waiting for a decision. The store that already exposes that conversation's
+ messages and state exposes its pending interrupt too, so a component that holds
+ a store needs nothing else:
+ 
+ ```ts title="src/app/ticket-approval.component.ts"
+ import { Component } from "@angular/core";
+ import { injectAgentStore } from "@copilotkit/angular";
+ 
+ @Component({
+   selector: "app-ticket-approval",
+   template: `
+     @let interrupts = store().interruptController;
+ 
+     @if (interrupts.hasInterrupt()) {
+       <section>
+         <p>{{ interrupts.interrupt()?.message }}</p>
+         <button type="button" (click)="interrupts.resolve({ approved: true })">
+           Approve
+         </button>
+         <button type="button" (click)="interrupts.cancel()">Reject</button>
+       </section>
+     }
+   `,
+ })
+ export class TicketApprovalComponent {
+   protected readonly store = injectAgentStore("ticketing");
+ }
+ ```
+ 
+ The controller is created and connected with the store, then destroyed when the
+ store is torn down or replaced. Standard AG-UI interrupts already retained by
+ the agent are visible immediately, and legacy `on_interrupt` events are observed
+ for the store's full lifetime.
+ 
+ ## Handle an interrupt with a typed controller
  
  `injectInterrupt` subscribes to one agent and exposes the pending decision as
  signals. It supports standard AG-UI interrupts and the legacy
- `on_interrupt` custom event.
+ `on_interrupt` custom event. Use it when the store default is not enough — a
+ typed payload, an `enabled` filter, or a `handler` that prepares data for the
+ view.
+ 
+ <Callout type="warn">
+   Do not render an `injectInterrupt` controller and
+   `store().interruptController` for the same decision. Both independently
+   observe the agent, so the same interrupt becomes visible in both and two UI
+   actions could attempt to resume it. Render only the specialized controller
+   when you need filtering or typed handling.
+ </Callout>
  
  export class InterruptPanelComponent {
    protected readonly controller =
-     injectInterrupt<ReviewRequest>({ agentId: "default" });
+     injectInterrupt<ReviewRequest>("default");
  
```

## 2026-08-24

### Initial baseline snapshot — 9 pages tracked for Angular + Microsoft Agent Framework (Python)

All official Angular + MS Agent Python documentation pages initialized from source:
- `/angular/ms-agent-python` · route `/`
- `/angular/ms-agent-python/quickstart` · route `/quickstart`
- `/angular/ms-agent-python/guides/chat-ui` · route `/chat-ui`
- `/angular/ms-agent-python/guides/frontend-tools-generative-ui` · route `/frontend-tools-generative-ui`
- `/angular/ms-agent-python/guides/a2ui` · route `/a2ui`
- `/angular/ms-agent-python/guides/voice-multimodal` · route `/voice-multimodal`
- `/angular/ms-agent-python/guides/human-in-the-loop` · route `/human-in-the-loop`
- `/angular/ms-agent-python/guides/shared-state` · route `/shared-state`
- `/angular/ms-agent-python/guides/threads-memory-attachments-headless` · routes `/threads`, `/memory`, `/attachments`, `/headless`

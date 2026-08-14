// quickstart : add the chat ui
import { Component } from '@angular/core';
import { CopilotChat } from '@copilotkit/angular';

@Component({
  selector: 'app-quickstart-chat',
  imports: [CopilotChat],
  template: `
    <div style="height: 100vh">
      <copilot-chat />
    </div>
  `,
})
export class QuickstartChat {}

export interface HealthCheckResult {
  frontendOk: boolean;
  runtimeOk: boolean;
  backendOk: boolean;
  frontendError?: string;
  runtimeError?: string;
  backendError?: string;
}

/** Pre-flight check to verify if Angular (port 4200), Copilot Runtime (port 8201), and Microsoft Agent Framework (port 8200) are running */
export async function checkServicesHealth(): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    frontendOk: false,
    runtimeOk: false,
    backendOk: false,
  };

  // 1. Check Angular Frontend (port 4200)
  try {
    const res = await fetch('http://localhost:4200/', {
      signal: AbortSignal.timeout(3000),
    });
    result.frontendOk = res.ok || res.status < 500;
  } catch (err: any) {
    result.frontendError = err.message || 'Connection refused on port 4200';
  }

  // 2. Check Copilot Runtime (port 8201)
  try {
    const res = await fetch('http://localhost:8201/api/copilotkit/info', {
      signal: AbortSignal.timeout(3000),
    });
    result.runtimeOk = res.ok || res.status < 500;
  } catch (err: any) {
    // Fallback check to /api/copilotkit
    try {
      const resFallback = await fetch('http://localhost:8201/api/copilotkit', {
        signal: AbortSignal.timeout(2000),
      });
      result.runtimeOk = resFallback.status < 500;
    } catch {
      result.runtimeError = err.message || 'Connection refused on port 8201';
    }
  }

  // 3. Check Microsoft Agent Framework Backend (port 8200)
  try {
    const res = await fetch('http://localhost:8200/openapi.json', {
      signal: AbortSignal.timeout(3000),
    });
    result.backendOk = res.ok || res.status < 500;
  } catch (err: any) {
    // Fallback check to root
    try {
      const resRoot = await fetch('http://localhost:8200/', {
        signal: AbortSignal.timeout(2000),
      });
      result.backendOk = resRoot.status < 500;
    } catch {
      result.backendError = err.message || 'Connection refused on port 8200';
    }
  }

  return result;
}

/** Automatically analyzes error messages and produces actionable diagnostic guidance */
export function diagnoseError(error: unknown, context?: string): string {
  const errStr =
    error instanceof Error ? error.message : String(error ?? 'Unknown error');

  if (errStr.includes('ECONNREFUSED') || errStr.includes('Failed to fetch')) {
    if (errStr.includes('8200') || context?.includes('backend')) {
      return (
        '🔴 [Microsoft Agent Framework Backend Offline]: The Python backend on port 8200 is not reachable.\n' +
        '   👉 Fix: In a terminal, run: `cd backend && uv run main.py`'
      );
    }
    if (errStr.includes('8201') || context?.includes('runtime')) {
      return (
        '🔴 [Copilot Runtime Offline]: The Node.js Copilot Runtime on port 8201 is not reachable.\n' +
        '   👉 Fix: In a terminal, run: `cd frontend && npm run runtime`'
      );
    }
    if (errStr.includes('4200') || context?.includes('frontend')) {
      return (
        '🔴 [Angular Frontend Offline]: The Angular dev server on port 4200 is not reachable.\n' +
        '   👉 Fix: In a terminal, run: `cd frontend && npm start` (or `npm run dev` to start runtime + frontend concurrently)'
      );
    }
  }

  if (errStr.includes('Timeout') && errStr.includes('waitFor')) {
    return (
      '⚠️ [UI Selector Timeout]: Playwright timed out waiting for an expected element on screen.\n' +
      '   👉 Fix: Verify that the route loaded correctly and the button/input exists in the Angular component DOM.'
    );
  }

  if (
    errStr.includes('provideCopilotKit') ||
    errStr.includes('CopilotKit') ||
    errStr.includes('injectAgentStore')
  ) {
    return (
      '⚠️ [CopilotKit Angular Provider Issue]: Ensure provideCopilotKit is configured in `frontend/src/app/app.config.ts`.\n' +
      '   👉 Fix: Check that runtimeUrl points to http://localhost:8201/api/copilotkit.'
    );
  }

  if (errStr.includes('404') || errStr.includes('Not Found')) {
    return (
      `⚠️ [Route Not Found (404)]: The requested URL could not be found.\n` +
      `   👉 Fix: Ensure the page route exists in \`frontend/src/app/app.routes.ts\`.`
    );
  }

  return `ℹ️ [Diagnostic Note]: ${errStr}`;
}

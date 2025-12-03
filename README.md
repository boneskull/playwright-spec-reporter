# playwright-spec-reporter

> A familiar and humble "spec" reporter for Playwright

A Playwright console test reporter which outputs test results in a hierarchical format similar to Mocha's or node:test's `spec` reporter.

## Install

```shell
npm install playwright-spec-reporter
```

## Usage

Configure the reporter in your `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['playwright-spec-reporter']],
});
```

Or use it alongside other reporters:

```typescript
export default defineConfig({
  reporter: [['playwright-spec-reporter'], ['html', { open: 'never' }]],
});
```

## Output

The reporter produces clean, colored output with:

- Hierarchical suite names with indentation
- Green checkmarks for passing tests
- Red numbered failures for failing tests
- Yellow dashes for skipped tests
- Duration for each test and total run
- Detailed failure information with stack traces

Example output:

```text
  Login Page
    ✓ should display login form (42ms)
    ✓ should validate email format (38ms)
    Authentication
      ✓ should login with valid credentials (156ms)
      1) should reject invalid password
      - should handle forgot password (skipped)

  2 passing, 1 failing, 1 skipped (512ms)

  1) Login Page Authentication should reject invalid password:
     Expected status to be 401
     at Context.<anonymous> (tests/login.spec.ts:45:5)
     at processTicksAndRejections (node:internal/process/task_queues:95:5)
```

## API

The package exports:

- **`default`** - The `SpecReporter` class
- **`colors`** - ANSI color codes used for output
- **`symbols`** - Unicode symbols (✓, ✗, -)

## Motivation

The default Playwright `list` reporter looks like this:

```text
  ✓   1 …-panel.test.ts:19:7 › BuildsPanel › shows empty state when no builds (260ms)
  ✓   2 …/shared/game-icon.test.ts:6:7 › GameIcon › renders with default name (243ms)
  ✓   3 …psible-section.test.ts:6:7 › CollapsibleSection › renders with title (277ms)
  ✓   4 …el.test.ts:27:7 › ActionLogPanel › shows empty state when no actions (217ms)
  ✓   5 …e-screen.test.ts:6:7 › WelcomeScreen › renders title and description (231ms)
  ✓   6 …tion.test.ts:14:7 › CollapsibleSection › starts collapsed by default (120ms)
  ✓   7 …lds-panel.test.ts:30:7 › BuildsPanel › renders build card with title (120ms)
  ✓   8 …ion-log-panel.test.ts:40:7 › ActionLogPanel › renders action entries (117ms)
  ✓   9 …/shared/game-icon.test.ts:14:7 › GameIcon › renders with custom name (124ms)
  ✓  10 …test.ts:15:7 › WelcomeScreen › renders primary and secondary buttons (117ms)
  ✓  11 …3:7 › CollapsibleSection › starts expanded when expanded prop is true (47ms)
  ✓  12 …r/builds-panel.test.ts:42:7 › BuildsPanel › shows progress percentage (47ms)
  ✓  13 …7 › WelcomeScreen › triggers fade-out animation on start button click (99ms)
  ✓  14 …on-log-panel.test.ts:57:7 › ActionLogPanel › displays session summary (56ms)
  ✓  15 …s/shared/game-icon.test.ts:24:7 › GameIcon › renders with custom size (55ms)
  ✓  16 …-section.test.ts:32:7 › CollapsibleSection › toggles on header click (100ms)
```

If you don't see the problem there, I don't know what to tell you. The default reporter may as well have been [`nyan`](https://mochajs.org/#nyan).

## License

Copyright © 2025 Christopher "boneskull" Hiller. Licensed BlueOak-1.0.0.

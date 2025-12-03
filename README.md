# playwright-spec-reporter

> A familiar and humble "spec" reporter for Playwright

A Playwright test reporter that outputs results in a clean, hierarchical format similar to Mocha's classic "spec" reporter. If you've used Mocha, you'll feel right at home.

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

## License

Copyright © 2025 Christopher "boneskull" Hiller. Licensed BlueOak-1.0.0.

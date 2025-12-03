/**
 * Custom Playwright reporter that mimics Mocha's "spec" reporter. Provides
 * clean, hierarchical console output with colored symbols.
 */
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

/**
 * ANSI color codes for terminal output
 */
export const colors = {
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  yellow: '\x1b[33m',
};

/**
 * Symbols for test status indicators
 */
export const symbols = {
  fail: '✗',
  pass: '✓',
  pending: '-',
};

/**
 * A Playwright test reporter that outputs results in a familiar "spec" format,
 * similar to Mocha's spec reporter.
 *
 * @example // playwright.config.ts import { defineConfig } from
 * '@playwright/test';
 *
 * Export default defineConfig({ reporter: [['playwright-spec-reporter']], });
 */
class SpecReporter implements Reporter {
  private failed = 0;

  private failures: Array<{ result: TestResult; test: TestCase }> = [];

  private passed = 0;

  private printedSuites = new Set<string>();

  private skipped = 0;

  onBegin(_config: FullConfig, _suite: Suite): void {
    console.log();
  }

  onEnd(result: FullResult): void {
    console.log();

    // Summary line
    const parts: string[] = [];
    if (this.passed > 0) {
      parts.push(`${colors.green}${this.passed} passing${colors.reset}`);
    }
    if (this.failed > 0) {
      parts.push(`${colors.red}${this.failed} failing${colors.reset}`);
    }
    if (this.skipped > 0) {
      parts.push(`${colors.yellow}${this.skipped} skipped${colors.reset}`);
    }

    console.log(
      `  ${parts.join(', ')} ${colors.dim}(${result.duration}ms)${colors.reset}`,
    );

    // Print failures
    if (this.failures.length > 0) {
      console.log();
      this.failures.forEach(({ result: testResult, test }, index) => {
        console.log(
          `  ${colors.red}${index + 1}) ${test.titlePath().join(' ')}:${colors.reset}`,
        );
        for (const error of testResult.errors) {
          console.log(`     ${colors.red}${error.message}${colors.reset}`);
          if (error.stack) {
            const stackLines = error.stack.split('\n').slice(1, 4);
            stackLines.forEach((line) => {
              console.log(`     ${colors.dim}${line.trim()}${colors.reset}`);
            });
          }
        }
        console.log();
      });
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    // Print suite hierarchy if not already printed
    this.printSuiteHierarchy(test);

    const indent = '  '.repeat(test.titlePath().length - 1);
    const duration = result.duration;
    const durationStr = `${colors.dim}(${duration}ms)${colors.reset}`;

    if (result.status === 'passed') {
      this.passed++;
      console.log(
        `${indent}${colors.green}${symbols.pass}${colors.reset} ${test.title} ${durationStr}`,
      );
    } else if (result.status === 'failed') {
      this.failed++;
      this.failures.push({ result, test });
      console.log(
        `${indent}${colors.red}${this.failed}) ${test.title}${colors.reset}`,
      );
    } else if (result.status === 'skipped') {
      this.skipped++;
      console.log(
        `${indent}${colors.yellow}${symbols.pending} ${test.title}${colors.reset}`,
      );
    }
  }

  printsToStdio(): boolean {
    return true;
  }

  private printSuiteHierarchy(test: TestCase): void {
    const titlePath = test.titlePath().slice(0, -1); // Exclude test title

    for (let i = 0; i < titlePath.length; i++) {
      const suitePath = titlePath.slice(0, i + 1).join(' > ');
      if (!this.printedSuites.has(suitePath)) {
        this.printedSuites.add(suitePath);
        const indent = '  '.repeat(i);
        console.log(`${indent}${titlePath[i]}`);
      }
    }
  }
}

export default SpecReporter;

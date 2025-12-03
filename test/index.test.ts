import type {
  FullConfig,
  FullResult,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

import { expect } from 'bupkis';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';

import SpecReporter, { colors, symbols } from '../src/index.js';

/**
 * Creates a mock FullResult object
 */
const createMockFullResult = (duration = 1000): FullResult => {
  return {
    duration,
    status: 'passed',
  } as FullResult;
};

/**
 * Creates a mock TestCase object
 */
const createMockTestCase = (
  title: string,
  titlePath: string[] = ['Suite', title],
): TestCase => {
  return {
    title,
    titlePath: () => titlePath,
  } as TestCase;
};

/**
 * Creates a mock TestResult object
 */
const createMockTestResult = (
  status: 'failed' | 'interrupted' | 'passed' | 'skipped' | 'timedOut',
  duration = 100,
  errors: Array<{ message?: string; stack?: string }> = [],
): TestResult => {
  return {
    duration,
    errors,
    status,
  } as TestResult;
};

describe('SpecReporter', () => {
  let reporter: SpecReporter;
  let logs: string[];
  let originalConsoleLog: typeof console.log;

  beforeEach(() => {
    reporter = new SpecReporter();
    logs = [];
    originalConsoleLog = console.log;
    console.log = mock.fn((...args: unknown[]) => {
      logs.push(args.map(String).join(' '));
    });
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  describe('exported constants', () => {
    it('should export colors with ANSI codes', () => {
      expect(colors, 'to satisfy', {
        bold: expect.it('to be a string'),
        dim: expect.it('to be a string'),
        green: expect.it('to be a string'),
        red: expect.it('to be a string'),
        reset: expect.it('to be a string'),
        yellow: expect.it('to be a string'),
      });
    });

    it('should export symbols', () => {
      expect(symbols, 'to satisfy', {
        fail: expect.it('to equal', '\u2717'),
        pass: expect.it('to equal', '\u2713'),
        pending: expect.it('to equal', '-'),
      });
    });
  });

  describe('printsToStdio()', () => {
    it('should return true', () => {
      expect(reporter.printsToStdio(), 'to be true');
    });
  });

  describe('onBegin()', () => {
    it('should log an empty line', () => {
      reporter.onBegin({} as FullConfig, {} as Suite);
      expect(logs, 'to have length', 1);
      expect(logs[0], 'to equal', '');
    });
  });

  describe('onTestEnd()', () => {
    describe('when test passes', () => {
      it('should log a green checkmark with test title and duration', () => {
        const test = createMockTestCase('should work');
        const result = createMockTestResult('passed', 42);

        reporter.onTestEnd(test, result);

        expect(
          logs.some((log) => log.includes(symbols.pass)),
          'to be true',
        );
        expect(
          logs.some((log) => log.includes('should work')),
          'to be true',
        );
        expect(
          logs.some((log) => log.includes('42ms')),
          'to be true',
        );
      });
    });

    describe('when test fails', () => {
      it('should log a numbered failure with test title', () => {
        const test = createMockTestCase('should fail');
        const result = createMockTestResult('failed');

        reporter.onTestEnd(test, result);

        expect(
          logs.some((log) => log.includes('1)')),
          'to be true',
        );
        expect(
          logs.some((log) => log.includes('should fail')),
          'to be true',
        );
      });

      it('should increment failure counter for each failed test', () => {
        const test1 = createMockTestCase('first failure');
        const test2 = createMockTestCase('second failure');
        const result = createMockTestResult('failed');

        reporter.onTestEnd(test1, result);
        reporter.onTestEnd(test2, result);

        expect(
          logs.some((log) => log.includes('1)')),
          'to be true',
        );
        expect(
          logs.some((log) => log.includes('2)')),
          'to be true',
        );
      });
    });

    describe('when test is skipped', () => {
      it('should log a yellow dash with test title', () => {
        const test = createMockTestCase('should be skipped');
        const result = createMockTestResult('skipped');

        reporter.onTestEnd(test, result);

        expect(
          logs.some((log) => log.includes(symbols.pending)),
          'to be true',
        );
        expect(
          logs.some((log) => log.includes('should be skipped')),
          'to be true',
        );
      });
    });
  });

  describe('suite hierarchy printing', () => {
    it('should print suite names before test results', () => {
      const test = createMockTestCase('my test', [
        'Top Suite',
        'Nested Suite',
        'my test',
      ]);
      const result = createMockTestResult('passed');

      reporter.onTestEnd(test, result);

      // Suite names should appear before test result
      const topSuiteIndex = logs.findIndex((log) => log.includes('Top Suite'));
      const nestedSuiteIndex = logs.findIndex((log) =>
        log.includes('Nested Suite'),
      );
      const testIndex = logs.findIndex((log) => log.includes('my test'));

      expect(topSuiteIndex, 'to be less than', nestedSuiteIndex);
      expect(nestedSuiteIndex, 'to be less than', testIndex);
    });

    it('should only print each suite once', () => {
      const test1 = createMockTestCase('test 1', ['Suite', 'test 1']);
      const test2 = createMockTestCase('test 2', ['Suite', 'test 2']);
      const result = createMockTestResult('passed');

      reporter.onTestEnd(test1, result);
      reporter.onTestEnd(test2, result);

      const suiteOccurrences = logs.filter(
        (log) => log.trim() === 'Suite',
      ).length;
      expect(suiteOccurrences, 'to equal', 1);
    });
  });

  describe('onEnd()', () => {
    it('should print summary with passing count when tests pass', () => {
      const test = createMockTestCase('passing test');
      const result = createMockTestResult('passed');

      reporter.onTestEnd(test, result);
      logs = []; // Clear logs to only check onEnd output
      reporter.onEnd(createMockFullResult(500));

      expect(
        logs.some((log) => log.includes('1 passing')),
        'to be true',
      );
      expect(
        logs.some((log) => log.includes('500ms')),
        'to be true',
      );
    });

    it('should print summary with failing count when tests fail', () => {
      const test = createMockTestCase('failing test');
      const result = createMockTestResult('failed');

      reporter.onTestEnd(test, result);
      logs = [];
      reporter.onEnd(createMockFullResult());

      expect(
        logs.some((log) => log.includes('1 failing')),
        'to be true',
      );
    });

    it('should print summary with skipped count when tests are skipped', () => {
      const test = createMockTestCase('skipped test');
      const result = createMockTestResult('skipped');

      reporter.onTestEnd(test, result);
      logs = [];
      reporter.onEnd(createMockFullResult());

      expect(
        logs.some((log) => log.includes('1 skipped')),
        'to be true',
      );
    });

    it('should print combined summary with multiple statuses', () => {
      const passingTest = createMockTestCase('pass', ['Suite', 'pass']);
      const failingTest = createMockTestCase('fail', ['Suite', 'fail']);
      const skippedTest = createMockTestCase('skip', ['Suite', 'skip']);

      reporter.onTestEnd(passingTest, createMockTestResult('passed'));
      reporter.onTestEnd(failingTest, createMockTestResult('failed'));
      reporter.onTestEnd(skippedTest, createMockTestResult('skipped'));
      logs = [];
      reporter.onEnd(createMockFullResult());

      const summaryLog = logs.find(
        (log) =>
          log.includes('passing') ||
          log.includes('failing') ||
          log.includes('skipped'),
      );
      expect(summaryLog, 'to be defined');
      expect(summaryLog, 'to contain', '1 passing');
      expect(summaryLog, 'to contain', '1 failing');
      expect(summaryLog, 'to contain', '1 skipped');
    });

    describe('failure details', () => {
      it('should print failure details with error message', () => {
        const test = createMockTestCase('failing test', [
          'Suite',
          'failing test',
        ]);
        const result = createMockTestResult('failed', 100, [
          { message: 'Expected true to be false' },
        ]);

        reporter.onTestEnd(test, result);
        logs = [];
        reporter.onEnd(createMockFullResult());

        expect(
          logs.some((log) => log.includes('Suite failing test')),
          'to be true',
        );
        expect(
          logs.some((log) => log.includes('Expected true to be false')),
          'to be true',
        );
      });

      it('should print stack trace lines for failures', () => {
        const test = createMockTestCase('failing test', [
          'Suite',
          'failing test',
        ]);
        const result = createMockTestResult('failed', 100, [
          {
            message: 'Error',
            stack: `Error: Error
    at Context.<anonymous> (test.ts:10:5)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async Runner.runTest (runner.ts:100:3)
    at extra line that should be excluded`,
          },
        ]);

        reporter.onTestEnd(test, result);
        logs = [];
        reporter.onEnd(createMockFullResult());

        // Should include first 3 stack lines after the error message
        expect(
          logs.some((log) => log.includes('Context.<anonymous>')),
          'to be true',
        );
        expect(
          logs.some((log) => log.includes('processTicksAndRejections')),
          'to be true',
        );
        expect(
          logs.some((log) => log.includes('Runner.runTest')),
          'to be true',
        );
        // Should NOT include the 4th stack line
        expect(
          logs.some((log) => log.includes('extra line')),
          'to be false',
        );
      });
    });
  });
});

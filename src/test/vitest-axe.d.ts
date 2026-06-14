import 'vitest';

// vitest-axe adds a custom matcher at runtime (see src/test/setup.ts). Declare
// it so TypeScript recognises it in test files.
declare module 'vitest' {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): unknown;
  }
}

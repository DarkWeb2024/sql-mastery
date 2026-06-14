import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';

// Make the accessibility matcher (toHaveNoViolations) available everywhere.
expect.extend(axeMatchers);

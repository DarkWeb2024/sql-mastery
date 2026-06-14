import { describe, expect, it } from 'vitest';
import { compareResults } from './validate';
import type { ResultSet } from '../types';

const rs = (columns: string[], rows: unknown[][]): ResultSet => ({ columns, rows });

describe('compareResults', () => {
  it('treats matching unordered rows as correct regardless of order', () => {
    const expected = rs(['name'], [['Alice'], ['Bob']]);
    const actual = rs(['name'], [['Bob'], ['Alice']]);
    expect(compareResults(expected, actual).correct).toBe(true);
  });

  it('treats numeric strings and numbers as equal', () => {
    const expected = rs(['n'], [[5]]);
    const actual = rs(['n'], [['5']]);
    expect(compareResults(expected, actual).correct).toBe(true);
  });

  it('fails when the row count differs', () => {
    const expected = rs(['name'], [['Alice'], ['Bob']]);
    const actual = rs(['name'], [['Alice']]);
    const result = compareResults(expected, actual);
    expect(result.correct).toBe(false);
    expect(result.reason).toMatch(/row/i);
  });

  it('fails when the column count differs', () => {
    const expected = rs(['a', 'b'], [[1, 2]]);
    const actual = rs(['a'], [[1]]);
    expect(compareResults(expected, actual).correct).toBe(false);
  });

  it('enforces order when orderMatters is true', () => {
    const expected = rs(['n'], [[1], [2], [3]]);
    const wrongOrder = rs(['n'], [[2], [1], [3]]);
    expect(compareResults(expected, wrongOrder, true).correct).toBe(false);
    expect(compareResults(expected, wrongOrder, false).correct).toBe(true);
  });

  it('matches NULL values consistently', () => {
    const expected = rs(['manager'], [[null], ['Alice']]);
    const actual = rs(['manager'], [['Alice'], [null]]);
    expect(compareResults(expected, actual).correct).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { formatCode, parseObj } from './utils';

describe('parseObj', () => {
  it('should parse a string into an object', () => {
    const str = '{ a: 1, b: 2 }';
    const obj = parseObj(str);
    expect(obj).toEqual({ a: 1, b: 2 });
  });
});

describe('formatCode', async () => {
  it('formats code', async () => {
    const str = `{ first: 1, second: 2, third: 3, fourth: 'a' }`;
    const formatted = formatCode(str);
    expect(formatted).toEqual(
      `{\n  first: 1,\n  second: 2,\n  third: 3,\n  fourth: 'a',\n}`,
    );
  });
});

import prettier from 'prettier';
import { parse } from './parser';

export function parseObj(str: string): any {
  return parse(str);
}

export function formatCode(code: string): string {
  const result = prettier.format(code, {
    semi: false,
    singleQuote: true,
    printWidth: 40,
  });
  return result.slice(2, -2);
}

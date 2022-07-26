import babylon from 'prettier/parser-babel';
import prettier from 'prettier/standalone';
import { parse } from './parser';

export function parseObj(str: string): any {
  return parse(str);
}

export function formatCode(code: string): string {
  const result = prettier.format(code, {
    parser: 'babel',
    plugins: [babylon],
    semi: false,
    singleQuote: true,
    printWidth: 40,
  });
  return result;
}

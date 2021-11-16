import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import stringify from '../bin/stringify.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const primitives = {
  string: 'value',
  boolean: true,
  number: 5,
  float: 1.25,
};

const nested = {
  string: 'value',
  boolean: true,
  number: 5,
  float: 1.25,
  object: {
    5: 'number',
    1.25: 'float',
    null: 'null',
    true: 'boolean',
    value: 'string',
    nested: {
      boolean: true,
      float: 1.25,
      string: 'value',
      number: 5,
      null: 'null',
    },
  },
};

const cases = [
  [undefined, undefined, 0],
  [' ', undefined, 1],
  ['|-', 1, 2],
  ['|-', 2, 3],
  [' ', 3, 4],
  ['...', undefined, 5],
];

const expectedData = { nested: [], plain: [] };
const primitiveValues = Object.values(primitives).map((v) => [v]);

// eslint-disable-next-line
beforeAll(() => {
  const plainData = fs.readFileSync(getFixturePath('plain.txt'), 'utf-8');
  const nestedData = fs.readFileSync(getFixturePath('nested.txt'), 'utf-8');
  expectedData.plain = plainData.trim().split('\n\n\n');
  expectedData.nested = nestedData.trim().split('\n\n\n');
});

// eslint-disable-next-line
describe.each(primitiveValues)('stringify', (value) => {
  const expected = `${value}`;
  // eslint-disable-next-line
  test(`${expected}`, () => expect(stringify(value)).toEqual(expected));
});

// eslint-disable-next-line
describe.each(cases)('replacer "%s" repeated %s times', (replacer, spacesCount, caseIndex) => {
  // eslint-disable-next-line
  test('plain object', () => {
    const expected = expectedData.plain[caseIndex];
    const actual = stringify(primitives, replacer, spacesCount);

    // eslint-disable-next-line
    expect(actual).toEqual(expected);
  });

  // eslint-disable-next-line
  test('nested object', () => {
    const expected = expectedData.nested[caseIndex];
    const actual = stringify(nested, replacer, spacesCount);

    // eslint-disable-next-line
    expect(actual).toEqual(expected);
  });
});

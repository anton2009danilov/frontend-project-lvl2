import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import * as path from 'path';
import action from '../bin/action';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const resultPath = getFixturePath('result.txt');

const result = readFileSync(resultPath, 'utf-8', (err, data) => {
  if (err) throw err;
  return JSON.parse(data);
});

// eslint-disable-next-line
test('gendiff', () => {
  const fixture1 = getFixturePath('file1.json');
  const fixture2 = getFixturePath('file2.json');
  // eslint-disable-next-line
  expect(action(fixture1, fixture2)).toBe(result);
});

// eslint-disable-next-line
test('gendiff yaml test', () => {
  const fixture1 = getFixturePath('file1.yaml');
  const fixture2 = getFixturePath('file2.yaml');
  // eslint-disable-next-line
  expect(action(fixture1, fixture2)).toBe(result);
});

// eslint-disable-next-line
test('gendiff yaml and json test', () => {
  const fixture1 = getFixturePath('file1.json');
  const fixture2 = getFixturePath('file2.yaml');
  // eslint-disable-next-line
  expect(action(fixture1, fixture2)).toBe(result);
});

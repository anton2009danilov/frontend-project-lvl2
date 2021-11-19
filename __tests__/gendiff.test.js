import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import * as path from 'path';
import genDiff from '../lib/gendiff.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const stylishResultPath = getFixturePath('stylish_result.txt');
const plainResultPath = getFixturePath('plain_result.txt');
const jsonResultPath = getFixturePath('json_result.txt');

const stylishResult = readFileSync(stylishResultPath, 'utf-8', (err, data) => {
  if (err) throw err;
  return JSON.parse(data);
});

const plainResult = readFileSync(plainResultPath, 'utf-8', (err, data) => {
  if (err) throw err;
  return JSON.parse(data);
});

const jsonResult = readFileSync(jsonResultPath, 'utf-8', (err, data) => {
  if (err) throw err;
  return JSON.parse(data);
});

// eslint-disable-next-line
test('gendiff file1.json file2.json', () => {
  const fixture1 = getFixturePath('file1.json');
  const fixture2 = getFixturePath('file2.json');
  // eslint-disable-next-line
  expect(genDiff(fixture1, fixture2)).toBe(stylishResult);
});

// eslint-disable-next-line
test('gendiff file1.yaml file2.yaml', () => {
  const fixture1 = getFixturePath('file1.yaml');
  const fixture2 = getFixturePath('file2.yaml');
  // eslint-disable-next-line
  expect(genDiff(fixture1, fixture2)).toBe(stylishResult);
});

// eslint-disable-next-line
test('gendiff file1.json file2.yaml', () => {
  const fixture1 = getFixturePath('file1.json');
  const fixture2 = getFixturePath('file2.yaml');
  // eslint-disable-next-line
  expect(genDiff(fixture1, fixture2)).toBe(stylishResult);
});

// eslint-disable-next-line
test('gendiff -f plain file1.json file2.json', () => {
  const fixture1 = getFixturePath('file1.json');
  const fixture2 = getFixturePath('file2.json');
  // eslint-disable-next-line
  expect(genDiff(fixture1, fixture2, 'plain')).toBe(plainResult);
});

// eslint-disable-next-line
test('gendiff -f json file1.json file2.json', () => {
  const fixture1 = getFixturePath('file1.json');
  const fixture2 = getFixturePath('file2.json');
  // eslint-disable-next-line
  expect(genDiff(fixture1, fixture2, 'json')).toBe(jsonResult);
});

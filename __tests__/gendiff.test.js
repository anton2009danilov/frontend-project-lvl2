import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import * as path from 'path';
import { test } from '@jest/globals';
import genDiff from '../src/gendiff.js';

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

test.each([
  {
    fileName1: 'file1.json',
    fileName2: 'file2.json',
    formatter: null,
    expected: stylishResult,
  },
  {
    fileName1: 'file1.yaml',
    fileName2: 'file2.yaml',
    formatter: null,
    expected: stylishResult,
  },
  {
    fileName1: 'file1.json',
    fileName2: 'file2.yaml',
    formatter: null,
    expected: stylishResult,
  },
  {
    fileName1: 'file1.json',
    fileName2: 'file2.yaml',
    formatter: 'plain',
    expected: plainResult,
  },
  {
    fileName1: 'file1.json',
    fileName2: 'file2.yaml',
    formatter: 'json',
    expected: jsonResult,
  },
])('gendiff $file1 $file2', ({
  fileName1, fileName2, formatter, expected,
}) => {
  const fixture1 = getFixturePath(fileName1);
  const fixture2 = getFixturePath(fileName2);
  expect(genDiff(fixture1, fixture2, formatter)).toBe(expected);
});

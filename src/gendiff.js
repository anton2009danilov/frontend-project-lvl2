import {
  readFileSync,
} from 'fs';
import * as path from 'path';
import parse from './parsers.js';
import format from './formatters/index.js';
import buildDifferencesTree from './buildTree.js';

const createAbsoluteFilepath = (filepath) => (path.isAbsolute(filepath)
  ? filepath
  : path.resolve(process.cwd(), filepath)
);

const readFile = (absolutePath) => readFileSync(absolutePath, 'utf-8');

const gendiff = (filepath1, filepath2, formatter = 'stylish') => {
  const fileData1 = readFile(createAbsoluteFilepath(filepath1));
  const fileData2 = readFile(createAbsoluteFilepath(filepath2));

  const file1 = parse(fileData1, filepath1);
  const file2 = parse(fileData2, filepath2);

  return format(buildDifferencesTree(file1, file2), formatter);
};

export default gendiff;

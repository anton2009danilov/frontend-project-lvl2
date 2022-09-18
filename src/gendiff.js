import {
  readFileSync,
} from 'fs';
import * as path from 'path';
import parse from './parsers.js';
import format from './formatters/index.js';
import buildDifferencesTree from './buildTree.js';

// TODO: Тут можно на тернарный оператор заменить
const createAbsoluteFilepath = (filepath) => {
  if (path.isAbsolute(filepath)) {
    return filepath;
  }

  return path.resolve(process.cwd(), filepath);
};

const genDiff = (filepath1, filepath2, formatter = 'stylish') => {
  // TODO: Можно просто absolutePath1
  const absPathOfFile1 = createAbsoluteFilepath(filepath1);

  const absPathOfFile2 = createAbsoluteFilepath(filepath2);

  // TODO: Чтение тоже можно в отдельную функцию
  const fileData1 = readFileSync(absPathOfFile1, 'utf-8', (err, data) => {
    if (err) throw err;
    return JSON.parse(data);
  });

  const fileData2 = readFileSync(absPathOfFile2, 'utf-8', (err, data) => {
    if (err) throw err;
    return JSON.parse(data);
  });

  const file1 = parse(fileData1, filepath1);
  const file2 = parse(fileData2, filepath2);

  return format(buildDifferencesTree(file1, file2), formatter);
};

export default genDiff;

#!/usr/bin/env node
import { Command } from 'commander/esm.mjs';
import { readFileSync } from 'fs';
import _ from 'lodash';
import * as path from 'path';

// test: gendiff ./tests/file1.json ./tests/file2.json
const program = new Command();

const compareFiles = (file1, file2) => {
  const result = {};

  const keys1 = Object.keys(file1);
  const keys2 = Object.keys(file2);
  const allKeys = _.uniq(keys1.concat(keys2)).sort();
  const commonKeys = _.intersection(keys1, keys2);
  const uniqueKeys1 = _.difference(keys1, keys2);
  const uniqueKeys2 = _.difference(keys2, keys1);

  allKeys.map((key) => {
    if (commonKeys.includes(key)) {
      if (file1[key] === file2[key]) {
        result[`  ${key}`] = file1[key];
      } else {
        result[`- ${key}`] = file1[key];
        result[`+ ${key}`] = file2[key];
      }
    }

    if (uniqueKeys1.includes(key)) {
      result[`- ${key}`] = file1[key];
    }

    if (uniqueKeys2.includes(key)) {
      result[`+ ${key}`] = file2[key];
    }

    return undefined;
  });

  const resultString = JSON.stringify(result, null, 2).replaceAll('"', '').replaceAll(',', '');
  console.log(resultString);
};

program
  .version('0.0.1')
  .arguments('<filepath1> <filepath2>')
  .description('Compares two configuration files and shows a difference.')
  .helpOption('-h, --help', 'output usage information')
  .action((filepath1, filepath2) => {
    const absPathOfFile1 = path.resolve(process.cwd(), filepath1);
    const absPathOfFile2 = path.resolve(process.cwd(), filepath2);

    const fileOneString = readFileSync(absPathOfFile1, 'utf-8', (err, data) => {
      if (err) throw err;
      return JSON.parse(data);
    });

    const fileTwoString = readFileSync(absPathOfFile2, 'utf-8', (err, data) => {
      if (err) throw err;
      return JSON.parse(data);
    });

    const file1 = JSON.parse(fileOneString);
    const file2 = JSON.parse(fileTwoString);

    compareFiles(file1, file2);
  });

program.option('-f, --format [type]', 'output format');

program.parse(process.argv);

export default compareFiles;

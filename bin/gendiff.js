#!/usr/bin/env node
import { Command } from 'commander/esm.mjs';
import { readFileSync } from 'fs';
import _ from 'lodash';
import * as path from 'path';

const program = new Command();

const compareFiles = (file1, file2) => {
  // console.log(file1);
  // console.log(file2);
  const result = {};
  const keys1 = Object.keys(file1);
  const keys2 = Object.keys(file2);
  const commonKeys = _.intersection(keys1, keys2);
  const uniqueKeys1 = _.difference(keys1, keys2);
  const uniqueKeys2 = _.difference(keys2, keys1);

  // console.log(commonKeys);
  // console.log(uniqueKeys1);
  // console.log(uniqueKeys2);

  // console.log(keys1);
  // console.log(keys2);

  if (keys1.length > keys2.length) {
    /* eslint-disable-next-line */
    for (const key of keys1) {
      if (file1[key] === file2[key]) {
        result[`  ${key}`] = file1[key];
      } else if (file1[key] !== file2[key] && _.has(file2, key)) {
        result[`+ ${key}`] = file1[key];
        result[`- ${key}`] = file2[key];
      }
    }
  }
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

    // console.log(strFile1, strFile2);

    const file1 = JSON.parse(fileOneString);
    const file2 = JSON.parse(fileTwoString);

    compareFiles(file1, file2);
  });

program.option('-f, --format [type]', 'output format');

program.parse(process.argv);

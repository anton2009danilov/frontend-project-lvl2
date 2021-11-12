#!/usr/bin/env node
import { Command } from 'commander/esm.mjs';
import { readFileSync } from 'fs';
import * as path from 'path';

const program = new Command();

program
  .version('0.0.1')
  .arguments('<filepath1> <filepath2>')
  .description('Compares two configuration files and shows a difference.')
  .helpOption('-h, --help', 'output usage information')
  .action((filepath1, filepath2) => {
    const absPathOfFile1 = path.resolve(process.cwd(), filepath1);
    const absPathOfFile2 = path.resolve(process.cwd(), filepath2);

    const file1 = readFileSync(absPathOfFile1, 'utf-8', (err, data) => {
      if (err) throw err;
      return JSON.parse(data);
    });

    const file2 = readFileSync(absPathOfFile2, 'utf-8', (err, data) => {
      if (err) throw err;
      return JSON.parse(data);
    });

    console.log(file1, file2);
  });

program.option('-f, --format [type]', 'output format');

program.parse(process.argv);

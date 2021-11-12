#!/usr/bin/env node
import { Command } from 'commander/esm.mjs';
import { readFileSync } from 'fs';

const program = new Command();

program
  .version('0.0.1')
  .arguments('<filepath1> <filepath2>')
  .description('Compares two configuration files and shows a difference.')
  .helpOption('-h, --help', 'output usage information')
  .action((filepath1, filepath2) => {
    const file1 = readFileSync(filepath1, 'utf-8', (err, data) => {
      if (err) throw err;
      return JSON.parse(data);
    });

    const file2 = readFileSync(filepath2, 'utf-8', (err, data) => {
      if (err) throw err;
      return JSON.parse(data);
    });

    console.log(file1, file2);
  });

program.option('-f, --format [type]', 'output format');

program.parse(process.argv);

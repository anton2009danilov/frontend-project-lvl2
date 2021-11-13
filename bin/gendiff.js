#!/usr/bin/env node
import { Command } from 'commander/esm.mjs';
import action from './action.js';

const gendiff = () => {
  const program = new Command();
  program
    .version('0.0.1')
    .arguments('<filepath1> <filepath2>')
    .description('Compares two configuration files and shows a difference.')
    .helpOption('-h, --help', 'output usage information')
    .action(action);

  program.option('-f, --format [type]', 'output format');

  program.parse(process.argv);
};

gendiff();

export default gendiff;

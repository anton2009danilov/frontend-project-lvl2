#!/usr/bin/env node
import { Command, Option } from 'commander/esm.mjs';
import action from '../lib/gendiff.js';

const gendiff = () => {
  const program = new Command();
  const options = program.opts();
  const formatOption = new Option('-f, --format [type]', 'output format')
    .default('stylish')
    .choices(['stylish', 'plain', 'json']);

  program
    .version('0.0.1')
    .arguments('<filepath1> <filepath2>')
    .description('Compares two configuration files and shows a difference.')
    .helpOption('-h, --help', 'output usage information')
    .addOption(formatOption)
    .action((path1, path2) => console.log(action(path1, path2, options.format)));

  program.parse(process.argv);
};

gendiff();

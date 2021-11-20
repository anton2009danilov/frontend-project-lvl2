import _ from 'lodash';
import { readFileSync } from 'fs';
import * as path from 'path';
import parse from './parsers.js';
import format from '../formatters/index.js';

const isObject = (obj) => Object.prototype.toString.call(obj) === '[object Object]';

const buildTree = (data) => {
  const tree = {};
  if (data === null) {
    return data;
  }

  Object.entries(data).map(([itemName, itemValue]) => {
    const nodeFormat = isObject(itemValue) ? 'tree' : 'item';
    const value = isObject(itemValue) ? buildTree(itemValue) : itemValue;

    tree[itemName] = {
      value,
      nodeFormat,
    };

    return undefined;
  });

  return tree;
};

const compareAll = (data1, data2) => {
  const compareCommon = (key, node1, node2) => {
    let result = {};

    if (_.isEqual(node1, node2)) {
      if (node1.nodeFormat === 'tree') {
        result = _.cloneDeep(node1);
      } else {
        result = node1;
      }
      return result;
    }

    if (node1.nodeFormat === 'tree' && node2.nodeFormat === 'tree') {
      result = compareAll(node1.value, node2.value);
      result.nodeFormat = 'tree';
      return result;
    }

    result.nodeFormat = 'list';
    result.before = isObject(node1) ? _.cloneDeep(node1) : node1;
    result.after = isObject(node2) ? _.cloneDeep(node2) : node2;
    result.before.sign = '-';
    result.after.sign = '+';
    return result;
  };

  const compareUnique = (key, node, sign) => {
    let result;
    if (node.nodeFormat === 'tree') {
      result = _.cloneDeep(node);
    } else {
      result = node;
    }

    result.sign = sign;
    return result;
  };

  const result = {};
  const keys1 = Object.keys(data1);
  const keys2 = Object.keys(data2);
  const allKeys = _.uniq(keys1.concat(keys2)).sort();
  const commonKeys = _.intersection(keys1, keys2);
  const uniqueKeys1 = _.difference(keys1, keys2);
  const uniqueKeys2 = _.difference(keys2, keys1);

  allKeys.forEach((key) => {
    const itemOfTree1 = data1[key];
    const itemOfTree2 = data2[key];

    if (commonKeys.includes(key)) {
      result[key] = compareCommon(key, itemOfTree1, itemOfTree2);
    }

    if (uniqueKeys1.includes(key)) {
      result[key] = compareUnique(key, itemOfTree1, '-');
    }

    if (uniqueKeys2.includes(key)) {
      result[key] = compareUnique(key, itemOfTree2, '+');
    }
  });

  return result;
};

const action = (filepath1, filepath2, formatter = 'stylish') => {
  const absPathOfFile1 = path.isAbsolute(filepath1)
    ? filepath1
    : path.resolve(process.cwd(), filepath1);

  const absPathOfFile2 = path.isAbsolute(filepath2)
    ? filepath2
    : path.resolve(process.cwd(), filepath2);

  const fileOneString = readFileSync(absPathOfFile1, 'utf-8', (err, data) => {
    if (err) throw err;
    return JSON.parse(data);
  });

  const fileTwoString = readFileSync(absPathOfFile2, 'utf-8', (err, data) => {
    if (err) throw err;
    return JSON.parse(data);
  });

  const file1 = parse(fileOneString, filepath1);
  const file2 = parse(fileTwoString, filepath2);

  const tree1 = buildTree(file1);
  const tree2 = buildTree(file2);

  // console.log(JSON.stringify(compareAll(tree1, tree2), ' ', 2));
  return format(compareAll(tree1, tree2), formatter);
};

export default action;

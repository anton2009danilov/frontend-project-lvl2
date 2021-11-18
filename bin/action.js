import { readFileSync } from 'fs';
import _ from 'lodash';
import * as path from 'path';
import parse from './parsers.js';
import stringify from './stringify.js';

const format = (data) => {
  const result = {};
  const replacer = ' ';
  if (!data) {
    return null;
  }

  Object.entries(data).forEach(([key, item]) => {
    if (item.type === 'tree' && !item.sign) {
      result[`${replacer.repeat(2)}${key}`] = format(item);

      if (item.value) {
        if (item.value.type === 'tree') {
          result[`${replacer.repeat(2)}${key}`] = format(item);
        }

        if (item.value.type === 'item') {
          result[`${replacer.repeat(2)}${key}`] = format(item.value);
        } else {
          result[`${replacer.repeat(2)}${key}`] = format(item.value);
        }
      }
    }

    if (item.type === 'tree' && item.sign) {
      result[`${item.sign}${replacer}${key}`] = format(item.value);
    }

    if (item.type === 'list') {
      result[`-${replacer}${key}`] = item.before.type === 'tree' ? format(item.before.value) : item.before.value;
      result[`+${replacer}${key}`] = item.after.type === 'tree' ? format(item.after.value) : item.after.value;
    }

    if (item.type === 'item' && !item.sign) {
      result[`${replacer.repeat(2)}${key}`] = item.value;
    }

    if (item.type === 'item' && item.sign) {
      result[`${item.sign}${replacer}${key}`] = item.value;
    }
  });

  return result;
};

const buildTree = (data) => {
  const tree = {};
  if (data === null) {
    return data;
  }

  Object.entries(data).map(([itemName, itemValue]) => {
    const type = typeof itemValue === 'object' ? 'tree' : 'item';
    const value = typeof itemValue === 'object' ? buildTree(itemValue) : itemValue;

    tree[itemName] = {
      value,
      type,
    };

    return undefined;
  });

  return tree;
};

const compareAll = (data1, data2) => {
  const compareCommon = (key, node1, node2) => {
    let result = {};

    if (_.isEqual(node1, node2)) {
      if (node1.type === 'tree') {
        result = _.cloneDeep(node1);
      } else {
        result = node1;
      }
      return result;
    }

    if (node1.type === 'tree' && node2.type === 'tree') {
      result = compareAll(node1.value, node2.value);
      result.type = 'tree';
      return result;
    }

    result.type = 'list';
    result.before = typeof node1 === 'object' ? _.cloneDeep(node1) : node1;
    result.after = typeof node2 === 'object' ? _.cloneDeep(node2) : node2;
    result.before.sign = '-';
    result.after.sign = '+';
    return result;
  };

  const compareUnique = (key, node, sign) => {
    let result;
    if (node.type === 'tree') {
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

const action = (filepath1, filepath2) => {
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
  const result = compareAll(tree1, tree2);
  const formattedResult = format(result);

  return stringify(formattedResult, ' ', 2);
};

export default action;

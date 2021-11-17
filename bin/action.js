import { readFileSync } from 'fs';
import _ from 'lodash';
import * as path from 'path';
import parse from './parsers.js';
import stringify from './stringify.js';

const buildTree = (data) => {
  // console.log(Object.entries(data));
  const tree = {};

  Object.entries(data).map(([itemName, itemValue]) => {
    const type = typeof itemValue === 'object' ? 'tree' : 'item';
    const value = typeof itemValue === 'object' ? buildTree(itemValue) : itemValue;

    tree[itemName] = {
      value,
      type,
    };

    return undefined;
  });

  // console.log(data);
  // console.log(JSON.stringify(tree, null, 2));
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
      result.sign = '=';
      return result;
    }

    if (node1.type === 'tree' && node2.type === 'tree') {
      // console.log(node1);
      // console.log(node2);
      return compareAll(node1.value, node2.value);
    }

    result.type = 'list';
    result[`file1__${key}`] = typeof node1 === 'object' ? _.cloneDeep(node1) : node1;
    result[`file2__${key}`] = typeof node2 === 'object' ? _.cloneDeep(node2) : node2;
    result[`file1__${key}`].sign = '-';
    result[`file2__${key}`].sign = '+';
    return result;
  };

const compareUnique = (key, node, sign) => {

};

  const result = {};
  const keys1 = Object.keys(data1);
  const keys2 = Object.keys(data2);
  const allKeys = _.uniq(keys1.concat(keys2)).sort();
  console.log(allKeys);
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

  console.log(`####result:   ${JSON.stringify(result, null, 2)}`);
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
  compareAll(tree1, tree2);
  // return stringify(compareFiles(file1, file2), ' ', 2).replace(/"/g, '').replace(/,/g, '');
};

export default action;

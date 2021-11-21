import _ from 'lodash';
import { readFileSync } from 'fs';
import * as path from 'path';
import parse from './parsers.js';
import format from '../formatters/index.js';

const isObject = (obj) => Object.prototype.toString.call(obj) === '[object Object]';

const buildTree = (data) => {
  if (data === null) {
    return data;
  }

  const props = Object.entries(data);

  if (data === null) {
    return data;
  }

  const tree = props.reduce((root, [itemName, itemValue]) => {
    // const nodeFormat = isObject(itemValue) ? 'tree' : 'item';
    const value = isObject(itemValue) ? undefined : itemValue;
    const children = isObject(itemValue) ? buildTree(itemValue) : undefined;

    const newNode = {
      name: itemName,
      value,
      children,
      // nodeFormat,
    };

    const newRoot = [
      ...root,
      newNode,
    ];

    return newRoot;
  }, []);

  return tree;
};

const compareAll = (data1, data2) => {
  const compareCommon = (key, node1, node2) => {
    let result = {};

    if (_.isEqual(node1, node2)) {
      if (node1.children) {
        return _.cloneDeep(node1);
      }

      return node1;
    }

    console.log(node1);
    console.log(node2);
    if (node1 && node2) {
      if (node1.children && node2.children) {
        result = compareAll(node1.children, node2.children);
        return result;
      }
    }

    // result.nodeFormat = 'list';
    const before = isObject(node1) ? _.omit(_.cloneDeep(node1), ['name']) : node1;
    const after = isObject(node2) ? _.omit(_.cloneDeep(node2), ['name']) : node2;

    const updated = before && after ? 'updated' : null;
    const added = !before && after ? 'added' : null;
    const removed = !before && after ? 'removed' : null;
    // result.before.sign = '-';
    // result.after.sign = '+';

    return {
      before,
      after,
      type: updated || added || removed,
    };
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
  const namesList1 = Object.entries(data1).map((el) => el[1].name);
  const namesList2 = Object.entries(data2).map((el) => el[1].name);
  const allNamesList = _.sortBy(_.uniq(namesList1.concat(namesList2)));
  const uniqueNames1 = _.difference(namesList1, namesList2);
  const uniqueNames2 = _.difference(namesList2, namesList1);

  // const nodesColl2 = Object.entries(data2);
  // const keys1 = Object.keys(data1);
  // const keys2 = Object.keys(data2);
  // const allKeys = _.uniq(nodesNames.concat(keys2)).sort();
  // const commonKeys = _.intersection(keys1, keys2);
  // console.log(keys1);
  // console.log(namesList1);
  // console.log(namesList2);
  // console.log(allNamesList);
  // console.log(uniqueNames1);
  // console.log(uniqueNames2);
  // console.log(data1);

  allNamesList.forEach((currentName) => {
    const itemOfTree1 = _.filter(data1, { name: currentName })[0];
    const itemOfTree2 = _.filter(data2, { name: currentName })[0];
    // const itemOfTree2 = data2[key];
    // console.log(itemOfTree1);
    // console.log(itemOfTree2);

    if (allNamesList.includes(currentName)) {
      result[currentName] = compareCommon(currentName, itemOfTree1, itemOfTree2);
    }

    // if (uniqueKeys1.includes(key)) {
    //   result[key] = compareUnique(key, itemOfTree1, '-');
    // }

    // if (uniqueKeys2.includes(key)) {
    //   result[key] = compareUnique(key, itemOfTree2, '+');
    // }
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
  // console.log(JSON.stringify(tree1, null, 2));
  const tree2 = buildTree(file2);

  console.log(JSON.stringify(compareAll(tree1, tree2), ' ', 2));
  // return format(compareAll(tree1, tree2), formatter);
};

export default action;

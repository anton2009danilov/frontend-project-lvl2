import _ from 'lodash';
import {
  readFileSync,
} from 'fs';
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
    const value = isObject(itemValue) ? undefined : itemValue;
    const children = isObject(itemValue) ? buildTree(itemValue) : undefined;

    const newNode = {
      name: itemName,
      value,
      children,
    };

    const newRoot = [
      ...root,
      newNode,
    ];

    return newRoot;
  }, []);

  return tree;
};

const compare = (data1, data2) => {
  const namesList1 = Object.entries(data1).map((el) => el[1].name);
  const namesList2 = Object.entries(data2).map((el) => el[1].name);
  const allNamesList = _.sortBy(_.uniq(namesList1.concat(namesList2)));

  const tree = allNamesList.reduce((root, currentName) => {
    const itemOfTree1 = _.filter(data1, {
      name: currentName,
    })[0];

    const itemOfTree2 = _.filter(data2, {
      name: currentName,
    })[0];

    if (!itemOfTree1) {
      const resultNode = { ...itemOfTree2, type: 'added' };
      return [...root, resultNode];
    }

    if (!itemOfTree2) {
      const resultNode = { ...itemOfTree1, type: 'removed' };
      return [...root, resultNode];
    }

    if (_.isEqual(itemOfTree1, itemOfTree2)) {
      return [...root, itemOfTree1];
    }

    if (itemOfTree1.children && itemOfTree2.children) {
      const resultNode = {
        name: currentName,
        children: compare(itemOfTree1.children, itemOfTree2.children),
      };
      return [...root, resultNode];
    }

    if (itemOfTree1.children && itemOfTree2.value !== undefined) {
      const resultNode = {
        name: currentName,
        before: itemOfTree1.children,
        after: itemOfTree2.value,
        type: 'updated',
      };
      return [...root, resultNode];
    }

    if (itemOfTree1.value !== undefined && itemOfTree2.children) {
      const resultNode = {
        name: currentName,
        before: itemOfTree1.value,
        after: itemOfTree2.children,
        type: 'updated',
      };
      return [...root, resultNode];
    }

    const resultNode = {
      name: currentName,
      before: itemOfTree1.value,
      after: itemOfTree2.value,
      type: 'updated',
    };
    return [...root, resultNode];
  }, []);

  return tree;
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

  return format(compare(tree1, tree2), formatter);
};

export default action;

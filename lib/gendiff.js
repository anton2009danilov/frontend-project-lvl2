import _ from 'lodash';
import {
  readFileSync,
} from 'fs';
import * as path from 'path';
import parse from './parsers.js';
import format from '../formatters/index.js';

const isObject = (obj) => Object.prototype.toString.call(obj) === '[object Object]';

const createAbsoluteFilepath = (filepath) => {
  if (path.isAbsolute(filepath)) {
    return filepath;
  }

  return path.resolve(process.cwd(), filepath);
};

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

const defineChangeType = (node1, node2) => {
  if (!node1) {
    return 'added';
  }

  if (!node2) {
    return 'removed';
  }

  if (_.isEqual(node1, node2)) {
    return 'unchanged';
  }

  if (node1.children && node2.children) {
    return 'node updated with new node';
  }

  if (node1.children && node2.value !== undefined) {
    return 'node updated with new value';
  }

  if (node1.value !== undefined && node2.children) {
    return 'value updated with new node';
  }

  return 'value updated with new value';
};

const makeChange = (typeOfChange, node1, node2, currentName = null) => {
  if (typeOfChange === 'added') {
    return { ...node2, type: 'added' };
  }

  if (typeOfChange === 'removed') {
    return { ...node1, type: 'removed' };
  }

  if (typeOfChange === 'unchanged') {
    return node1;
  }

  if (typeOfChange === 'node updated with new value') {
    return {
      name: currentName,
      before: node1.children,
      after: node2.value,
      type: 'updated',
    };
  }

  if (typeOfChange === 'value updated with new node') {
    return {
      name: currentName,
      before: node1.value,
      after: node2.children,
      type: 'updated',
    };
  }

  if (typeOfChange === 'value updated with new value') {
    return {
      name: currentName,
      before: node1.value,
      after: node2.value,
      type: 'updated',
    };
  }

  return 1;
};

const compare = (data1, data2) => {
  const namesList1 = Object.entries(data1).map((el) => el[1].name);
  const namesList2 = Object.entries(data2).map((el) => el[1].name);
  const allNamesList = _.sortBy(_.uniq(namesList1.concat(namesList2)));

  const resultTree = allNamesList.reduce((root, currentName) => {
    const itemOfTree1 = _.filter(data1, {
      name: currentName,
    })[0];

    const itemOfTree2 = _.filter(data2, {
      name: currentName,
    })[0];

    const typeOfChange = defineChangeType(itemOfTree1, itemOfTree2);

    if (typeOfChange === 'node updated with new node') {
      const resultNode = {
        name: currentName,
        children: compare(itemOfTree1.children, itemOfTree2.children),
      };
      return [...root, resultNode];
    }

    const resultNode = makeChange(typeOfChange, itemOfTree1, itemOfTree2, currentName);
    return [...root, resultNode];
  }, []);

  return resultTree;
};

const action = (filepath1, filepath2, formatter = 'stylish') => {
  const absPathOfFile1 = createAbsoluteFilepath(filepath1);

  const absPathOfFile2 = createAbsoluteFilepath(filepath2);

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

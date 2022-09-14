import _ from 'lodash';

const buildTree = (data) => {
  if (data === null) {
    return data;
  }

  const props = Object.entries(data);

  const tree = props.reduce((root, [itemName, itemValue]) => {
    if (_.isObject(itemValue)) {
      return [...root, {
        name: itemName,
        children: buildTree(itemValue),
      }];
    }

    return [...root, {
      name: itemName,
      value: itemValue,
    }];
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
    return 'node updated to new node';
  }

  if (node1.children && node2.value !== undefined) {
    return 'node updated to new value';
  }

  if (node1.value !== undefined && node2.children) {
    return 'value updated to new node';
  }

  return 'value updated to new value';
};

const updateNode = (typeOfChange, nodes, currentName = null) => {
  const [node1, node2] = nodes;

  if (typeOfChange === 'node updated to new value') {
    return {
      name: currentName,
      before: node1.children,
      after: node2.value,
      type: 'updated',
    };
  }

  if (typeOfChange === 'value updated to new node') {
    return {
      name: currentName,
      before: node1.value,
      after: node2.children,
      type: 'updated',
    };
  }

  return {
    name: currentName,
    before: node1.value,
    after: node2.value,
    type: 'updated',
  };
};

const makeChange = (typeOfChange, nodes, currentName = null) => {
  const [node1, node2] = nodes;

  if (typeOfChange === 'added') {
    return { ...node2, type: 'added' };
  }

  if (typeOfChange === 'removed') {
    return { ...node1, type: 'removed' };
  }

  if (typeOfChange === 'unchanged') {
    return node1;
  }

  return updateNode(typeOfChange, nodes, currentName);
};

const buildDifferencesTree = (data1, data2) => {
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

    if (typeOfChange === 'node updated to new node') {
      const resultNode = {
        name: currentName,
        children: buildDifferencesTree(itemOfTree1.children, itemOfTree2.children),
      };
      return [...root, resultNode];
    }

    const resultNode = makeChange(typeOfChange, [itemOfTree1, itemOfTree2], currentName);
    return [...root, resultNode];
  }, []);

  return resultTree;
};

export default (file1, file2) => {
  const tree1 = buildTree(file1);
  const tree2 = buildTree(file2);

  return buildDifferencesTree(tree1, tree2);
};

import _ from 'lodash';

const isTree = (data) => {
  if (!data) {
    return false;
  }
  return data.children || false;
};

const buildTree = (data) => {
  if (_.isNull(data)) {
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

const updateNode = (node1, node2, currentName = null) => {
  if (isTree(node1)) {
    return {
      name: currentName,
      before: node1.children,
      after: node2.value,
      type: 'updated',
    };
  }

  if (isTree(node2)) {
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

const calcResultNode = (node1, node2, currentName = null) => {
  if (!node1) {
    return { ...node2, type: 'added' };
  }

  if (!node2) {
    return { ...node1, type: 'removed' };
  }

  if (_.isEqual(node1, node2)) {
    return node1;
  }

  return updateNode(node1, node2, currentName);
};

const buildDifferencesTree = (data1, data2) => {
  const namesList1 = Object.entries(data1).map((el) => el[1].name);
  const namesList2 = Object.entries(data2).map((el) => el[1].name);
  const allNamesList = _.sortBy(_.uniq(namesList1.concat(namesList2)));

  const resultTree = allNamesList.reduce((root, currentName) => {
    const itemOfTree1 = _.first(_.filter(data1, { name: currentName }));
    const itemOfTree2 = _.first(_.filter(data2, { name: currentName }));

    if (isTree(itemOfTree1) && isTree(itemOfTree2)) {
      return [...root, {
        name: currentName,
        children: buildDifferencesTree(itemOfTree1.children, itemOfTree2.children),
      }];
    }

    const resultNode = calcResultNode(itemOfTree1, itemOfTree2, currentName);

    return [...root, resultNode];
  }, []);

  return resultTree;
};

export default (file1, file2) => {
  const tree1 = buildTree(file1);
  const tree2 = buildTree(file2);

  return buildDifferencesTree(tree1, tree2);
};

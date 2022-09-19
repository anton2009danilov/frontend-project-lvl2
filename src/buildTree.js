import _ from 'lodash';

const formatItemChildren = (item) => {
  const children = Object.entries(item).map(([name, value]) => {
    if (_.isObject(value)) {
      return ({ name, children: formatItemChildren(value), type: 'unchanged' });
    }

    return ({ name, value, type: 'unchanged' });
  });

  return children;
};

const formatItem = (item, name) => {
  if (_.isObject(item)) {
    return { name, children: item, type: 'unchanged' };
  }

  return { name, value: item, type: 'unchanged' };
};

const updateNode = (item1, item2, currentName = null) => {
  if (_.isObject(item1)) {
    return {
      name: currentName,
      before: formatItemChildren(item1),
      after: item2,
      type: 'updated',
    };
  }

  if (_.isObject(item2)) {
    return {
      name: currentName,
      before: item1,
      after: formatItemChildren(item2),
      type: 'updated',
    };
  }

  return {
    name: currentName,
    before: item1,
    after: item2,
    type: 'updated',
  };
};

const calcResultNode = (item1, item2, currentName = null) => {
  if (item1 === undefined) {
    if (_.isObject(item2)) {
      const children = formatItemChildren(item2);
      return { name: currentName, children, type: 'added' };
    }

    return { name: currentName, value: item2, type: 'added' };
  }

  if (item2 === undefined) {
    if (_.isObject(item1)) {
      const children = formatItemChildren(item1);
      return { name: currentName, children, type: 'removed' };
    }

    return { name: currentName, value: item1, type: 'removed' };
  }

  if (_.isEqual(item1, item2)) {
    return { ...formatItem(item1, currentName), type: 'unchanged' };
  }

  return updateNode(item1, item2, currentName);
};

const buildDifferencesTree = (file1, file2) => {
  const sortedKeys = _.sortBy(_.uniq(Object.keys({ ...file1, ...file2 })));

  const resultTree = sortedKeys.reduce((root, currentName) => {
    const itemOfFile1 = file1[currentName];
    const itemOfFile2 = file2[currentName];

    if (_.isObject(itemOfFile1) && _.isObject(itemOfFile2)) {
      return [...root, {
        name: currentName,
        children: buildDifferencesTree(file1[currentName], file2[currentName]),
        type: 'unchanged',
      }];
    }

    const resultNode = calcResultNode(itemOfFile1, itemOfFile2, currentName);

    return [...root, resultNode];
  }, []);

  return resultTree;
};

export default buildDifferencesTree;

import _ from 'lodash';

const formatItemChildren = (item, type = 'unchanged') => Object.entries(item).map(([name, value]) => {
  if (_.isObject(value)) {
    return ({ name, children: formatItemChildren(value), type });
  }

  return ({ name, value, type });
});

const defineTreeChangeType = (item1, item2) => {
  if (_.isEqual(item1, item2)) {
    return 'unchanged';
  }

  return 'children updated';
};

const buildDifferencesTree = (file1, file2) => {
  const sortedKeys = _.sortBy(_.uniq(Object.keys({ ...file1, ...file2 })));

  const resultTree = sortedKeys.reduce((root, currentName) => {
    const item1 = file1[currentName];
    const item2 = file2[currentName];

    if (_.isEqual(item1, item2)) {
      return [...root, { name: currentName, value: item1, type: 'unchanged' }];
    }

    if (_.isObject(item1) && _.isObject(item2)) {
      return [...root, {
        name: currentName,
        children: buildDifferencesTree(item1, item2),
        type: defineTreeChangeType(item1, item2),
      }];
    }

    if (item1 === undefined) {
      return _.isObject(item2)
        ? [...root, { name: currentName, children: formatItemChildren(item2), type: 'added' }]
        : [...root, { name: currentName, value: item2, type: 'added' }];
    }

    if (item2 === undefined) {
      return _.isObject(item1)
        ? [...root, { name: currentName, children: formatItemChildren(item1), type: 'removed' }]
        : [...root, { name: currentName, value: item1, type: 'removed' }];
    }

    if (_.isObject(item1)) {
      return [...root, {
        name: currentName,
        before: formatItemChildren(item1),
        after: item2,
        type: 'updated',
      }];
    }

    if (_.isObject(item2)) {
      return [...root, {
        name: currentName,
        before: item1,
        after: formatItemChildren(item2),
        type: 'updated',
      }];
    }

    return [...root, {
      name: currentName,
      before: item1,
      after: item2,
      type: 'updated',
    }];
  }, []);

  return resultTree;
};

export default buildDifferencesTree;

import _ from 'lodash';

const formatItemChildren = (item, type = 'unchanged') => Object.entries(item).map(([name, value]) => {
  if (_.isObject(value)) {
    return ({ name, children: formatItemChildren(value), type });
  }

  return ({ name, value, type });
});

const formatMovedItem = (item, name, type) => (_.isObject(item)
  ? { name, children: formatItemChildren(item), type }
  : { name, value: item, type });

const buildDifferencesTree = (file1, file2) => {
  const sortedKeys = _.sortBy(_.uniq(Object.keys({ ...file1, ...file2 })));

  const resultTree = sortedKeys.reduce((root, key) => {
    const item1 = file1[key];
    const item2 = file2[key];

    if (_.isEqual(item1, item2)) {
      const type = 'unchanged';
      return [...root, { name: key, value: item1, type }];
    }

    if (_.isObject(item1) && _.isObject(item2)) {
      const type = 'children updated';
      return [...root, {
        name: key,
        children: buildDifferencesTree(item1, item2),
        type,
      }];
    }

    if (item1 === undefined && item2 !== undefined) {
      const type = 'added';
      return [...root, formatMovedItem(item2, key, type)];
    }

    if (item1 !== undefined && item2 === undefined) {
      const type = 'removed';
      return [...root, formatMovedItem(item1, key, type)];
    }

    const type = 'updated';
    return [...root, {
      name: key,
      before: _.isObject(item1) ? formatItemChildren(item1) : item1,
      after: _.isObject(item2) ? formatItemChildren(item2) : item2,
      type,
    }];
  }, []);

  return resultTree;
};

export default buildDifferencesTree;

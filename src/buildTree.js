import _ from 'lodash';

const buildDifferencesTree = (file1, file2) => {
  const sortedKeys = _.sortBy(_.uniq(Object.keys({ ...file1, ...file2 })));

  const resultTree = sortedKeys.reduce((root, key) => {
    const item1 = file1[key];
    const item2 = file2[key];

    if (_.isEqual(item1, item2)) {
      const type = 'unchanged';
      return [...root, { [key]: item1, type }];
    }

    if (_.isObject(item1) && _.isObject(item2)) {
      const type = 'nested';
      return [...root, {
        [key]: (buildDifferencesTree(item1, item2)),
        type,
      }];
    }

    if (item1 === undefined && item2 !== undefined) {
      const type = 'added';
      return [...root, { [key]: item2, type }];
    }

    if (item1 !== undefined && item2 === undefined) {
      const type = 'removed';
      return [...root, { [key]: item1, type }];
    }

    const type = 'updated';
    return [...root, {
      [key]: {
        before: item1,
        after: item2,
      },
      type,
    }];
  }, []);

  return resultTree;
};

export default buildDifferencesTree;

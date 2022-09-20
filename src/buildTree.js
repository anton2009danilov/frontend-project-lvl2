import _ from 'lodash';

const isTree = (data) => _.isObject(data);

const formatItemChildren = (item, type = 'unchanged') => Object.entries(item).map(([name, value]) => {
  if (isTree(value)) {
    return ({ name, children: formatItemChildren(value), type });
  }

  return ({ name, value, type });
});

// TODO: Так же сейчас условия для построения узлов дерева разбиты по разным функция,
// хорошо бы их объединить в одно место (в основную функцию скопом или отдельно выделить)
const updateNode = (item1, item2, buildType, currentName = undefined) => {
  switch (buildType) {
    case 'tree vs value':
      return {
        name: currentName,
        before: formatItemChildren(item1),
        after: item2,
        type: 'updated',
      };
    case 'value vs tree':
      return {
        name: currentName,
        before: item1,
        after: formatItemChildren(item2),
        type: 'updated',
      };
    case 'value vs value':
      return {
        name: currentName,
        before: item1,
        after: item2,
        type: 'updated',
      };
    default:
      throw new Error(`Unexpected value of buildType variable: ${buildType}`);
  }
};

const defineTreeChangeType = (item1, item2) => {
  if (_.isEqual(item1, item2)) {
    return 'unchanged';
  }

  return 'children updated';
};

const compareWithEmptiness = (item, buildType, name) => {
  switch (buildType) {
    case 'emptiness vs tree':
      return { name, children: formatItemChildren(item), type: 'added' };
    case 'emptiness vs value':
      return { name, value: item, type: 'added' };
    case 'tree vs emptiness':
      return { name, children: formatItemChildren(item), type: 'removed' };
    case 'value vs emptiness':
      return { name, value: item, type: 'removed' };
    default:
      throw new Error(`Unexpected value of buildType variable: ${buildType}`);
  }
};

const defineBuildType = (item1, item2) => {
  if (isTree(item1) && isTree(item2)) {
    return 'tree vs tree';
  }

  if (item1 === undefined) {
    return isTree(item2) ? 'emptiness vs tree' : 'emptiness vs value';
  }

  if (item2 === undefined) {
    return isTree(item1) ? 'tree vs emptiness' : 'value vs emptiness';
  }

  if (_.isEqual(item1, item2)) {
    return 'value equal value';
  }

  if (isTree(item1)) {
    return 'tree vs value';
  }

  if (isTree(item2)) {
    return 'value vs tree';
  }

  return 'value vs value';
};

const buildDifferencesTree = (file1, file2) => {
  const sortedKeys = _.sortBy(_.uniq(Object.keys({ ...file1, ...file2 })));

  const resultTree = sortedKeys.reduce((root, currentName) => {
    const item1 = file1[currentName];
    const item2 = file2[currentName];

    const buildType = defineBuildType(item1, item2);

    switch (buildType) {
      case 'value equal value':
        return [...root, { name: currentName, value: item1, type: 'unchanged' }];
      case 'tree vs tree':
        return [...root, {
          name: currentName,
          children: buildDifferencesTree(item1, item2),
          type: defineTreeChangeType(item1, item2),
        }];
      case 'emptiness vs tree':
      case 'emptiness vs value':
        return [...root, compareWithEmptiness(item2, buildType, currentName)];
      case 'tree vs emptiness':
      case 'value vs emptiness':
        return [...root, compareWithEmptiness(item1, buildType, currentName)];
      case 'tree vs value':
      case 'value vs tree':
      case 'value vs value':
        return [...root, updateNode(item1, item2, buildType, currentName)];
      default:
        throw new Error(`Unexpected value of buildType variable: ${buildType}`);
    }
  }, []);

  return resultTree;
};

export default buildDifferencesTree;

import _ from 'lodash';

const formatItemChildren = (item, type = 'unchanged', currentName = '') => Object.entries(item).map(([key, value]) => {
  const name = currentName || key;

  if (_.isObject(value)) {
    return ({ name, children: formatItemChildren(value), type });
  }

  return ({ name, value, type });
});

// TODO: Так же сейчас условия для построения узлов дерева разбиты по разным функция,
// хорошо бы их объединить в одно место (в основную функцию скопом или отдельно выделить)
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

const calcMovedItem = (item, type, currentName) => {
  if (_.isObject(item)) {
    return { name: currentName, children: formatItemChildren(item), type };
  }

  return { name: currentName, value: item, type };
};

// TODO: Так же сейчас условия для построения узлов дерева разбиты по разным функция,
// хорошо бы их объединить в одно место (в основную функцию скопом или отдельно выделить)
const calcResultNode = (item1, item2, currentName = null) => {
  if (item1 === undefined) {
    return calcMovedItem(item2, 'added', currentName);
  }

  if (item2 === undefined) {
    return calcMovedItem(item1, 'removed', currentName);
  }

  if (_.isEqual(item1, item2)) {
    return { name: currentName, value: item1, type: 'unchanged' };
  }

  return updateNode(item1, item2, currentName);
};

const defineChangeType = (item1, item2) => {
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

    // TODO: Так же сейчас условия для построения узлов дерева разбиты по разным функция,
    // хорошо бы их объединить в одно место (в основную функцию скопом или отдельно выделить)
    if (_.isObject(item1) && _.isObject(item2)) {
      return [...root, {
        name: currentName,
        children: buildDifferencesTree(item1, item2),
        type: defineChangeType(item1, item2),
      }];
    }

    const resultNode = calcResultNode(item1, item2, currentName);

    return [...root, resultNode];
  }, []);

  return resultTree;
};

export default buildDifferencesTree;

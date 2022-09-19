import _ from 'lodash';

const formatClosingBrace = (filler, depth) => {
  const closingfillerStr = (depth === 1)
    ? ''
    : filler.slice(2);

  return `\n${closingfillerStr}}`;
};

const stringify = (data, filler = ' ', fillersCount = 1) => {
  const iter = (currentData, depth) => {
    if (_.isObject(currentData)) {
      const fillerStr = filler.repeat((fillersCount * depth) + (2 * depth) - 2);
      const openingBrace = '{\n';
      const closingBrace = formatClosingBrace(fillerStr, depth);

      const stringifiedObject = Object.entries(currentData).reduce((logOfDiffs, [key, value]) => {
        const formattedValue = iter(value, depth + 1);
        const previousLine = logOfDiffs ? `${logOfDiffs}\n${fillerStr}` : `${fillerStr}`;

        return `${previousLine}${key}: ${formattedValue}`;
      }, '');

      return `${openingBrace}${stringifiedObject}${closingBrace}`;
    }

    return `${currentData}`;
  };

  return iter(data, 1);
};

const getSign = (type) => {
  switch (type) {
    case 'added':
      return '+';
    case 'removed':
      return '-';
    default:
      return null;
  }
};

const formatUnchangedName = (name, sign = null, replacer = ' ') => {
  if (!sign) {
    return `${replacer.repeat(2)}${name}`;
  }

  return `${sign}${replacer}${name}`;
};

const formatUpdatedName = (name, replacer = ' ') => {
  const beforeValueName = `-${replacer}${name}`;
  const afterValueName = `+${replacer}${name}`;

  return [beforeValueName, afterValueName];
};

const updateTreeWithUpdatedItem = (tree, item, formatFunction) => {
  const [beforeValueName, afterValueName] = formatUpdatedName(item.name);
  const itemWithBeforeValue = _.set(
    { ...tree },
    [beforeValueName],
    formatFunction(item.before),
  );
  return _.set(itemWithBeforeValue, afterValueName, formatFunction(item.after));
};

const updateTreeWithMovedItem = (tree, item, formatFunction) => {
  const { value, children, type } = item;
  const name = formatUnchangedName(item.name, getSign(type));
  const newValue = (value === undefined) ? formatFunction(children) : value;

  return _.set({ ...tree }, [name], newValue);
};

const format = (data) => {
  if (!_.isObject(data)) {
    return data;
  }

  return data.reduce((formattedTree, item) => {
    const {
      name, value, type, children,
    } = item;

    switch (type) {
      case 'updated':
        return updateTreeWithUpdatedItem(formattedTree, item, format);
      case 'added':
        return updateTreeWithMovedItem(formattedTree, item, format);
      case 'removed':
        return updateTreeWithMovedItem(formattedTree, item, format);
      case 'unchanged':
        return children
          ? _.set({ ...formattedTree }, formatUnchangedName(name), format(children))
          : _.set({ ...formattedTree }, formatUnchangedName(name), value);
      default:
        throw new Error(`Unexpected value of property 'type': ${type}`);
    }
  }, {});
};

const stylish = (data) => stringify(format(data), ' ', 2);

export default stylish;

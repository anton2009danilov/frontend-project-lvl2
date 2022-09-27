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

const formatItemName = (item) => {
  if (_.isObject(item)) {
    const formattedItem = Object.entries(item).reduce((formatted, [key, value]) => {
      if (_.isObject(value)) {
        return { ...formatted, [`  ${key}`]: formatItemName(value) };
      }
      return { ...formatted, [`  ${key}`]: value };
    }, {});

    return formattedItem;
  }

  return item;
};

const format = (data) => {
  if (!_.isArray(data)) {
    return data;
  }

  return data.reduce((formattedTree, item) => {
    const {
      key, value, children, type, before, after,
    } = item;

    switch (type) {
      case 'updated':
        return {
          ...formattedTree,
          [`- ${key}`]: formatItemName(before),
          [`+ ${key}`]: formatItemName(after),
        };
      case 'added':
        return { ...formattedTree, [`+ ${key}`]: formatItemName(value) };
      case 'removed':
        return { ...formattedTree, [`- ${key}`]: formatItemName(value) };
      case 'nested':
        return { ...formattedTree, [`  ${key}`]: format(children) };
      case 'unchanged':
        return { ...formattedTree, [`  ${key}`]: value };
      default:
        throw new Error(`Unexpected value of property 'type': ${type}`);
    }
  }, {});
};

const stylish = (data) => stringify(format(data), ' ', 2);

export default stylish;

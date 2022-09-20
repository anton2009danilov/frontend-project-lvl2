import _ from 'lodash';

const isTree = (data) => data.children || false;
const isComplex = (data) => _.isArray(data) || data === '[complex value]';

const prepareForDisplay = (value) => {
  if (isComplex(value)) {
    return '[complex value]';
  }

  if (_.isString(value)) {
    return `'${value}'`;
  }

  return value;
};

const getFormattedValue = (item) => {
  if (isTree(item)) {
    return '[complex value]';
  }

  return prepareForDisplay(item.value);
};

const getCompositeKey = (parentKey, name) => {
  if (parentKey) {
    return `${parentKey}.${name}`;
  }

  return name;
};

const stringify = (data, log = '', parentKey = '') => data.reduce((logOfDiffs, item) => {
  const { name, children, type } = item;
  const key = getCompositeKey(parentKey, name);
  const value = getFormattedValue(item);
  const before = prepareForDisplay(item.before);
  const after = prepareForDisplay(item.after);

  switch (type) {
    case 'added':
      return `${logOfDiffs}Property '${key}' was ${type} with value: ${value}\n`;
    case 'removed':
      return `${logOfDiffs}Property '${key}' was ${type}\n`;
    case 'updated':
      return `${logOfDiffs}Property '${key}' was ${type}. From ${before} to ${after}\n`;
    case 'children updated':
      return stringify(children, logOfDiffs, key);
    case 'unchanged':
      return logOfDiffs;
    default:
      throw new Error(`Unexpected value of property 'type': ${type}`);
  }
}, log);

const plain = (data) => stringify(data).trim();

export default plain;

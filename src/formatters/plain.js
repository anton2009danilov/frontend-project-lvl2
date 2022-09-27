import _ from 'lodash';

const isTree = (data) => data.children || false;
const isComplex = (data) => _.isObject(data) || data === '[complex value]';

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
  const { key, children, type } = item;
  const name = getCompositeKey(parentKey, key);
  const value = getFormattedValue(item);
  const before = prepareForDisplay(item.before);
  const after = prepareForDisplay(item.after);

  switch (type) {
    case 'added':
      return `${logOfDiffs}Property '${name}' was ${type} with value: ${value}\n`;
    case 'removed':
      return `${logOfDiffs}Property '${name}' was ${type}\n`;
    case 'updated':
      return `${logOfDiffs}Property '${name}' was ${type}. From ${before} to ${after}\n`;
    case 'nested':
      return stringify(children, logOfDiffs, name);
    case 'unchanged':
      return logOfDiffs;
    default:
      throw new Error(`Unexpected value of property 'type': ${type}`);
  }
}, log);

const plain = (data) => stringify(data).trim();

export default plain;

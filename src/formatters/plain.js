import _ from 'lodash';

const isTree = (data) => data.children || false;

const prepareForDisplay = (value) => {
  if (_.isArray(value)) {
    return '[complex value]';
  }

  if (typeof value === 'string' && value !== '[complex value]') {
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

const getCurrentKey = (parentKey, name) => {
  if (parentKey) {
    return `${parentKey}.${name}`;
  }

  return name;
};

const stringify = (data, str = '', parentKey = '') => data.reduce((logOfDiffs, item) => {
  const { name, children, type } = item;
  const key = getCurrentKey(parentKey, name);
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
    case undefined:
      return (children !== undefined) ? stringify(children, logOfDiffs, key) : logOfDiffs;
    default:
      throw new Error(`Unexpected value of property 'type': ${type}`);
  }
}, str);

const plain = (data) => stringify(data).replace(/\n$/, '');

export default plain;

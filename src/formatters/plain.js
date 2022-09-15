import _ from 'lodash';

const getSimpleValue = (value) => (typeof value === 'object' ? '[complex value]' : value);

const prepareForDisplay = (value) => {
  if (_.isArray(value)) {
    return '[complex value]';
  }

  if (typeof value === 'string' && value !== '[complex value]') {
    return `'${value}'`;
  }
  return value;
};

const getCurrentValue = (item) => {
  const { value, children } = item;

  if (value === undefined) {
    return getSimpleValue(children);
  }

  return value;
};

const getCurrentKey = (parentKey, name) => {
  if (parentKey) {
    return `${parentKey}.${name}`;
  }

  return name;
};

const formatAddedItem = (resultStr, parentKey, item) => {
  const { name, type } = item;
  return `${resultStr}Property '${getCurrentKey(parentKey, name)}' was ${type} with value: ${prepareForDisplay(getCurrentValue(item))}\n`;
};

const formatRemovedItem = (resultStr, parentKey, item) => {
  const { name, type } = item;
  return `${resultStr}Property '${getCurrentKey(parentKey, name)}' was ${type}\n`;
};

const formatUpdatedItem = (resultStr, parentKey, item) => {
  const {
    name, type, before, after,
  } = item;

  return `${resultStr}Property '${getCurrentKey(parentKey, name)}' was ${type}. From ${prepareForDisplay(before)} to ${prepareForDisplay(after)}\n`;
};

const formatUnchangedItem = (item, parentKey, resultStr, stringify) => {
  const { children, name } = item;
  if (children !== undefined) {
    return stringify(children, resultStr, getCurrentKey(parentKey, name));
  }

  return resultStr;
};

const stringify = (data, str = '', parentKey = '') => data.reduce((resultStr, item) => {
  const { type } = item;

  switch (type) {
    case 'added':
      return formatAddedItem(resultStr, parentKey, item);
    case 'removed':
      return formatRemovedItem(resultStr, parentKey, item);
    case 'updated':
      return formatUpdatedItem(resultStr, parentKey, item);
    case undefined:
      return formatUnchangedItem(item, parentKey, resultStr, stringify);
    default:
      throw Error(`An item of tree has unknown type: ${type}`);
  }
}, str);

const plain = (data) => stringify(data).replace(/\n$/, '');

export default plain;

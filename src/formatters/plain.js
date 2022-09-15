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

const formatAddedItem = (parentKey, item) => {
  const { name, type } = item;
  const key = getCurrentKey(parentKey, name);
  const value = prepareForDisplay(getCurrentValue(item));

  return `Property '${key}' was ${type} with value: ${value}\n`;
};

const formatRemovedItem = (parentKey, item) => {
  const { name, type } = item;
  const key = getCurrentKey(parentKey, name);

  return `Property '${key}' was ${type}\n`;
};

const formatUpdatedItem = (parentKey, item) => {
  const { name, type } = item;
  const key = getCurrentKey(parentKey, name);
  const before = prepareForDisplay(item.before);
  const after = prepareForDisplay(item.after);

  return `Property '${key}' was ${type}. From ${before} to ${after}\n`;
};

const formatUnchangedItem = (item, parentKey, resultStr, stringify) => {
  const { children, name } = item;
  if (children !== undefined) {
    const key = getCurrentKey(parentKey, name);

    return stringify(children, resultStr, key);
  }

  return resultStr;
};

const stringify = (data, str = '', parentKey = '') => data.reduce((resultStr, item) => {
  const { type } = item;

  switch (type) {
    case 'added':
      return `${resultStr}${formatAddedItem(parentKey, item)}`;
    case 'removed':
      return `${resultStr}${formatRemovedItem(parentKey, item)}`;
    case 'updated':
      return `${resultStr}${formatUpdatedItem(parentKey, item)}`;
    case undefined:
      return formatUnchangedItem(item, parentKey, resultStr, stringify);
    default:
      throw Error(`An item of tree has unknown type: ${type}`);
  }
}, str);

const plain = (data) => stringify(data).replace(/\n$/, '');

export default plain;

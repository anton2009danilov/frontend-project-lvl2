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

const formatAddedItem = (resultStr, currentKey, type, currentValue) => `${resultStr}Property '${currentKey}' was ${type} with value: ${prepareForDisplay(currentValue)}\n`;

const formatRemovedItem = (resultStr, currentKey, type) => `${resultStr}Property '${currentKey}' was ${type}\n`;

const formatUpdatedItem = (resultStr, currentKey, item) => {
  const { type, before, after } = item;

  return `${resultStr}Property '${currentKey}' was ${type}. From ${prepareForDisplay(before)} to ${prepareForDisplay(after)}\n`;
};

const stringify = (data, str = '', parentKey = '') => data.reduce((resultStr, item) => {
  const {
    name, type, children,
  } = item;

  switch (type) {
    case 'added':
      return formatAddedItem(
        resultStr,
        getCurrentKey(parentKey, name),
        type,
        getCurrentValue(item),
      );
    case 'removed':
      return formatRemovedItem(resultStr, getCurrentKey(parentKey, name), type);
    case 'updated':
      return formatUpdatedItem(resultStr, getCurrentKey(parentKey, name), item);
    default:
      return (children !== undefined)
        ? stringify(children, resultStr, getCurrentKey(parentKey, name))
        : resultStr;
  }
}, str);

const plain = (data) => stringify(data).replace(/\n$/, '');

export default plain;

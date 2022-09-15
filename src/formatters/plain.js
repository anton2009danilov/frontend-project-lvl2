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

const stringify = (data, str = '', parentKey = '') => data.reduce((resultStr, item) => {
  const { name, children, type } = item;
  const key = getCurrentKey(parentKey, name);
  const value = prepareForDisplay(getCurrentValue(item));
  const before = prepareForDisplay(item.before);
  const after = prepareForDisplay(item.after);

  switch (type) {
    case 'added':
      return `${resultStr}Property '${key}' was ${type} with value: ${value}\n`;
    case 'removed':
      return `${resultStr}Property '${key}' was ${type}\n`;
    case 'updated':
      return `${resultStr}Property '${key}' was ${type}. From ${before} to ${after}\n`;
    case undefined:
      return (children !== undefined) ? stringify(children, resultStr, key) : resultStr;
    default:
      throw new Error(`Unexpected value of property 'type': ${type}`);
  }
}, str);

const plain = (data) => stringify(data).replace(/\n$/, '');

export default plain;

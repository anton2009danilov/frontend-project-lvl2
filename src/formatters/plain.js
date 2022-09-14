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

const stringify = (data, str = '', parentKey = '') => data.reduce((resultStr, item) => {
  const {
    name, type, value, children, before, after,
  } = item;
  const currentValue = value === undefined ? getSimpleValue(children) : value;
  const currentKey = parentKey ? `${parentKey}.${name}` : name;

  if (type === 'added') {
    return `${resultStr}Property '${currentKey}' was ${type} with value: ${prepareForDisplay(currentValue)}\n`;
  }

  if (type === 'removed') {
    return `${resultStr}Property '${currentKey}' was ${type}\n`;
  }

  if (type === 'updated') {
    return `${resultStr}Property '${currentKey}' was ${type}. From ${prepareForDisplay(before)} to ${prepareForDisplay(after)}\n`;
  }

  return children !== undefined ? stringify(children, resultStr, currentKey) : resultStr;
}, str);

const plain = (data) => stringify(data).replace(/\n$/, '');

export default plain;

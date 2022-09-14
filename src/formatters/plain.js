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

const formatAdded = (resultStr, currentKey, type, currentValue) => `${resultStr}Property '${currentKey}' was ${type} with value: ${prepareForDisplay(currentValue)}\n`;

const formatRemoved = (resultStr, currentKey, type) => `${resultStr}Property '${currentKey}' was ${type}\n`;

const formatUpdated = (resultStr, currentKey, item) => {
  const { type, before, after } = item;

  return `${resultStr}Property '${currentKey}' was ${type}. From ${prepareForDisplay(before)} to ${prepareForDisplay(after)}\n`;
};

const stringify = (data, str = '', parentKey = '') => data.reduce((resultStr, item) => {
  const {
    name, type, value, children,
  } = item;
  const currentValue = (value === undefined) ? getSimpleValue(children) : value;
  const currentKey = parentKey ? `${parentKey}.${name}` : name;

  switch (type) {
    case 'added':
      return formatAdded(resultStr, currentKey, type, currentValue);
    case 'removed':
      return formatRemoved(resultStr, currentKey, type);
    case 'updated':
      return formatUpdated(resultStr, currentKey, item);
    default:
      return (children !== undefined) ? stringify(children, resultStr, currentKey) : resultStr;
  }
}, str);

const plain = (data) => stringify(data).replace(/\n$/, '');

export default plain;

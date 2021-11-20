const isObject = (data) => Object.prototype.toString.call(data) === '[object Object]';
const getSimpleValue = (item) => (isObject(item.value) ? '[complex value]' : item.value);

const prepareForDisplay = (value) => (typeof value === 'string' && value !== '[complex value]'
  ? `'${value}'`
  : value);

const stringify = (data, str = '', parentKey = '') => {
  let result = str;

  Object.entries(data).forEach(([key, item]) => {
    const currentKey = parentKey ? `${parentKey}.${key}` : key;

    if (!item.status) {
      result = stringify(item, result, currentKey);
    }

    if (item.status === 'added') {
      result += `Property '${currentKey}' was ${item.status} with value: ${prepareForDisplay(item.value)}\n`;
    }

    if (item.status === 'removed') {
      result += `Property '${currentKey}' was ${item.status}\n`;
    }

    if (item.status === 'updated') {
      result += `Property '${currentKey}' was ${item.status}. From ${prepareForDisplay(item.before)} to ${prepareForDisplay(item.after)}\n`;
    }
  });

  return result;
};

const format = (data) => {
  const formattedResult = {};
  Object.entries(data).forEach(([key, item]) => {
    if (key === 'nodeFormat') return;

    let result = {};

    if (item.nodeFormat === 'tree' && !item.sign) {
      if (item.value) {
        if (item.value.nodeFormat === 'tree') {
          result.child = format(item);
        }
      }
      result = format(item);
    }

    if (item.nodeFormat === 'tree' && item.sign) {
      result.status = item.sign === '+' ? 'added' : 'removed';

      if (item.sign === '+') {
        result.value = getSimpleValue(item);
      }
    }

    if (item.nodeFormat === 'item' && item.sign) {
      result.status = item.sign === '+' ? 'added' : 'removed';

      if (item.sign === '+') {
        result.value = item.value;
      }
    }

    if (item.nodeFormat === 'list') {
      result.status = 'updated';
      result.before = getSimpleValue(item.before);
      result.after = getSimpleValue(item.after);
    }

    formattedResult[key] = result;
  });

  return formattedResult;
};

const plain = (data) => stringify(format(data)).replace(/\n$/, '');

export default plain;

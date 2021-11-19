const isObject = (data) => Object.prototype.toString.call(data) === '[object Object]';
const getSimpleValue = (item) => (isObject(item.value) ? '[complex value]' : item.value);

const format = (data) => {
  const formattedResult = {};
  Object.entries(data).forEach(([key, item]) => {
    if (key === 'type') return;

    let result = {};

    if (item.type === 'tree' && !item.sign) {
      if (item.value) {
        if (item.value.type === 'tree') {
          result.child = format(item);
        }
      }
      result = format(item);
    }

    if (item.type === 'tree' && item.sign) {
      result.status = item.sign === '+' ? 'added' : 'removed';

      if (item.sign === '+') {
        result.value = getSimpleValue(item);
      }
    }

    if (item.type === 'item' && item.sign) {
      result.status = item.sign === '+' ? 'added' : 'removed';

      if (item.sign === '+') {
        result.value = item.value;
      }
    }

    if (item.type === 'list') {
      result.status = 'updated';
      result.before = getSimpleValue(item.before);
      result.after = getSimpleValue(item.after);
    }

    formattedResult[key] = result;
  });

  return formattedResult;
};

export default format;

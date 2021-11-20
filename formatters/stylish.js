const isObject = (obj) => Object.prototype.toString.call(obj) === '[object Object]';

const stringify = (data, replacer = ' ', replacersCount = 1) => {
  const iter = (currentData, depth) => {
    if (isObject(currentData)) {
      const replacerStr = replacer.repeat(replacersCount * depth + 2 * (depth - 1));

      const parenReplacerStr = depth === 1
        ? replacer.repeat(replacersCount * (depth - 1))
        : replacer.repeat(replacersCount * depth + 2 * (depth - 2));

      let str = '';
      const openParen = '{';
      const closeParen = `${parenReplacerStr}}`;

      Object.entries(currentData).map(([key, value]) => {
        let newKey;
        let newValue;

        if (isObject(value)) {
          newKey = iter(key, depth + 1);
          newValue = iter(value, depth + 1);
        } else {
          newKey = stringify(key);
          newValue = stringify(value);
        }

        str += `\n${replacerStr}${newKey}: ${newValue}`;
        return undefined;
      });

      return `${openParen}${str}\n${closeParen}`;
    }

    if (typeof currentData === 'string') {
      return currentData;
    }

    return `${currentData}`;
  };

  return iter(data, 1);
};

const format = (data) => {
  const result = {};
  const replacer = ' ';
  if (!data) {
    return null;
  }

  Object.entries(data).forEach(([key, item]) => {
    if (item.nodeFormat === 'tree' && !item.sign) {
      result[`${replacer.repeat(2)}${key}`] = format(item);

      if (item.value) {
        if (item.value.nodeFormat === 'tree') {
          result[`${replacer.repeat(2)}${key}`] = format(item);
        }

        if (item.value.nodeFormat === 'item') {
          result[`${replacer.repeat(2)}${key}`] = format(item.value);
        } else {
          result[`${replacer.repeat(2)}${key}`] = format(item.value);
        }
      }
    }

    if (item.nodeFormat === 'tree' && item.sign) {
      result[`${item.sign}${replacer}${key}`] = format(item.value);
    }

    if (item.nodeFormat === 'list') {
      result[`-${replacer}${key}`] = item.before.nodeFormat === 'tree' ? format(item.before.value) : item.before.value;
      result[`+${replacer}${key}`] = item.after.nodeFormat === 'tree' ? format(item.after.value) : item.after.value;
    }

    if (item.nodeFormat === 'item' && !item.sign) {
      result[`${replacer.repeat(2)}${key}`] = item.value;
    }

    if (item.nodeFormat === 'item' && item.sign) {
      result[`${item.sign}${replacer}${key}`] = item.value;
    }
  });

  return result;
};

const stylish = (data) => stringify(format(data), ' ', 2);

export default stylish;

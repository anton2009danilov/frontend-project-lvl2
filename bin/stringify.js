const isObject = (obj) => Object.prototype.toString.call(obj) === '[object Object]';

const stringify = (data, replacer = ' ', replacersCount = 1) => {
  const iter = (currentData, depth) => {
    if (isObject(currentData)) {
      const replacerStr = replacer.repeat(replacersCount * depth);
      const parenReplacerStr = replacer.repeat(replacersCount * (depth - 1));
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

export default stringify;

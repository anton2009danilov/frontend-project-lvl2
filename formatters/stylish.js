import _ from 'lodash';

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

const getSign = (format) => {
  switch (format) {
    case 'added':
      return '+';
    case 'removed':
      return '-';
    default:
      return null;
  }
};

const format = (data) => {
  const replacer = ' ';
  if (!data) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  return data.reduce((formattedObj, item) => {
    const { value, children, type } = item;
    const sign = getSign(type);

    if (children !== undefined && !sign) {
      const name = `${replacer.repeat(2)}${item.name}`;
      return _.set({ ...formattedObj }, [name], format(children));
    }

    if (children !== undefined && sign) {
      const name = `${sign}${replacer}${item.name}`;
      return _.set({ ...formattedObj }, [name], format(children));
    }

    if (type === 'updated') {
      const beforeValueName = `-${replacer}${item.name}`;
      const afterValueName = `+${replacer}${item.name}`;
      const itemWithBeforeValue = _.set(
        { ...formattedObj },
        [beforeValueName],
        format(item.before),
      );
      return _.set(itemWithBeforeValue, afterValueName, format(item.after));
    }

    if (type === 'added' || type === 'removed') {
      const name = `${sign}${replacer}${item.name}`;
      const newValue = value === undefined ? format(children) : value;
      return _.set({ ...formattedObj }, [name], newValue);
    }

    const name = `${replacer.repeat(2)}${item.name}`;
    return _.set({ ...formattedObj }, name, value);
  }, {});
};

const stylish = (data) => stringify(format(data), ' ', 2);

export default stylish;

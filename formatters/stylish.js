import _ from 'lodash';

const isObject = (obj) => Object.prototype.toString.call(obj) === '[object Object]';

const stringify = (data, replacer = ' ', replacersCount = 1) => {
  const iter = (currentData, depth) => {
    if (isObject(currentData)) {
      const replacerStr = replacer.repeat(replacersCount * depth + 2 * (depth - 1));

      const parenReplacerStr = depth === 1
        ? replacer.repeat(replacersCount * (depth - 1))
        : replacer.repeat(replacersCount * depth + 2 * (depth - 2));

      const closeParen = `${parenReplacerStr}}`;

      const result = Object.entries(currentData).reduce((str, [key, value]) => {
        if (isObject(value)) {
          const newKey = iter(key, depth + 1);
          const newValue = iter(value, depth + 1);
          return `${str}\n${replacerStr}${newKey}: ${newValue}`;
        }

        const newKey = stringify(key);
        const newValue = stringify(value);
        return `${str}\n${replacerStr}${newKey}: ${newValue}`;
      }, '');

      return `{${result}\n${closeParen}`;
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

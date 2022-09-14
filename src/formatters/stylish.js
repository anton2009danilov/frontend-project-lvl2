import _ from 'lodash';

const stringify = (data, replacer = ' ', replacersCount = 1) => {
  const iter = (currentData, depth) => {
    if (_.isObject(currentData)) {
      const replacerStr = replacer.repeat(replacersCount * depth + 2 * (depth - 1));

      const closingReplacerStr = depth === 1
        ? replacer.repeat(replacersCount * (depth - 1))
        : replacer.repeat(replacersCount * depth + 2 * (depth - 2));

      const closingBrace = `${closingReplacerStr}}`;

      const result = Object.entries(currentData).reduce((accString, [key, value]) => {
        if (_.isObject(value)) {
          const newKey = iter(key, depth + 1);
          const newValue = iter(value, depth + 1);
          return `${accString}\n${replacerStr}${newKey}: ${newValue}`;
        }

        const newKey = stringify(key);
        const newValue = stringify(value);
        return `${accString}\n${replacerStr}${newKey}: ${newValue}`;
      }, '');

      return `{${result}\n${closingBrace}`;
    }

    if (typeof currentData === 'string') {
      return currentData;
    }

    return `${currentData}`;
  };

  return iter(data, 1);
};

const getSign = (type) => {
  switch (type) {
    case 'added':
      return '+';
    case 'removed':
      return '-';
    default:
      return null;
  }
};

const formatUnchangedName = (name, sign = null, replacer = ' ') => {
  if (!sign) {
    return `${replacer.repeat(2)}${name}`;
  }

  return `${sign}${replacer}${name}`;
};

const formatUpdatedName = (name, replacer = ' ') => {
  const beforeValueName = `-${replacer}${name}`;
  const afterValueName = `+${replacer}${name}`;

  return [beforeValueName, afterValueName];
};

const format = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  return data.reduce((formattedObj, item) => {
    const { value, children, type } = item;
    const sign = getSign(type);

    if (item.children) {
      const name = formatUnchangedName(item.name, sign);
      return _.set({ ...formattedObj }, [name], format(children));
    }

    if (type === 'updated') {
      const [beforeValueName, afterValueName] = formatUpdatedName(item.name);
      const itemWithBeforeValue = _.set(
        { ...formattedObj },
        [beforeValueName],
        format(item.before),
      );
      return _.set(itemWithBeforeValue, afterValueName, format(item.after));
    }

    if (type === 'added' || type === 'removed') {
      const name = formatUnchangedName(item.name, sign);
      const newValue = value === undefined ? format(children) : value;
      return _.set({ ...formattedObj }, [name], newValue);
    }

    const name = formatUnchangedName(item.name);
    return _.set({ ...formattedObj }, name, value);
  }, {});
};

const stylish = (data) => stringify(format(data), ' ', 2);

export default stylish;

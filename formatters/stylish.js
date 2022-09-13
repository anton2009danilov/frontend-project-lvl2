import _ from 'lodash';

const isObject = (obj) => Object.prototype.toString.call(obj) === '[object Object]';

const stringify = (data, replacer = ' ', replacersCount = 1) => {
  const iter = (currentData, depth) => {
    if (isObject(currentData)) {
      const replacerStr = replacer.repeat(replacersCount * depth + 2 * (depth - 1));

      const closingReplacerStr = depth === 1
        ? replacer.repeat(replacersCount * (depth - 1))
        : replacer.repeat(replacersCount * depth + 2 * (depth - 2));

      const closingBrace = `${closingReplacerStr}}`;

      const result = Object.entries(currentData).reduce((accString, [key, value]) => {
        if (isObject(value)) {
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

const defineFormatType = (data) => {
  if (!data) {
    return 'no format';
  }

  if (typeof data !== 'object') {
    return 'no format';
  }

  const { children, type } = data;

  if (children !== undefined) {
    return 'format item with children';
  }

  if (type === 'updated') {
    return 'format updated item';
  }

  if (type === 'added' || type === 'removed') {
    return 'format added or removed item';
  }

  return 'format unchanged item';
};

const formatUnchangedItemName = (item, sign = null, replacer = ' ') => {
  if (!sign) {
    return `${replacer.repeat(2)}${item.name}`;
  }

  return `${sign}${replacer}${item.name}`;
};

const formatUpdatedItemName = (item, replacer = ' ') => {
  const beforeValueName = `-${replacer}${item.name}`;
  const afterValueName = `+${replacer}${item.name}`;

  return [beforeValueName, afterValueName];
};

const format = (data) => {
  const dataFormatType = defineFormatType(data);

  if (dataFormatType === 'no format') {
    return data;
  }

  return data.reduce((formattedObj, item) => {
    const { value, children, type } = item;
    const itemFormatType = defineFormatType(item);
    const sign = getSign(type);

    if (itemFormatType === 'format item with children') {
      const name = formatUnchangedItemName(item, sign);
      return _.set({ ...formattedObj }, [name], format(children));
    }

    if (itemFormatType === 'format updated item') {
      const [beforeValueName, afterValueName] = formatUpdatedItemName(item);
      const itemWithBeforeValue = _.set(
        { ...formattedObj },
        [beforeValueName],
        format(item.before),
      );
      return _.set(itemWithBeforeValue, afterValueName, format(item.after));
    }

    if (itemFormatType === 'format added or removed item') {
      const name = formatUnchangedItemName(item, sign);
      const newValue = value === undefined ? format(children) : value;
      return _.set({ ...formattedObj }, [name], newValue);
    }

    const name = formatUnchangedItemName(item);
    return _.set({ ...formattedObj }, name, value);
  }, {});
};

const stylish = (data) => stringify(format(data), ' ', 2);

export default stylish;

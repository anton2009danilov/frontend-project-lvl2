const format = (data) => {
  const result = {};
  const replacer = ' ';
  if (!data) {
    return null;
  }

  Object.entries(data).forEach(([key, item]) => {
    if (item.type === 'tree' && !item.sign) {
      result[`${replacer.repeat(2)}${key}`] = format(item);

      if (item.value) {
        if (item.value.type === 'tree') {
          result[`${replacer.repeat(2)}${key}`] = format(item);
        }

        if (item.value.type === 'item') {
          result[`${replacer.repeat(2)}${key}`] = format(item.value);
        } else {
          result[`${replacer.repeat(2)}${key}`] = format(item.value);
        }
      }
    }

    if (item.type === 'tree' && item.sign) {
      result[`${item.sign}${replacer}${key}`] = format(item.value);
    }

    if (item.type === 'list') {
      result[`-${replacer}${key}`] = item.before.type === 'tree' ? format(item.before.value) : item.before.value;
      result[`+${replacer}${key}`] = item.after.type === 'tree' ? format(item.after.value) : item.after.value;
    }

    if (item.type === 'item' && !item.sign) {
      result[`${replacer.repeat(2)}${key}`] = item.value;
    }

    if (item.type === 'item' && item.sign) {
      result[`${item.sign}${replacer}${key}`] = item.value;
    }
  });

  return result;
};

export default format;

import _ from 'lodash';

const format = (data) => {
  if (!_.isArray(data)) {
    return data;
  }

  return data.reduce((resultTree, item) => {
    if (item.type === 'unchanged') {
      return format([...resultTree, _.omit(item, 'type')]);
    }

    if (item.children) {
      return [...resultTree, { ...item, children: format(item.children) }];
    }

    if (item.type === 'added') {
      return [...resultTree, { ...item, value: format(item.value) }];
    }

    if (item.type === 'removed') {
      return [...resultTree, { ...item, value: format(item.value) }];
    }

    if (item.type === 'updated') {
      return [...resultTree, { ...item, before: format(item.before), after: format(item.after) }];
    }

    return [...resultTree, item];
  }, []);
};

export default (data) => JSON.stringify(format(data));

import _ from 'lodash';

const omitType = (obj) => {
  if (obj.type === 'unchanged') {
    return _.omit(obj, 'type');
  }

  if (obj.type === 'children updated') {
    return _.omit(obj, 'type');
  }

  return obj;
};

const format = (data) => {
  if (!_.isArray(data)) {
    return data;
  }

  return data.map((el) => {
    if (_.isObject(el)) {
      return el.before
        ? { ...omitType(el), before: format(el.before), after: format(el.after) }
        : { ...omitType(el), children: format(el.children) };
    }

    return el;
  });
};

export default (data) => JSON.stringify(format(data));

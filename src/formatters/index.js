import plain from './plain.js';
import stylish from './stylish.js';

export default (data, formatterType) => {
  if (formatterType === 'plain') {
    return plain(data);
  }

  if (formatterType === 'json') {
    return JSON.stringify(data);
  }
  return stylish(data);
};

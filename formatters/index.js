import plain from './plain.js';
import stylish from './stylish.js';

export default (data, formatterType) => {
  if (formatterType === 'plain') {
    return plain(data);
  }

  return stylish(data);
};

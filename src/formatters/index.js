import json from './json.js';
import plain from './plain.js';
import stylish from './stylish.js';

export default (data, formatter) => {
  switch (formatter) {
    case 'plain':
      return plain(data);
    case 'json':
      return json(data);
    case 'stylish':
      return stylish(data);
    default:
      throw new Error(`Unexpected value of formatter param: ${formatter}`);
  }
};

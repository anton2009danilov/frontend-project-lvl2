import * as path from 'path';
import * as yaml from 'js-yaml';

export default (fileData, filePath) => {
  if (path.extname(filePath) === 'json') {
    return JSON.parse(fileData);
  }

  return yaml.load(fileData);
};

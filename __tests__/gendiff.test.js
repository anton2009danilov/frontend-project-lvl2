import { fileURLToPath } from 'url';
import * as path from 'path';
import action from '../bin/action';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const fixture1 = getFixturePath('file1.json');
const fixture2 = getFixturePath('file2.json');
// const path1 = './__fixtures__/file1.json';
// const path2 = './__fixtures__/file2.json';

const diff = `{
  - follow: false
    host: hexlet.io
  - proxy: 123.234.53.22
  - timeout: 50
  + timeout: 20
  + verbose: true
}`;

// eslint-disable-next-line
test('gendiff', () => {
  console.log(fixture1, fixture2);
  // eslint-disable-next-line
  expect(action(fixture1, fixture2)).toBe(diff);
});

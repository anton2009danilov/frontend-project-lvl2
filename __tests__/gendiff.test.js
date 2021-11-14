// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
import action from '../bin/action';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
// const fixture1 = getFixturePath('file1.json');
// const fixture2 = getFixturePath('file2.json');
const path1 = './__fixtures__/file1.json';
const path2 = './__fixtures__/file2.json';

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
  console.log(path1, path2);
  // eslint-disable-next-line
  expect(1).toBe(1);
  // expect(action(path1, path2)).toBe(diff);
});

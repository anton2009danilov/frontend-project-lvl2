import plain from './plain.js';
import stylish from './stylish.js';

export default (data, formatter) => {
  switch (formatter) {
    case 'plain':
      return plain(data);
    case 'json':
      return JSON.stringify(data);
    // TODO: Так значение по умолчанию неверно выставлять.
    // Тут должен быть вывод ошибки, т.к. может прилететь любой формат
    //  и на уровне парсера не сказать, что парсер не умеет
    // с таким форматом работать. Формат по умолчанию уже есть:
    // const genDiff = (filepath1, filepath2, formatter = 'stylish') => {
    default:
      return stylish(data);
  }
};

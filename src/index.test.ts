import { sayHi } from './';

describe('sayHi', () => {
  test('it says hi', () => {
    expect(sayHi('Solanum')).toEqual('Hello Solanum!');
  });
});

import { isNil } from 'lodash';

export const someNil = (...args: any) => {
  for (const arg of args) {
    if (isNil(arg)) {
      return true;
    }
  }
  return false;
};

export * from './exception';

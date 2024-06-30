import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { capitalize } from 'lodash';

export const createNotFoundException = <I extends { toString(): string }>(
  resource: string,
  identifierName: string,
  identifierValue: I,
) => {
  return new NotFoundException(`${capitalize(resource)} not found`, {
    description: `${resource.toLowerCase()} with ${identifierName} '${identifierValue}' cannot be found`,
  });
};

export const createUnknownException = () =>
  new InternalServerErrorException('Unable to check-in', {
    description: 'unknown error',
  });

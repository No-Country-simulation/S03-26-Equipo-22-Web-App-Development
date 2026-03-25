import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (value === null || value === undefined || value === '') {
            return true;
          }

          const date = new Date(String(value));
          if (Number.isNaN(date.getTime())) {
            return false;
          }

          return date <= new Date();
        },
        defaultMessage(args?: ValidationArguments) {
          return `${args?.property ?? 'La fecha'} no puede estar en el futuro.`;
        },
      },
    });
  };
}

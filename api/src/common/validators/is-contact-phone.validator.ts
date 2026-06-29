import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const MAX_FORMATTED_LENGTH = 20;
const MIN_DIGITS = 7;
const MAX_DIGITS = 15;

@ValidatorConstraint({ name: 'isContactPhone', async: false })
export class IsContactPhoneConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value == null || value === '') return true;
    if (typeof value !== 'string') return false;

    const trimmed = value.trim();
    if (trimmed.length > MAX_FORMATTED_LENGTH) return false;

    const digits = trimmed.replace(/\D/g, '');
    return digits.length >= MIN_DIGITS && digits.length <= MAX_DIGITS;
  }

  defaultMessage(): string {
    return `El contacto debe tener entre ${MIN_DIGITS} y ${MAX_DIGITS} dígitos`;
  }
}

export function IsContactPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsContactPhoneConstraint,
    });
  };
}

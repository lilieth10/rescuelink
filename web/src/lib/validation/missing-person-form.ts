import { isValidContact } from './contact';

export interface MissingPersonFormValues {
  name: string;
  age: string;
  lastKnownLocation: string;
  familyContact: string;
  physicalDescription: string;
}

export interface MissingPersonFormErrors {
  name?: string;
  familyContact?: string;
}

export function validateMissingPersonForm(
  form: MissingPersonFormValues,
): MissingPersonFormErrors | null {
  const errors: MissingPersonFormErrors = {};

  if (form.name.trim().length < 2) {
    errors.name = 'required';
  }

  if (form.lastKnownLocation.trim().length < 3) {
    // HTML required handles this; kept for programmatic checks
  }

  if (!isValidContact(form.familyContact)) {
    errors.familyContact = 'invalid';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

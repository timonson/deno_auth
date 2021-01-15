import { failure, Result, success } from "../deps.ts";
import {
  EmailAndPassword,
  UserAndEmailAndPassword,
} from "../authentication/mod.ts";

export function isObjectWide(obj: unknown): obj is Record<string, unknown> {
  return (
    obj !== null && typeof obj === "object" && Array.isArray(obj) === false
  );
}

export function isString(input: unknown): input is string {
  return typeof input === "string";
}

export function isStringWithLengthBetween(
  minimumLength: number,
  maximumLength: number,
  input: unknown,
): input is string {
  return isString(input) && input.length > minimumLength &&
    input.length < maximumLength;
}

export function isEmail(input: unknown): input is string {
  // https://stackoverflow.com/a/46181
  const regex =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return isStringWithLengthBetween(2, 101, input) &&
    regex.test(input.toLowerCase());
}

export function validateRegisterInput(
  input: unknown,
): Result<UserAndEmailAndPassword, Error> {
  if (isObjectWide(input)) {
    if (
      isEmail(input.email) && isStringWithLengthBetween(2, 16, input.user) &&
      isStringWithLengthBetween(2, 101, input.password)
    ) {
      return success(
        {
          email: input.email,
          password: input.password,
          user: input.user,
        },
      );
    }
  }
  return failure(Error("Invalid user data."));
}

export function validateLoginInput(
  input: unknown,
): Result<EmailAndPassword, Error> {
  if (isObjectWide(input)) {
    if (
      isEmail(input.email) && isStringWithLengthBetween(2, 101, input.password)
    ) {
      return success({ email: input.email, password: input.password });
    }
  }
  return failure(Error("Invalid user data."));
}

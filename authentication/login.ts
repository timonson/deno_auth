import {
  chainResult,
  failure,
  foldResult,
  getNumericDate,
  ifFailed,
  success,
} from "../deps.ts";
import { validateLoginInput } from "../validation/mod.ts";
import { createJwt, verifyPassword } from "../crypto/mod.ts";
import { selectPasswordAndUserByEmail } from "../database/mod.ts";
import type { EmailAndPassword, UserAndEmail } from "./types.ts";

function verifyLogin(input: EmailAndPassword) {
  return chainResult(async ({ password, user }) =>
    await verifyPassword(input.password, password)
      ? success({ email: input.email, user })
      : failure(Error("Invalid password."))
  )(selectPasswordAndUserByEmail(input.email));
}

async function ifSuccessfulLogin(
  { email, user }: UserAndEmail,
) {
  return {
    isSuccess: true,
    jwt: await createJwt(
      { email, user, exp: getNumericDate(120 * 60) },
    ),
  };
}

export async function login(input: unknown) {
  return await foldResult(ifSuccessfulLogin)(ifFailed)(
    await chainResult(verifyLogin)(validateLoginInput(input)),
  );
}

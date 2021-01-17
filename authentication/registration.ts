import {
  chainResult,
  foldIfSuccessElseThrow,
  getNumericDate,
} from "../deps.ts";
import { validateRegisterInput } from "../validation/mod.ts";
import { sendEmail } from "../smtp/mod.ts";
import { createHash, createJwt } from "../crypto/mod.ts";
import {
  failOnEmailUnavailability,
  failOnUserUnavailability,
} from "../database/mod.ts";
import type { UserAndEmail, UserAndEmailAndPassword } from "./types.ts";

async function sendJwt(input: UserAndEmailAndPassword) {
  return await sendEmail({
    ...input,
    jwt: await createJwt(
      {
        hash: await createHash(input.password),
        user: input.user,
        email: input.email,
        exp: getNumericDate(120 * 60),
      },
    ),
  });
}

export async function register(input: unknown) {
  return foldIfSuccessElseThrow((input: UserAndEmail) => input)(
    await chainResult(sendJwt)(
      chainResult(failOnUserUnavailability)(
        chainResult(failOnEmailUnavailability)(
          await validateRegisterInput(input),
        ),
      ),
    ),
  );
}

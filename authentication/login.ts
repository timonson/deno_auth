import {
  chainResult,
  failure,
  foldIfSuccessElseThrow,
  getNumericDate,
  ServerRequest,
  success,
} from "../deps.ts";
import { authenticate } from "./authentication.ts";
import { validateLoginInput } from "../validation/mod.ts";
import { createJwt, Payload, verifyPassword } from "../crypto/mod.ts";
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
  return await foldIfSuccessElseThrow(ifSuccessfulLogin)(
    await chainResult(verifyLogin)(validateLoginInput(input)),
  );
}

export async function loginAuto({ req }: { req: ServerRequest }) {
  return await foldIfSuccessElseThrow(async (payload: Payload) => ({
    isSuccess: true,
    html: await Deno.readTextFile("./static/private/index.html"),
    email: payload.email,
    user: payload.user,
  }))((await authenticate({ req })));
}

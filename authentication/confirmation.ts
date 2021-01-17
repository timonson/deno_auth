import {
  chainResult,
  failure,
  foldIfSuccessElseThrow,
  getNumericDate,
  Result,
  ServerRequest,
  success,
} from "../deps.ts";
import { createJwt, Payload } from "../crypto/mod.ts";
import { authenticate } from "./authentication.ts";
import { insertIntoAccount } from "../database/mod.ts";
import type { UserAndEmailAndPassword } from "./types.ts";

function checkIfRegistrable(
  payload: Payload,
): Result<UserAndEmailAndPassword, Error> {
  if (typeof payload.hash === "string") {
    return success(
      { user: payload.user, email: payload.email, password: payload.hash },
    );
  } else {
    return failure(Error("This jwt is not suited for registration."));
  }
}

export async function confirmRegistration({ req }: { req: ServerRequest }) {
  return await foldIfSuccessElseThrow(async (
    input: UserAndEmailAndPassword,
  ) => (
    {
      isSuccess: true,
      jwt: await createJwt({ ...input, exp: getNumericDate(12000 * 60) }),
    }
  ))(
    chainResult(insertIntoAccount)(
      chainResult(checkIfRegistrable)(
        await authenticate({ req }),
      ),
    ),
  );
}

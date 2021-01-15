import {
  authenticate,
  confirmRegistration,
  login,
  register,
} from "./authentication/mod.ts";
import { Payload } from "./crypto/mod.ts";
import { foldResult, ifFailed, ServerRequest } from "./deps.ts";

async function loginAuto({ req }: { req: ServerRequest }) {
  return await foldResult(async (payload: Payload) => ({
    isSuccess: true,
    html: await Deno.readTextFile("./static/private/index.html"),
    email: payload.email,
    user: payload.user,
  }))(
    ifFailed,
  )((await authenticate({ req })));
}

export const rpcMethods = { register, loginAuto, login, confirmRegistration };

import { Payload, verifyJwt } from "../crypto/mod.ts";
import { failure, Result, ServerRequest } from "../deps.ts";

export async function authenticate(
  { req }: { req: ServerRequest },
): Promise<Result<Payload, Error>> {
  const authHeader = req.headers.get("Authorization");
  if (
    authHeader && authHeader.startsWith("Bearer ") &&
    authHeader.length > 7
  ) {
    return await verifyJwt(authHeader.slice(7));
  } else {
    return failure(Error("The request has no valid 'Authorization' Header."));
  }
}

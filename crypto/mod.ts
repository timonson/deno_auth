import {
  bcrypt,
  convertUint8ArrayToHex,
  create,
  failure,
  Result,
  success,
  verify,
} from "../deps.ts";
import { isString } from "../validation/mod.ts";

export type Payload = {
  email: string;
  user: string;
  hash?: string;
  exp?: number;
};

const keys = {
  jwt: convertUint8ArrayToHex(crypto.getRandomValues(new Uint8Array(64))),
};
const algorithms = { jwt: "HS256" as const };

export async function createJwt(payload: Payload) {
  return await create(
    { alg: "HS256", typ: "JWT" },
    payload,
    keys.jwt,
  );
}

function isPayload(payload: Record<string, unknown>): payload is Payload {
  return isString(payload.email) &&
    isString(payload.user) &&
    ("hash" in payload ? isString(payload.hash) : true);
}

export async function verifyJwt(jwt: string): Promise<Result<Payload, Error>> {
  try {
    const payload = await verify(
      jwt,
      keys.jwt,
      algorithms.jwt,
    );
    if (isPayload(payload)) return success(payload);
    else throw Error("The JWT payload has no user or email properties.");
  } catch (err) {
    return failure(err);
  }
}

export async function createHash(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(8);
  return await bcrypt.hash(password, salt);
}

export async function verifyPassword(
  passwordToTest: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(passwordToTest, hashedPassword);
}

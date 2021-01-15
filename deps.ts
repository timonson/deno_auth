export { serve } from "https://deno.land/std@0.82.0/http/server.ts";
export { respond } from "https://deno.land/x/gentle_rpc@v2.1/mod.ts";
export { fetch } from "https://cdn.jsdelivr.net/gh/timonson/salad@v0.1.0/fetch/fetchPolyfill.ts";
export {
  createStaticFilePath,
  importMetaResolve,
} from "https://cdn.jsdelivr.net/gh/timonson/salad@v0.1.0/pathsAndUrls.ts";
export {
  create,
  getNumericDate,
  verify,
} from "https://deno.land/x/djwt@v2.0/mod.ts";
export {
  encodeToString as convertUint8ArrayToHex,
} from "https://deno.land/std@0.83.0/encoding/hex.ts";
export { create as createHash } from "https://deno.land/x/djwt@v2.0/signature.ts";
export { DB } from "https://deno.land/x/sqlite@v2.3.2/mod.ts";
export {
  chainResult,
  failure,
  foldResult,
  isSuccess,
  mapResult,
  success,
} from "https://cdn.jsdelivr.net/gh/timonson/salad@ec9ea818b10f770ba112a5c9ad3a1b4c23eb8ece/fp/result.ts";
export * as bcrypt from "https://deno.land/x/bcrypt@v0.2.4/mod.ts";
export { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

export type {
  ConnectConfigWithAuthentication,
  SendConfig,
} from "https://deno.land/x/smtp@v0.7.0/mod.ts";
export type { ServerRequest } from "https://deno.land/std@0.82.0/http/server.ts";
export type { Payload } from "https://deno.land/x/djwt@v2.0/mod.ts";
export type {
  Failure,
  Result,
  Success,
} from "https://cdn.jsdelivr.net/gh/timonson/salad@ec9ea818b10f770ba112a5c9ad3a1b4c23eb8ece/fp/result.ts";

export function ifFailed(
  err: Error,
): never {
  throw err;
}

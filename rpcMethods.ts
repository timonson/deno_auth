import {
  authenticate,
  confirmRegistration,
  login,
  loginAuto,
  register,
} from "./authentication/mod.ts";

export const rpcMethods = { register, loginAuto, login, confirmRegistration };

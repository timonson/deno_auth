import {
  ConnectConfigWithAuthentication,
  failure,
  Result,
  SendConfig,
  SmtpClient,
  success,
} from "../deps.ts";
import {
  EmailAndPassword,
  UserAndEmail,
  UserAndEmailAndPassword,
} from "../authentication/types.ts";

type UserAndEmailAndJwt = UserAndEmail & { jwt: string };

const client = new SmtpClient({
  content_encoding: "quoted-printable", // 7bit, 8bit, base64, binary, quoted-printable
});

// Enter strings!
const connectConfig = {
  hostname: ,
  port: 465,
  username: ,
  password: ,
};

// Enter string!
const partialSendConfig = {
  from: ,
  subject: "Account Confirmation",
  url: "http://0.0.0.0:8000/confirmation/",
};

function setSendConfigPartially(
  partialSendConfig: { from: string; subject: string; url: string },
) {
  return ({ email, user, jwt }: UserAndEmailAndJwt) => {
    return {
      from: partialSendConfig.from,
      to: email,
      subject: partialSendConfig.subject,
      content: `<html><b>Hello ${user}!</b>
        <p>Please confirm your account by clicking on this <a href="${partialSendConfig.url}${jwt}">link</a>.</p></html>`,
    };
  };
}

export function send(config: ConnectConfigWithAuthentication) {
  return async (sendConfig: SendConfig) => {
    await client.connectTLS(config);
    await client.send(sendConfig);
    await client.close();
  };
}

const setSendConfig = setSendConfigPartially(partialSendConfig);
const sendApplied = send(connectConfig);

export async function sendEmail(
  { user, email, jwt }: UserAndEmailAndJwt,
): Promise<Result<UserAndEmail, Error>> {
  try {
    await sendApplied(setSendConfig({ user, email, jwt }));
    return success({ user, email });
  } catch (err) {
    return failure(err);
  }
}

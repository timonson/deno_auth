# deno_auth

Authentication based on Json Web Tokens (JWT) and SMTP in deno.

## How it works

You need your SMTP server hostname, username and password.

First, add the missing property values to the config objects `connectConfig` and
`partialSendConfig` in `./smtp/mod.ts`.

Then, run `deno run -A --unstable server.ts` and the HTTP server starts
listening on `http://0.0.0.0:8000/`.

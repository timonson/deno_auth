import { rpcMethods } from "./rpcMethods.ts";
import {
  createStaticFilePath,
  fetch,
  getErrorPage,
  importMetaResolve,
  respond as respondRpc,
  serve,
} from "./deps.ts";

const proto = "http";
const addr = "0.0.0.0:8000";
const root = "static/public";
const { files, diagnostics } = await Deno.emit(
  "./webComponents/components.ts",
  {
    bundle: "esm",
    // check: false,
    compilerOptions: {
      lib: ["esnext", "es2017", "dom", "dom.iterable", "deno.ns"],
    },
  },
);
if (diagnostics.length) {
  // there is something that impacted the emit
  console.warn(Deno.formatDiagnostics(diagnostics));
} else {
  await Deno.writeFile(
    "./static/public/scripts/components.js",
    new TextEncoder().encode(files["deno:///bundle.js"]),
  );
}

console.log(`${proto.toUpperCase()} server listening on ${proto}://${addr}/`);

for await (const req of serve(addr)) {
  switch (req.method) {
    case "GET":
      if (req.url.startsWith("/confirmation")) req.url = "/confirmation.html";
      const result = await fetch(
        createStaticFilePath(
          { moduleUrl: import.meta.url, reqUrl: req.url, root },
        ),
      );
      req.respond(
        {
          body: result.ok
            ? new Uint8Array(await result.arrayBuffer())
            : getErrorPage(result.status, await result.text()),
          headers: result.headers,
          status: result.status,
        },
      ).catch((err) => console.log(err));
      break;
    case "POST":
      respondRpc(
        req,
        rpcMethods,
        {
          argument: { req },
          allMethods: true,
          publicErrorStack: true,
        },
      );
      break;
    default:
      req.respond({ status: 405 });
  }
}

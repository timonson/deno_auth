import { basename, parse, resolve } from "https://deno.land/std/path/mod.ts";
import * as Colors from "https://deno.land/std/fmt/colors.ts";

async function mkdirAndWrite(
  pathOrUrlObj: string | URL,
  data: Uint8Array | string,
): Promise<Uint8Array | string> {
  const path = pathOrUrlObj instanceof URL
    ? pathOrUrlObj.pathname
    : pathOrUrlObj;
  if (typeof path !== "string") throw TypeError("path is not a string");
  return await Deno.lstat(path)
    .catch(() =>
      Deno.mkdir(path.match(/.*\//)?.[0].slice(0, -1) || ".", {
        recursive: true,
      })
    )
    .then(() => {
      Deno.writeFile(
        path,
        typeof data === "string" ? new TextEncoder().encode(data) : data,
      );
      return data;
    });
}

async function runBundler(filePath: string, destDir: string) {
  const [diagnostics, emit] = await Deno.bundle(filePath, undefined, {
    lib: ["esnext", "es2017", "dom", "dom.iterable", "deno.ns"], // include "deno.ns" for deno namespace
    // target: "esnext",
    target: "es2015",
    module: "es2015",
    experimentalDecorators: true,
    sourceMap: true,
    // importsNotUsedAsValues: "preserve",
  });
  if (diagnostics) {
    return diagnostics
      .map(
        (d) =>
          `
        ${
            Colors.yellow(
              `${basename(d.fileName || "").trim()}:${d.start?.line! + 1}:${d
                .start?.character}-${d.end?.character}`,
            )
          } - ${Colors.red("error")} ${
            Colors.blue(`TS${d.code}`)
          }: ${d.messageText}

        ${Colors.bgWhite(Colors.black(`${d.start?.line! + 1}`))} ${d.sourceLine}
        `,
      )
      .forEach((m) => console.log(m));
  } else {
    return mkdirAndWrite(
      `${destDir}/${parse(filePath).name}.js`,
      new TextEncoder().encode(emit),
    );
  }
}

const lastArg = Deno.args.slice(-1)[0];
if (!(await Deno.stat(lastArg)).isDirectory) {
  throw Error("last arg must be a directory");
}

Deno.args.slice(0, -1).map((srcFile) => runBundler(srcFile, lastArg));

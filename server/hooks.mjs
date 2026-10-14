import { registerHooks, stripTypeScriptTypes } from "node:module";
import { readFileSync } from "node:fs";
registerHooks({
  resolve(specifier, ctx, next) {
    if (specifier.startsWith("npm:@base44/sdk"))
      return {
        url: new URL("./sdk.mjs", import.meta.url).href,
        shortCircuit: true,
      };
    return next(specifier, ctx);
  },
  load(url, ctx, next) {
    if (url.endsWith(".ts") && url.includes("/base44/")) {
      let source = readFileSync(new URL(url), "utf8");
      if (source.includes("Deno.serve("))
        source = source.replace("Deno.serve(", "export default (");
      return {
        format: "module",
        source: stripTypeScriptTypes(source),
        shortCircuit: true,
      };
    }
    return next(url, ctx);
  },
});

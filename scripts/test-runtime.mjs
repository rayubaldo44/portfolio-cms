// Node's focused checks render components without Next.js's CSS-module loader.
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, next) {
    return next(specifier === "server-only" ? "next/dist/compiled/server-only/empty.js" : specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith(".module.css")) {
      return {
        format: "commonjs",
        source: "module.exports = new Proxy({}, { get: (_, key) => key === '__esModule' ? false : String(key) });",
        shortCircuit: true,
      };
    }
    return next(url, context);
  },
});

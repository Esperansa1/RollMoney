// build.js
const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["index.js"],
  bundle: true,
  outfile: "dist/index.bundle.js",
  format: "iife",
  globalName: "RollMoney",
  sourcemap: false,
  minify: false,
  target: ["es2020"]
}).catch(() => process.exit(1));

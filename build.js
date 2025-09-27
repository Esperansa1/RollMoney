// build.js
const esbuild = require("esbuild");
const fs = require("fs");
const crypto = require("crypto");

// First build the bundle
esbuild.build({
  entryPoints: ["index.js"],
  bundle: true,
  outfile: "dist/index.bundle.js",
  format: "iife",
  globalName: "RollMoney",
  sourcemap: false,
  minify: false,
  target: ["es2020"]
}).then(() => {
  // After build, generate hash and inject version
  const bundleContent = fs.readFileSync("dist/index.bundle.js", "utf8");
  const hash = crypto.createHash("sha256").update(bundleContent).digest("hex").substring(0, 8);

  // Inject version hash into the bundle
  const versionedBundle = bundleContent.replace(
    /var RollMoney = \(\(\) => \{/,
    `var RollMoney = (() => {\n  window.ROLLMONEY_VERSION = "${hash}";`
  );

  fs.writeFileSync("dist/index.bundle.js", versionedBundle);
  console.log(`Build complete. Version hash: ${hash}`);
}).catch(() => process.exit(1));

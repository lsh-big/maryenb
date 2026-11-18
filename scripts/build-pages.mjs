import { cp, mkdir, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stage = path.join(root, ".pages-build");
const output = path.join(root, "out");
const repository = (process.env.GITHUB_REPOSITORY || "lsh-big/maryenb").split("/")[1];
const base = process.env.PAGES_BASE_PATH ?? (repository.endsWith(".github.io") ? "" : `/${repository}`);
if (base && !/^\/[a-zA-Z0-9._-]+$/.test(base)) throw new Error("Invalid Pages base path");
// Only disposable generated directories directly under this checkout may be removed.
for (const directory of [stage, output]) {
  if (path.dirname(directory) !== root || ![".pages-build", "out"].includes(path.basename(directory))) throw new Error("Unsafe build directory");
  await rm(directory, { recursive: true, force: true });
}
await mkdir(stage, { recursive: true });
await cp(path.join(root, "src"), path.join(stage, "src"), { recursive: true });
await cp(path.join(root, "public"), path.join(stage, "public"), { recursive: true });
await cp(path.join(root, "package.json"), path.join(stage, "package.json"));
await symlink(path.join(root, "node_modules"), path.join(stage, "node_modules"), process.platform === "win32" ? "junction" : "dir");
await rm(path.join(stage, "src/app/api"), { recursive: true, force: true });
await writeFile(path.join(stage, "next.config.js"), `module.exports = { output: "export", trailingSlash: true, basePath: ${JSON.stringify(base)}, images: { unoptimized: true } };\n`);
await writeFile(path.join(stage, "src/lib/database-mode.js"), "export function isVirtualDatabase() { return true; }\n");
await writeFile(path.join(stage, "src/lib/virtual-db.js"), 'import catalog from "../data/products.json";\nexport async function getVirtualProducts() { return catalog.map(p => ({ ...p, id: p.slug })); }\n');
async function prepare(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) { await prepare(filename); continue; }
    if (!/\.(js|json|css)$/.test(entry.name)) continue;
    let source = await readFile(filename, "utf8");
    source = source.replaceAll('"force-dynamic"', '"force-static"');
    // Public assets need the repository prefix; Next Link prefixes routes itself.
    source = source.replace(/(["'`])\/(images|videos)\//g, `$1${base}/$2/`);
    if (filename === path.join(stage, "src/app/products/[slug]/page.js")) {
      source += '\nexport function generateStaticParams() { return catalog.map(({ slug }) => ({ slug })); }\n';
    }
    await writeFile(filename, source);
  }
}
await prepare(path.join(stage, "src"));
await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "build"], {
    cwd: stage, stdio: "inherit", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", NEXT_PUBLIC_PAGES_DEMO: "true", NEXT_PUBLIC_BASE_PATH: base, DB_MODE: "virtual" },
  });
  child.on("error", reject);
  child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Pages build failed: ${code}`)));
});
await cp(path.join(stage, "out"), output, { recursive: true });
await writeFile(path.join(output, ".nojekyll"), "");
console.log(`GitHub Pages artifact: ${output}; base path: ${base || "/"}`);

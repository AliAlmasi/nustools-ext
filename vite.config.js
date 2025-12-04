import path from "path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const rootPath = (address = "") =>
  address.trim() !== "" ? path.resolve(__dirname, address.trim()) : __dirname;

export default defineConfig(({ mode }) => {
  const isMv3 = mode === "mv3";
  console.log(
    isMv3
      ? ">> Building manifest version 3 in /dist/mv3"
      : ">> Building manifest version 2 in /dist/mv2"
  );

  console.log();

  const manifestFile = isMv3
    ? "public/manifest.v3.json"
    : "public/manifest.v2.json";

  const outDir = isMv3 ? "dist/mv3" : "dist/mv2";

  return {
    publicDir: false,
    plugins: [
      viteStaticCopy({
        targets: [
          { src: manifestFile, dest: ".", rename: "manifest.json" },
          { src: "public/icons", dest: "." },
          { src: "README.md", dest: "." },
          { src: "src/main.js", dest: "." },
          { src: "src/page_inject.js", dest: "." },
        ],
      }),
    ],
    build: {
      outDir,
      rollupOptions: {
        input: {
          background: rootPath("src/background.js"),
          content: rootPath("src/content.js"),
        },
        output: {
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === "background") return "background.js";
            if (chunkInfo.name === "content") return "content.js";
            return "assets/[name]-[hash].js";
          },
        },
      },
    },
  };
});

import path from "path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const rootPath = (address = "") =>
  address.trim() !== "" ? path.resolve(__dirname, address.trim()) : __dirname;

export default defineConfig(({ mode }) => {
  const isMv3 = mode === "mv3";

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

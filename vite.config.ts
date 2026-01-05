import path from "path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

/**
 * This option is used to enable or disable the minify option during build.
 *
 * Enabled by default. If disabled, the output code (in subfolders of the dist folder) will be written in the same way as the code in the src folder.
 */
const minify = true;

/**
 *
 * @param address Specifies the relative address of a file
 * @returns Absolute address of the file
 */
const rootPath = (address = ""): string =>
  address.trim() !== "" ? path.resolve(__dirname, address.trim()) : __dirname;

export default defineConfig(({ mode }) => {
  /**
   * Determines the selected build mode.
   *
   * Value `true` if build mode is `"mv2"`, false if otherwise.
   */
  const isMv2: boolean = mode === "mv2";

  /**
   * Decides which manifest file to use based on the selected build mode. Used for static copy.
   */
  const manifestFile: string = isMv2
    ? "public/manifest.v2.json"
    : "public/manifest.v3.json";

  /**
   * Sets the output folder address based on the selected mode
   */
  const outDir = isMv2 ? "dist/mv2" : "dist/mv3";

  return {
    publicDir: false,
    plugins: [
      viteStaticCopy({
        targets: [
          { src: manifestFile, dest: ".", rename: "manifest.json" },
          { src: "public/icons", dest: "." },
          { src: "public/popup", dest: "." },
          { src: "README.md", dest: "." },
        ],
      }),
    ],
    build: {
      minify,
      outDir,
      rollupOptions: {
        input: {
          background: rootPath("src/background.ts"),
          content: rootPath("src/content.ts"),
          main: rootPath("src/main.ts"),
          page_inject: rootPath("src/page_inject.js"),
        },
        output: {
          entryFileNames: "[name].js",
        },
      },
    },
  };
});

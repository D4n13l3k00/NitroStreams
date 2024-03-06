import { defineConfig } from "vite";
import fs from "fs";
import path from "path";
import { viteSingleFile } from "vite-plugin-singlefile";
const pluginConfig = require("./plugin.config.json");

function copyToPlugins() {
  return {
    name: "copy-to-plugins",
    closeBundle() {
      const userConfig = (() => {
        if (process.platform === "win32") return process.env.APPDATA;
        if (process.platform === "darwin")
          return path.join(process.env.HOME, "Library", "Application Support");
        if (process.env.XDG_CONFIG_HOME) return process.env.XDG_CONFIG_HOME;
        return path.join(process.env.HOME, "Library", ".config");
      })();
      const bdFolder = path.join(userConfig, "BetterDiscord");
      const distFolder = path.join(__dirname, "dist");
      fs.readdir(distFolder, (err, files) => {
        if (err) {
          console.error(err);
          return;
        }
        files.forEach((file) => {
          const outputPath = path.join(bdFolder, "plugins", file);
          fs.copyFileSync(path.join(distFolder, file), outputPath);
          console.log(`Copied ${file} to ${outputPath}`);
        });
      });
    },
  };
}

const meta = () => {
  let meta = "/**!\n";
  for (const key in pluginConfig) {
    meta += ` * @${key} ${pluginConfig[key]}\n`;
  }

  return meta + " */\n";
};

export default defineConfig(({ command, mode }) => {

  let plugins = [viteSingleFile()];

  if (mode === "development") {
    plugins.push(copyToPlugins());
  }

  return {
    esbuild: {
      jsxFactory: "BdApi.React.createElement",
      jsxFragment: "BdApi.React.Fragment",
      banner: meta(),
    },
    target: "esnext",
    build: {
      outDir: "dist",
      emptyOutDir: true,
      lib: {
        entry: "src/NitroStreams.jsx",
        formats: ["cjs"],
      },
      rollupOptions: {
        output: {
          entryFileNames: `[name].plugin.js`,
          chunkFileNames: `[name].js`,
        },
      },
    },
    plugins: plugins,
  }
});

import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const packageJson = JSON.parse(
  await readFile(new URL("./package.json", import.meta.url), "utf8"),
);
const pluginConfig = JSON.parse(
  await readFile(new URL("./plugin.config.json", import.meta.url), "utf8"),
);
const outputFileName = `${pluginConfig.name}.plugin.js`;

function createMetadataBanner() {
  const metadata = {
    name: pluginConfig.name,
    version: packageJson.version,
    description: packageJson.description,
    author: pluginConfig.author,
    website: pluginConfig.website,
    source: pluginConfig.source,
  };
  const rows = Object.entries(metadata)
    .filter(([, value]) => value)
    .map(([key, value]) => ` * @${key} ${value}`);

  return ["/**", ...rows, " */"].join("\n");
}

function getBetterDiscordPluginsDirectory() {
  const homeDirectory = process.env.USERPROFILE ?? process.env.HOME;
  let configDirectory;

  if (process.platform === "win32") {
    configDirectory = process.env.APPDATA;
  } else if (process.platform === "darwin") {
    configDirectory = homeDirectory
      ? path.join(homeDirectory, "Library", "Application Support")
      : null;
  } else {
    configDirectory =
      process.env.XDG_CONFIG_HOME ??
      (homeDirectory ? path.join(homeDirectory, ".config") : null);
  }

  if (!configDirectory) {
    throw new Error("Не удалось определить каталог конфигурации пользователя.");
  }

  return path.join(configDirectory, "BetterDiscord", "plugins");
}

function copyToBetterDiscord() {
  let outputDirectory = path.join(projectRoot, "dist");

  return {
    name: "copy-to-betterdiscord",
    apply: "build",
    configResolved(config) {
      outputDirectory = path.resolve(config.root, config.build.outDir);
    },
    async writeBundle() {
      const pluginsDirectory = getBetterDiscordPluginsDirectory();
      const source = path.join(outputDirectory, outputFileName);
      const destination = path.join(pluginsDirectory, outputFileName);

      await mkdir(pluginsDirectory, { recursive: true });
      await copyFile(source, destination);
      console.info(`Copied ${outputFileName} to ${destination}`);
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: mode === "development" ? [copyToBetterDiscord()] : [],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
    minify: mode === "production",
    lib: {
      entry: path.join(projectRoot, "src", "NitroStreams.js"),
      formats: ["cjs"],
      fileName: () => outputFileName,
    },
    rolldownOptions: {
      output: {
        codeSplitting: false,
        exports: "default",
        postBanner: createMetadataBanner(),
      },
    },
  },
}));

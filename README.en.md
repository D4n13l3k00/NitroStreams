<div align="center">

# 🍭 NitroStreams

[![CI](https://img.shields.io/github/actions/workflow/status/D4n13l3k00/NitroStreams/ci.yml?branch=master&style=flat&label=CI)](https://github.com/D4n13l3k00/NitroStreams/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/D4n13l3k00/NitroStreams?style=flat&label=Release)](https://github.com/D4n13l3k00/NitroStreams/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/D4n13l3k00/NitroStreams/total?style=flat&label=Downloads)](https://github.com/D4n13l3k00/NitroStreams/releases)
[![License: MIT](https://img.shields.io/github/license/D4n13l3k00/NitroStreams?style=flat&label=License)](LICENSE)
[![BetterDiscord](https://img.shields.io/badge/BetterDiscord-3E82E5?style=flat)](https://betterdiscord.app)

[Русский](README.md) · [English](README.en.md) · [Українська](README.uk.md) · [Беларуская](README.be.md) · [Polski](README.pl.md) · [Қазақша](README.kk.md)

A [BetterDiscord](https://betterdiscord.app) plugin that enables Nitro stream quality.

</div>

> [!WARNING]
> No Nitro subscription required. Viewer quality may still depend on Discord's limits.
>
> This plugin is provided for educational purposes. Use it at your own risk: your account may be restricted or banned. The author is not responsible for the consequences of its use.

## 📥 Installation

1. Download `NitroStreams.plugin.js` from the [latest release](https://github.com/D4n13l3k00/NitroStreams/releases/latest).
2. Move it into your BetterDiscord plugins folder and enable NitroStreams.

## ⚙️ Settings

Open NitroStreams settings from the BetterDiscord plugin list.

- **Check for updates** — check manually. If a new version is available, an **Install update** button appears.
- **What's new** — view the latest release notes.
- **Automatic updates** — enable or disable automatic updates. Checks run at startup and every 6 hours; a backup is saved before installation.
- **Plugin status** — see whether the permission patch is installed and has been used. This does not confirm viewer quality.
- **Show author credit** — show or hide the credit in the stream source picker.

♥ [Support the author on Boosty](https://boosty.to/d4n13l3k00/donate)

## 🛠️ Development

Requires [Bun](https://bun.sh) 1.3 or newer.

```shell
bun install
bun run check
```

`check` runs ESLint, tests, and a production build. Output: `dist/NitroStreams.plugin.js`.

`bun run dev` builds and copies the plugin to your local BetterDiscord installation. `bun run dev:watch` rebuilds on changes.

## 📄 License

[MIT](LICENSE)

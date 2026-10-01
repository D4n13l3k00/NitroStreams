<div align="center">

# 🍭 NitroStreams

[![CI](https://img.shields.io/github/actions/workflow/status/D4n13l3k00/NitroStreams/ci.yml?branch=master&style=flat&label=CI)](https://github.com/D4n13l3k00/NitroStreams/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/D4n13l3k00/NitroStreams?style=flat&label=Release)](https://github.com/D4n13l3k00/NitroStreams/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/D4n13l3k00/NitroStreams/total?style=flat&label=Downloads)](https://github.com/D4n13l3k00/NitroStreams/releases)
[![License: MIT](https://img.shields.io/github/license/D4n13l3k00/NitroStreams?style=flat&label=License)](LICENSE)
[![BetterDiscord](https://img.shields.io/badge/BetterDiscord-3E82E5?style=flat)](https://betterdiscord.app)

[Русский](README.md) · [English](README.en.md) · [Українська](README.uk.md) · [Беларуская](README.be.md) · [Polski](README.pl.md) · [Қазақша](README.kk.md)

</div>

Плагін для [BetterDiscord](https://betterdiscord.app), який вмикає якість трансляцій Nitro.

> [!WARNING]
> Підписка Nitro не потрібна. Якість трансляції для глядачів може залежати від обмежень Discord.
>
> Плагін надано з навчальною метою. Використовуйте на власний ризик: можливі обмеження або блокування облікового запису. Автор не несе відповідальності за наслідки використання.

## 📥 Встановлення

1. Завантажте `NitroStreams.plugin.js` з [останнього релізу](https://github.com/D4n13l3k00/NitroStreams/releases/latest).
2. Перемістіть файл у каталог плагінів BetterDiscord та увімкніть NitroStreams.

## 🛠️ Розробка

Потрібен [Bun](https://bun.sh) 1.3 або новіший.

```shell
bun install
bun run check
```

`check` запускає ESLint, тести та збірку для релізу. Результат: `dist/NitroStreams.plugin.js`.

`bun run dev` збирає та копіює плагін у локальний BetterDiscord; `bun run dev:watch` повторює збірку після змін.

## 📄 Ліцензія

[MIT](LICENSE)

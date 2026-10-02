<div align="center">

# 🍭 NitroStreams

[![CI](https://img.shields.io/github/actions/workflow/status/D4n13l3k00/NitroStreams/ci.yml?branch=master&style=flat&label=CI)](https://github.com/D4n13l3k00/NitroStreams/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/D4n13l3k00/NitroStreams?style=flat&label=Release)](https://github.com/D4n13l3k00/NitroStreams/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/D4n13l3k00/NitroStreams/total?style=flat&label=Downloads)](https://github.com/D4n13l3k00/NitroStreams/releases)
[![License: MIT](https://img.shields.io/github/license/D4n13l3k00/NitroStreams?style=flat&label=License)](LICENSE)
[![BetterDiscord](https://img.shields.io/badge/BetterDiscord-3E82E5?style=flat)](https://betterdiscord.app)

[Русский](README.md) · [English](README.en.md) · [Українська](README.uk.md) · [Беларуская](README.be.md) · [Polski](README.pl.md) · [Қазақша](README.kk.md)

Плагін для [BetterDiscord](https://betterdiscord.app), які ўключае якасць трансляцый Nitro.

</div>

> [!WARNING]
> Падпіска Nitro не патрэбная. Якасць трансляцыі для гледачоў можа залежаць ад абмежаванняў Discord.
>
> Плагін прызначаны для навучальных мэтаў. Выкарыстоўвайце на ўласную рызыку: магчымыя абмежаванні або блакіроўка ўліковага запісу. Аўтар не нясе адказнасці за наступствы выкарыстання.

## 📥 Усталяванне

1. Спампуйце `NitroStreams.plugin.js` з [апошняга рэлізу](https://github.com/D4n13l3k00/NitroStreams/releases/latest).
2. Перамясціце файл у каталог плагінаў BetterDiscord і ўключыце NitroStreams.

## ⚙️ Налады

Адкрыйце налады NitroStreams у спісе плагінаў BetterDiscord.

- **Check for updates** — праверыць абнаўленні ўручную. Калі ёсць новая версія, з’явіцца кнопка **Install update**.
- **What's new** — паглядзець апісанне апошняга рэлізу.
- **Automatic updates** — уключыць або выключыць аўтаабнаўленне. Праверка пры запуску і кожныя 6 гадзін; перад усталяваннем захоўваецца рэзервовая копія.
- **Plugin status** — праверыць, ці ўсталяваны перахоп і ці ён спрацоўваў. Статус не пацвярджае якасць для гледачоў.
- **Show author credit** — паказаць або схаваць подпіс у акне выбару крыніцы трансляцыі.

♥ [Падтрымаць аўтара на Boosty](https://boosty.to/d4n13l3k00/donate)

## 🛠️ Распрацоўка

Патрэбны [Bun](https://bun.sh) версіі 1.3 або навейшай.

```shell
bun install
bun run check
```

`check` запускае ESLint, тэсты і зборку для рэлізу. Вынік: `dist/NitroStreams.plugin.js`.

`bun run dev` збірае і капіруе плагін у лакальны BetterDiscord; `bun run dev:watch` паўтарае зборку пасля зменаў.

## 📄 Ліцэнзія

[MIT](LICENSE)

<div align="center">

# 🍭 NitroStreams

[![CI](https://img.shields.io/github/actions/workflow/status/D4n13l3k00/NitroStreams/ci.yml?branch=master&style=flat&label=CI)](https://github.com/D4n13l3k00/NitroStreams/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/D4n13l3k00/NitroStreams?style=flat&label=Release)](https://github.com/D4n13l3k00/NitroStreams/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/D4n13l3k00/NitroStreams/total?style=flat&label=Downloads)](https://github.com/D4n13l3k00/NitroStreams/releases)
[![License: MIT](https://img.shields.io/github/license/D4n13l3k00/NitroStreams?style=flat&label=License)](LICENSE)
[![BetterDiscord](https://img.shields.io/badge/BetterDiscord-3E82E5?style=flat)](https://betterdiscord.app)

[Русский](README.md) · [English](README.en.md) · [Українська](README.uk.md) · [Беларуская](README.be.md) · [Polski](README.pl.md) · [Қазақша](README.kk.md)

Плагін для [BetterDiscord](https://betterdiscord.app), який вмикає якість трансляцій Nitro.

</div>

> [!WARNING]
> Підписка Nitro не потрібна. Якість трансляції для глядачів може залежати від обмежень Discord.
>
> Плагін надано з навчальною метою. Використовуйте на власний ризик: можливі обмеження або блокування облікового запису. Автор не несе відповідальності за наслідки використання.

## 📥 Встановлення

1. Завантажте `NitroStreams.plugin.js` з [останнього релізу](https://github.com/D4n13l3k00/NitroStreams/releases/latest).
2. Перемістіть файл у каталог плагінів BetterDiscord та увімкніть NitroStreams.

## ⚙️ Налаштування

Відкрийте налаштування NitroStreams у списку плагінів BetterDiscord.

- **Check for updates** — перевірити оновлення вручну. Якщо є нова версія, з’явиться кнопка **Install update**.
- **What's new** — переглянути опис останнього релізу.
- **Automatic updates** — увімкнути або вимкнути автооновлення. Перевірка під час запуску та кожні 6 годин; перед встановленням зберігається резервна копія.
- **Plugin status** — перевірити, чи встановлено перехоплення та чи воно спрацьовувало. Статус не підтверджує якість для глядачів.
- **Show author credit** — показати або приховати підпис у вікні вибору джерела трансляції.

♥ [Підтримати автора на Boosty](https://boosty.to/d4n13l3k00/donate)

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

<div align="center">

# 🍭 NitroStreams

[![CI](https://img.shields.io/github/actions/workflow/status/D4n13l3k00/NitroStreams/ci.yml?branch=master&style=flat&label=CI)](https://github.com/D4n13l3k00/NitroStreams/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/D4n13l3k00/NitroStreams?style=flat&label=Release)](https://github.com/D4n13l3k00/NitroStreams/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/D4n13l3k00/NitroStreams/total?style=flat&label=Downloads)](https://github.com/D4n13l3k00/NitroStreams/releases)
[![License: MIT](https://img.shields.io/github/license/D4n13l3k00/NitroStreams?style=flat&label=License)](LICENSE)
[![BetterDiscord](https://img.shields.io/badge/BetterDiscord-3E82E5?style=flat)](https://betterdiscord.app)

[Русский](README.md) · [English](README.en.md) · [Українська](README.uk.md) · [Беларуская](README.be.md) · [Polski](README.pl.md) · [Қазақша](README.kk.md)

</div>

[BetterDiscord](https://betterdiscord.app) плагині. Трансляцияларда Nitro сапасын қосады.

> [!WARNING]
> Nitro жазылымы қажет емес. Көрермендердегі трансляция сапасы Discord шектеулеріне байланысты болуы мүмкін.
>
> Плагин оқу мақсатында ұсынылады. Оны өз тәуекеліңізбен пайдаланыңыз: аккаунтыңызға шектеу қойылуы немесе ол бұғатталуы мүмкін. Автор оны пайдаланудың салдары үшін жауап бермейді.

## 📥 Орнату

1. `NitroStreams.plugin.js` файлын [соңғы шығарылымнан](https://github.com/D4n13l3k00/NitroStreams/releases/latest) жүктеп алыңыз.
2. Файлды BetterDiscord плагиндер қалтасына көшіріп, NitroStreams плагинін қосыңыз.

## 🛠️ Әзірлеу

[Bun](https://bun.sh) 1.3 немесе одан кейінгі нұсқасы қажет.

```shell
bun install
bun run check
```

`check` ESLint пен тесттерді іске қосып, шығарылымға арналған нұсқаны құрастырады. Нәтижесі: `dist/NitroStreams.plugin.js`.

`bun run dev` плагинді құрастырып, жергілікті BetterDiscord қалтасына көшіреді; `bun run dev:watch` өзгерістерден кейін қайта құрастырады.

## 📄 Лицензия

[MIT](LICENSE)

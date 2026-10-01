<div align="center">

# 🍭 NitroStreams

[![CI](https://img.shields.io/github/actions/workflow/status/D4n13l3k00/NitroStreams/ci.yml?branch=master&style=flat&label=CI)](https://github.com/D4n13l3k00/NitroStreams/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/D4n13l3k00/NitroStreams?style=flat&label=Release)](https://github.com/D4n13l3k00/NitroStreams/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/D4n13l3k00/NitroStreams/total?style=flat&label=Downloads)](https://github.com/D4n13l3k00/NitroStreams/releases)
[![License: MIT](https://img.shields.io/github/license/D4n13l3k00/NitroStreams?style=flat&label=License)](LICENSE)
[![BetterDiscord](https://img.shields.io/badge/BetterDiscord-3E82E5?style=flat)](https://betterdiscord.app)

[Русский](README.md) · [English](README.en.md) · [Українська](README.uk.md) · [Беларуская](README.be.md) · [Polski](README.pl.md) · [Қазақша](README.kk.md)

</div>

Wtyczka do [BetterDiscord](https://betterdiscord.app), która odblokowuje jakość transmisji Nitro.

> [!WARNING]
> Subskrypcja Nitro nie jest wymagana. Jakość transmisji u widzów może zależeć od ograniczeń Discorda.
>
> Wtyczka jest udostępniana w celach edukacyjnych. Korzystasz z niej na własne ryzyko: konto może zostać objęte ograniczeniami lub zablokowane. Autor nie ponosi odpowiedzialności za skutki jej używania.

## 📥 Instalacja

1. Pobierz `NitroStreams.plugin.js` z [najnowszego wydania](https://github.com/D4n13l3k00/NitroStreams/releases/latest).
2. Przenieś plik do folderu wtyczek BetterDiscord i włącz NitroStreams.

## 🛠️ Rozwój

Wymagany jest [Bun](https://bun.sh) w wersji 1.3 lub nowszej.

```shell
bun install
bun run check
```

`check` uruchamia ESLint, testy i kompilację wersji produkcyjnej. Plik wynikowy: `dist/NitroStreams.plugin.js`.

`bun run dev` kompiluje i kopiuje wtyczkę do lokalnej instalacji BetterDiscord; `bun run dev:watch` ponawia kompilację po zmianach.

## 📄 Licencja

[MIT](LICENSE)

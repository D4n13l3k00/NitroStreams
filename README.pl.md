<div align="center">

# 🍭 NitroStreams

[![CI](https://img.shields.io/github/actions/workflow/status/D4n13l3k00/NitroStreams/ci.yml?branch=master&style=flat&label=CI)](https://github.com/D4n13l3k00/NitroStreams/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/D4n13l3k00/NitroStreams?style=flat&label=Release)](https://github.com/D4n13l3k00/NitroStreams/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/D4n13l3k00/NitroStreams/total?style=flat&label=Downloads)](https://github.com/D4n13l3k00/NitroStreams/releases)
[![License: MIT](https://img.shields.io/github/license/D4n13l3k00/NitroStreams?style=flat&label=License)](LICENSE)
[![BetterDiscord](https://img.shields.io/badge/BetterDiscord-3E82E5?style=flat)](https://betterdiscord.app)

[Русский](README.md) · [English](README.en.md) · [Українська](README.uk.md) · [Беларуская](README.be.md) · [Polski](README.pl.md) · [Қазақша](README.kk.md)

Wtyczka do [BetterDiscord](https://betterdiscord.app), która odblokowuje jakość transmisji Nitro.

</div>

> [!WARNING]
> Subskrypcja Nitro nie jest wymagana. Jakość transmisji u widzów może zależeć od ograniczeń Discorda.
>
> Wtyczka jest udostępniana w celach edukacyjnych. Korzystasz z niej na własne ryzyko: konto może zostać objęte ograniczeniami lub zablokowane. Autor nie ponosi odpowiedzialności za skutki jej używania.

## 📥 Instalacja

1. Pobierz `NitroStreams.plugin.js` z [najnowszego wydania](https://github.com/D4n13l3k00/NitroStreams/releases/latest).
2. Przenieś plik do folderu wtyczek BetterDiscord i włącz NitroStreams.

## ⚙️ Ustawienia

Otwórz ustawienia NitroStreams na liście wtyczek BetterDiscord.

- **Check for updates** — sprawdź aktualizacje ręcznie. Gdy dostępna jest nowa wersja, pojawi się przycisk **Install update**.
- **What's new** — zobacz opis najnowszego wydania.
- **Automatic updates** — włącz lub wyłącz automatyczne aktualizacje. Sprawdzanie odbywa się przy uruchomieniu i co 6 godzin; przed instalacją zapisywana jest kopia zapasowa.
- **Plugin status** — sprawdź, czy modyfikacja kontroli uprawnień jest aktywna i czy została użyta. Status nie potwierdza jakości u widzów.
- **Show author credit** — pokaż lub ukryj podpis autora w oknie wyboru źródła transmisji.

♥ [Wesprzyj autora na Boosty](https://boosty.to/d4n13l3k00/donate)

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

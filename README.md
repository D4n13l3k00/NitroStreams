<div align="center">

# 🍭 NitroStreams

[![CI](https://img.shields.io/github/actions/workflow/status/D4n13l3k00/NitroStreams/ci.yml?branch=master&style=flat&label=CI)](https://github.com/D4n13l3k00/NitroStreams/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/D4n13l3k00/NitroStreams?style=flat&label=Release)](https://github.com/D4n13l3k00/NitroStreams/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/D4n13l3k00/NitroStreams/total?style=flat&label=Downloads)](https://github.com/D4n13l3k00/NitroStreams/releases)
[![License: MIT](https://img.shields.io/github/license/D4n13l3k00/NitroStreams?style=flat&label=License)](LICENSE)
[![BetterDiscord](https://img.shields.io/badge/BetterDiscord-3E82E5?style=flat)](https://betterdiscord.app)

[Русский](README.md) · [English](README.en.md) · [Українська](README.uk.md) · [Беларуская](README.be.md) · [Polski](README.pl.md) · [Қазақша](README.kk.md)

Плагин для [BetterDiscord](https://betterdiscord.app), который включает Nitro-качество стримов.

</div>

> [!WARNING]
> Подписка Nitro не нужна. Фактическое качество у зрителей может зависеть от ограничений Discord.
>
> Плагин предоставлен в учебных целях. Используйте на свой риск: возможны ограничения или блокировка аккаунта. Автор не несёт ответственности за последствия использования.

## 📥 Установка

1. Скачайте `NitroStreams.plugin.js` из [последнего релиза](https://github.com/D4n13l3k00/NitroStreams/releases/latest).
2. Переместите файл в каталог плагинов BetterDiscord и включите NitroStreams.

## ⚙️ Настройки

Откройте настройки NitroStreams в списке плагинов BetterDiscord.

- **Check for updates** — проверить обновления вручную. Если есть новая версия, появится кнопка **Install update**.
- **What's new** — посмотреть описание последнего релиза.
- **Automatic updates** — включить или отключить автообновление. Проверка при запуске и каждые 6 часов; перед установкой сохраняется резервная копия.
- **Plugin status** — проверить, установлен ли перехват и срабатывал ли он. Статус не подтверждает качество у зрителей.
- **Show author credit** — показать или скрыть подпись в окне выбора источника трансляции.

♥ [Поддержать автора на Boosty](https://boosty.to/d4n13l3k00/donate)

## 🛠️ Разработка

Требуется [Bun](https://bun.sh) 1.3 или новее.

```shell
bun install
bun run check
```

`check` запускает ESLint, тесты и production-сборку. Результат: `dist/NitroStreams.plugin.js`.

`bun run dev` собирает и копирует плагин в локальный BetterDiscord; `bun run dev:watch` повторяет сборку при изменениях.

## 📄 Лицензия

[MIT](LICENSE)

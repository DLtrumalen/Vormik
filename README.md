# Vormik

**🌐 Сайт: [vormik.vercel.app](https://vormik.vercel.app)** · [English](https://vormik.vercel.app/en) · [Suomi](https://vormik.vercel.app/fi)

**▶ Тренажёр в браузере: [vormik.vercel.app/train](https://vormik.vercel.app/train)**

**⬇ Скачать для Windows: [Vormik-Setup.exe](https://github.com/DLtrumalen/Vormik/releases/latest/download/Vormik-Setup.exe)** ([все выпуски](https://github.com/DLtrumalen/Vormik/releases))

Тренажёр эстонских падежей. Приложение даёт слово и падеж, вы пишете правильную форму, а трудные формы повторяются чаще (интервальное повторение FSRS). Интерфейс и объяснения — на русском, английском и финском.

Проект состоит из трёх частей:

- **Сайт** (`/`, `/en`, `/fi`) — рассказывает о приложении и предлагает его установить.
- **Приложение** (`/train`) — сам тренажёр. Это PWA: его можно установить на телефон или компьютер, и оно работает без интернета. Прогресс хранится на устройстве, регистрация не нужна.
- **Приложение для Windows** (`desktop/`) — тренажёр в отдельном окне, с ярлыками на рабочем столе и в меню «Пуск». Сделано на Electron.

## Стек

Next.js, TypeScript, Tailwind CSS, ts-fsrs, Vitest, ESLint, Prettier, Electron.

## Запуск

Нужен Node.js 20 или новее.

```bash
npm install
npm run dev
```

Приложение откроется на http://localhost:3000. Service worker (офлайн-режим) включается только в продакшен-сборке: `npm run build && npm start`.

## Скрипты

| Команда                | Что делает                |
| ---------------------- | ------------------------- |
| `npm run dev`          | Сервер разработки         |
| `npm run build`        | Продакшен-сборка          |
| `npm start`            | Запуск продакшен-сборки   |
| `npm test`             | Тесты Vitest              |
| `npm run lint`         | Проверка ESLint           |
| `npm run typecheck`    | Проверка типов TypeScript |
| `npm run format`       | Форматирование Prettier   |
| `npm run format:check` | Проверка форматирования   |

## Словарь

Список слов с переводами лежит в `data/words.tsv`. Формы всех 14 падежей в обоих числах строит морфологический генератор [Vabamorf](https://github.com/Filosoft/vabamorf) (Filosoft, LGPL), результат сохраняется в `src/data/words.json`.

Чтобы добавить слова, допишите их в `data/words.tsv` и пересоберите словарь:

```bash
pip install estnltk
python scripts/generate_forms.py
```

## Приложение для Windows

```bash
cd desktop
npm install
npm start       # запустить
npm run dist    # собрать установщик desktop/dist/Vormik-Setup.exe
```

## Структура

```
src/
  app/            страницы: сайт (ru, en, fi), тренажёр, манифест, иконки
  components/     кнопка установки, экраны тренажёра, блоки сайта
  i18n/           тексты на русском, английском и финском
  lib/            падежи, проверка и разбор ответа, повторение, хранение прогресса
  data/           сгенерированный словарь форм
public/sw.js      service worker для офлайн-режима
scripts/          генерация словаря через Vabamorf
desktop/          приложение для Windows (Electron)
```

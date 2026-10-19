# Vormik

Тренажёр эстонских падежей для русскоязычных. Приложение даёт слово и падеж, вы пишете правильную форму, а трудные формы повторяются чаще (интервальное повторение).

## Стек

Next.js, TypeScript, Tailwind CSS, ESLint, Prettier.

## Запуск

Нужен Node.js 20 или новее.

```bash
npm install
npm run dev
```

Приложение откроется на http://localhost:3000.

## Скрипты

| Команда                | Что делает                |
| ---------------------- | ------------------------- |
| `npm run dev`          | Сервер разработки         |
| `npm run build`        | Продакшен-сборка          |
| `npm run lint`         | Проверка ESLint           |
| `npm run typecheck`    | Проверка типов TypeScript |
| `npm run format`       | Форматирование Prettier   |
| `npm run format:check` | Проверка форматирования   |

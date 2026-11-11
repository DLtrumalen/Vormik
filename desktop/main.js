// Настольное приложение Vormik: отдельное окно с тренажёром, а не вкладка браузера.
// Тренажёр загружается с сайта, поэтому обновляется сам; после первого запуска работает и офлайн
// (страницы кэширует service worker сайта).
const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");

const APP_URL = "https://vormik.vercel.app";
const START_URL = `${APP_URL}/train`;

// Только одно окно: повторный запуск выводит на передний план уже открытое.
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let win = null;

function isTrainerUrl(url) {
  try {
    const u = new URL(url);
    return u.origin === APP_URL && u.pathname.startsWith("/train");
  } catch {
    return false;
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 460,
    height: 860,
    minWidth: 360,
    minHeight: 560,
    title: "Vormik",
    icon: path.join(__dirname, "icon.png"),
    backgroundColor: "#0b1220",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Сайт по этой метке понимает, что открыт как приложение (скрывает ссылки на сайт и кнопку «Скачать»).
  win.webContents.setUserAgent(
    `${win.webContents.getUserAgent()} VormikDesktop/${app.getVersion()}`,
  );

  // Всё, что не тренажёр (сайт, внешние ссылки), открываем в обычном браузере.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (isTrainerUrl(url) || url.startsWith("file:")) return;
    event.preventDefault();
    shell.openExternal(url);
  });

  // Нет интернета при самом первом запуске — показываем экран с кнопкой «Повторить».
  win.webContents.on("did-fail-load", (_event, code, _desc, url, isMainFrame) => {
    if (!isMainFrame || code === -3) return; // -3: загрузка прервана намеренно
    win.loadFile(path.join(__dirname, "offline.html"), { query: { url: url || START_URL } });
  });

  win.once("ready-to-show", () => win.show());
  win.loadURL(START_URL);
}

app.on("second-instance", () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());

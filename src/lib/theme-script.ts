export const THEME_KEY = "vormik:theme";

/** Класс на <html>, пока выбрана светлая тема: с ним тренажёр светлый с первого кадра. */
export const LIGHT_CLASS = "vormik-light";

/**
 * Скрипт для страницы тренажёра: применяет сохранённую тему до первой отрисовки.
 * Без него страница сначала показывается тёмной и только после загрузки React становится светлой.
 */
export const THEME_SCRIPT = `try{var p=localStorage.getItem("${THEME_KEY}");if(p==="light"){document.documentElement.classList.add("${LIGHT_CLASS}");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#eef2f7")}}catch(e){}`;

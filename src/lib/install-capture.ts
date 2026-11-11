/**
 * Chrome присылает beforeinstallprompt один раз и рано — часто до того, как загрузится код приложения.
 * Этот скрипт встраивается прямо в <head> и выполняется первым: сохраняет событие для кнопки «Скачать».
 */
export const INSTALL_CAPTURE_SCRIPT = `(function(){
function n(){window.dispatchEvent(new Event("vormik:install"))}
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__vormikInstallPrompt=e;n()});
window.addEventListener("appinstalled",function(){window.__vormikInstallPrompt=null;window.__vormikInstalled=true;n()});
})();`;

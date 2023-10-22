
import { reloaderTabs, reloaderChangedMessage } from './constants.js';

let startPageReloading = function (reloaderSettings) {
  if (reloaderSettings.tabData.intervalId) {
    stopPageReloading(message);
  }
  let intervalId = setInterval(async () => {
    let elementInspectionNeeded = reloaderSettings.tabData.tagToInspect == null;
    let oldHtml = null;
    if (elementInspectionNeeded) {
      oldHtml = await chrome.scripting.executeScript({
        target: { tabId: reloaderSettings.tabData.tabId },
        function: () => {
          return document.querySelectorAll(reloaderSettings.tabData.tagToInspect);
        }
      });
    }
    await chrome.scripting.executeScript({
      target: { tabId: reloaderSettings.tabData.tabId },
      function: () => {
        location.reload();
      }
    });
    if (elementInspectionNeeded) {
      oldHtml = await chrome.scripting.executeScript({
        target: { tabId: reloaderSettings.tabData.tabId },
        function: () => {
          return document.querySelectorAll(reloaderSettings.tabData.tagToInspect);
        }
      });
    }
  }, reloaderSettings.tabData.secondsForReload * 1000);

  console.log("reload period created", reloaderSettings.tabData.tabId);
  return intervalId;
};

let stopPageReloading = function (reloaderSettings) {
  clearInterval(reloaderSettings.tabData.intervalId);
  console.log("reload period cleared", reloaderSettings.tabData.tabId);
};

chrome.runtime.onInstalled.addListener(async (reason) => {
  console.log("installed");
  let dataToSave = {};
  dataToSave[reloaderTabs] = {};
  await chrome.storage.session.set(dataToSave);
  console.log("init data saved")
  console.log(dataToSave)

});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 2. A page requested user data, respond with a copy of `user`
  if (message.type === reloaderChangedMessage) {
    let intervalId = null;
    if (message.isCreated) {
      intervalId = startPageReloading(message);
    } else {
      stopPageReloading(message);
    }
    sendResponse(intervalId);
  }
});
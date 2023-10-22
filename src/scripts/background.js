
import { reloaderTabs, reloaderChangedMessage, reloaderOldHtmls } from './constants.js';
let getTagHtmls = function (tag) {
  let content = document.querySelectorAll(tag);
  const innerHTMLs = Array.from(content).map((element) => element.innerHTML);
  return innerHTMLs;
}

let startPageReloading = function (reloaderSettings) {
  if (reloaderSettings.tabData.intervalId) {
    stopPageReloading(message);
  }
  let intervalId = setInterval(async () => {

    await chrome.scripting.executeScript({
      target: { tabId: reloaderSettings.tabData.tabId },
      function: () => {
        location.reload();
      }
    });
    let elementInspectionNeeded = reloaderSettings.tabData.tagToInspect != null;
    if (elementInspectionNeeded) {
      let alarm = false;
      let htmlData = await chrome.storage.session.get([reloaderOldHtmls]);
      let oldHtmlTexts = htmlData[reloaderOldHtmls][reloaderSettings.tabData.tabId]
      let newHtmlTexts = (await chrome.scripting.executeScript({
        target: { tabId: reloaderSettings.tabData.tabId },
        args: [reloaderSettings.tabData.tagToInspect],
        function: getTagHtmls
      }))[0].result;

      htmlData[reloaderOldHtmls][reloaderSettings.tabData.tabId] = newHtmlTexts;
      await chrome.storage.session.set(htmlData);
      if(!oldHtmlTexts){
        return;
      }
      if (oldHtmlTexts.length !== newHtmlTexts.length) {
        alarm = true;
      } else {
        for (let i = 0; i < oldHtmlTexts.length; i++) {
          if (oldHtmlTexts[i] !== newHtmlTexts[i]) {
            alarm = true;
            break;
          }
        }
      }
      if (alarm) {
        console.log("ALARM!!");
      }
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
  let reloaderTabsData = {};
  reloaderTabsData[reloaderTabs] = {};
  let reloaderOldHtmlData = {};
  reloaderOldHtmlData[reloaderOldHtmls] = {};
  await chrome.storage.session.set(reloaderTabsData);
  await chrome.storage.session.set(reloaderOldHtmlData);
  console.log("init data saved")
  console.log(reloaderTabsData)

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
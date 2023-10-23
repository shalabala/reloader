
import {
  reloaderTabs, reloaderChangedMessage, reloaderTabDefaults,
  createEmptyDatasetForSync,
  tabLoadPollPeriodInMilisecs
} from './common.js';

let getTagHtmls = function (tag) {
  let content = document.querySelectorAll(tag);
  const innerHTMLs = Array.from(content).map((element) => element.innerHTML);
  return innerHTMLs;
}

function delay(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

async function pollTabUntilLoaded(tabId) {
  let tab;
  do {
    tab = await chrome.tabs.get(tabId);
    await delay(tabLoadPollPeriodInMilisecs);
  } while (tab.status !== "complete");
}

async function getHtmlFromPage(tabId, tag) {
  let tags = await chrome.scripting.executeScript({
    target: { tabId },
    args: [tag],
    function: getTagHtmls
  });
  return tags[0].result;
}

let startPageReloading = function (reloaderSettings) {
  if (reloaderSettings.tabData.intervalId) {
    stopPageReloading(message);
  }
  
  let intervalId = setInterval(async () => {
    let oldHtmlTexts = null;
    let elementInspectionNeeded = reloaderSettings.tabData.tagToInspect != null;
    if (elementInspectionNeeded) {
      oldHtmlTexts = await getHtmlFromPage(reloaderSettings.tabData.tabId, reloaderSettings.tabData.tagToInspect);
    }

    await chrome.tabs.reload(reloaderSettings.tabData.tabId);
    await pollTabUntilLoaded(reloaderSettings.tabData.tabId);
    if (elementInspectionNeeded) {
      let alarm = false;
      let newHtmlTexts = await getHtmlFromPage(reloaderSettings.tabData.tabId, reloaderSettings.tabData.tagToInspect);
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
        if (reloaderSettings.tabData.isSoundOn) {
          await chrome.notifications.create(null, {
            type: 'basic',
            silent: false,
            iconUrl: '../images/48_red.png',
            title: 'Reloader site change',
            message: 'Inspected tag changed on site ' + reloaderSettings.tabData.title,
            priority: 2
          });
        }

        await chrome.action.setIcon({
          path: {
            "16": "../images/16_red.png",
            "32": "../images/32_red.png",
            "48": "../images/48_red.png",
            "128": "../images/128_red.png"
          }
        });
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
  createEmptyDatasetForSync(reloaderTabDefaults);
  console.log("init data saved")
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

chrome.tabs.onRemoved.addListener(
  async (tabId) => {
    let allTabData = await chrome.storage.session.get([reloaderTabs]);
    let currentTabData = allTabData[reloaderTabs][tabId];
    if (currentTabData) {
      if (currentTabData.intervalId) {
        clearInterval(currentTabData.intervalId);
      }

      allTabData[reloaderTabs][tabId] = undefined;
      await chrome.storage.session.set(allTabData);
    }
  }
);

import { reloaderTabs } from './constants.js';

chrome.runtime.onInstalled.addListener(async (reason) => {
  console.log("installed");
  let dataToSave={};
  dataToSave[reloaderTabs] = {};
  await chrome.storage.session.set(dataToSave);
  console.log("init data saved")
  console.log(dataToSave)

  // Create an alarm so we have something to look at in the demo
  await chrome.alarms.create('demo-default-alarm', {
    delayInMinutes: 1,
    periodInMinutes: 1
  });

});

chrome.action.onClicked.addListener(async (tab) => {
  console.log("clicked")
  // if (tab.url.startsWith(extensions) || tab.url.startsWith(webstore)) {
  //   // We retrieve the action badge to check if the extension is 'ON' or 'OFF'
  //   const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  //   // Next state will always be the opposite
  //   const nextState = prevState === 'ON' ? 'OFF' : 'ON';

  //   // Set the action badge to the next state
  //   await chrome.action.setBadgeText({
  //     tabId: tab.id,
  //     text: nextState
  //   });

  //   if (nextState === 'ON') {

  //   } else if (nextState === 'OFF') {
  //     // Remove the CSS file when the user turns the extension off
  //     await chrome.scripting.removeCSS({
  //       files: ['focus-mode.css'],
  //       target: { tabId: tab.id }
  //     });
  //   }
  // }
});
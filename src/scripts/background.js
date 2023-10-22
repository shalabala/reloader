
import { reloaderTabs, reloaderChangedMessage } from './constants.js';

chrome.runtime.onInstalled.addListener(async (reason) => {
  console.log("installed");
  let dataToSave={};
  dataToSave[reloaderTabs] = {};
  await chrome.storage.session.set(dataToSave);
  console.log("init data saved")
  console.log(dataToSave)

});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 2. A page requested user data, respond with a copy of `user`
  if (message.type === reloaderChangedMessage) {
    
  }
});
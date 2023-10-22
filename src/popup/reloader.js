import { reloaderTabs, defaultReloadTimeInSeconds, ReloaderData, ReloadingSettings } from '../scripts/constants.js'

document.addEventListener('DOMContentLoaded', async function () {
    console.log("visible" + new Date().getTime());

    let allTabData = await chrome.storage.session.get([reloaderTabs]);
    let currentTab = (await chrome.tabs.query({ active: true }))[0];
    console.log("current tab", currentTab)
    console.log(allTabData)
    console.log("tab id:" + currentTab.id)

    let currentTabData = allTabData[reloaderTabs][currentTab.id];

    let currentActiveReloads = Object.values(allTabData[reloaderTabs])
        .filter(e => e.isActive).length;

    if (!currentTabData) {
        currentTabData = new ReloaderData(currentTab.id,
            false,
            defaultReloadTimeInSeconds,
            null,
            false);
        //save infos about current tab
        allTabData[reloaderTabs][currentTab.id] = currentTabData;
        await chrome.storage.session.set(allTabData);
    }

    //the inputs we are working with
    const tabActivityCheckbox = document.getElementById('activeOnThisTab');
    const secondsForReloadField = document.getElementById('secondsForReload');
    const tagToInspectField = document.getElementById('tagToInspect');
    const isSoundOnCheckbox = document.getElementById('isSoundOn');

    //initialize inputs
    tabActivityCheckbox.checked = currentTabData.isActive;
    secondsForReloadField.value = currentTabData.secondsForReload;
    tagToInspectField.value = currentTabData.tagToInspect;
    isSoundOnCheckbox.checked = currentTabData.isSoundOn;

    //change icon if needed
    if (currentTabData.isAlarmOn) {
        //todo change icon back
    }
    let startPageReloading = async function () {
        currentTabData.intervalId = await chrome.runtime.sendMessage(new ReloadingSettings(currentTabData, true,  currentTabData.intervalId))
    };
    let stopPageReloading = async function () {
        currentTabData.intervalId = await chrome.runtime.sendMessage(new ReloadingSettings(currentTabData, false,  currentTabData.intervalId))
    };
    tabActivityCheckbox.addEventListener('change', async function () {
        console.log(`tab activity value changed: ${tabActivityCheckbox.checked}`);
        currentTabData.isActive = tabActivityCheckbox.checked;

        if (currentTabData.isActive) {
            await startPageReloading();
        } else {
            await stopPageReloading();
        }
        await chrome.storage.session.set(allTabData);
    });
    secondsForReloadField.addEventListener('input', async function () {
        console.log(`seconds for reload value changed: ${secondsForReloadField.value}`);
        currentTabData.secondsForReload = secondsForReloadField.value;
        if ( currentTabData.intervalId) {
            await stopPageReloading();
            await startPageReloading();
        }
        await chrome.storage.session.set(allTabData);
    });
    tagToInspectField.addEventListener('input', async function () {
        console.log(`tag to inspect value changed: ${tagToInspectField.value}`);
        currentTabData.tagToInspect = tagToInspectField.value;
        await chrome.storage.session.set(allTabData);
    });
    isSoundOnCheckbox.addEventListener('change', async function () {
        console.log(`is sound on value changed: ${isSoundOnCheckbox.value}`);
        currentTabData.isSoundOn = isSoundOnCheckbox.checked;
        await chrome.storage.session.set(allTabData);
    });
});
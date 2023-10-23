import {
    reloaderTabs, ReloadingSettings,
    reloaderTabDefaults, getBaseUrl, siteDefaults, createEmptyDatasetForSession, 
    toReloaderData, toPreconfig
} from '../scripts/common.js'

async function getAndSeedSessionDataIfNeeded(name) {
    let data = await chrome.storage.session.get([name]);
    if (data[name] == null) {
        console.log("session data seed");
        await createEmptyDatasetForSession(name);
        return await chrome.storage.session.get([name]);
    }
    
    console.log("sesson seed not needed, already found: ", data);
    return data;
}

document.addEventListener('DOMContentLoaded', async function () {
    console.log("visible" + new Date().getTime());

    let allTabData = await getAndSeedSessionDataIfNeeded(reloaderTabs);
    let allDefaults = await chrome.storage.sync.get([reloaderTabDefaults]);
    let currentTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
    let currentBaseUrl = getBaseUrl(currentTab.url);
    console.log("base url:", currentBaseUrl)

    let currentTabData = allTabData[reloaderTabs][currentTab.id];
    let currentTabDefault = allDefaults[reloaderTabDefaults][currentBaseUrl];
    if (!currentTabDefault) {
        currentTabDefault = siteDefaults[currentBaseUrl];
        console.log("no current tab default, reading from default sites", siteDefaults, "read value ", currentTabDefault)
        if (!currentTabDefault) {
            currentTabDefault = siteDefaults.default;
            console.log("no current tab default, reading from fallback", currentTabDefault)

        }

        allDefaults[reloaderTabDefaults][currentBaseUrl] = currentTabDefault;
        await chrome.storage.sync.set(allDefaults);
    }

    if (!currentTabData) {
        currentTabData = toReloaderData(currentTabDefault,currentTab.id,
            currentTab.title,
            false);
        //save infos about current tab
        allTabData[reloaderTabs][currentTab.id] = currentTabData;
        await chrome.storage.session.set(allTabData);
    }

    let saveAndReload = async function () {
        if (currentTabData.isActive) {
            //start is enough here, because start stops the other process first
            await startPageReloading();
        } else if (currentTabData.intervalId) {
            await stopPageReloading();
        }

        allDefaults[reloaderTabDefaults][currentBaseUrl] = toPreconfig(currentTabData);
        await chrome.storage.session.set(allTabData);
        await chrome.storage.sync.set(allDefaults);
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
    await chrome.action.setIcon({
        path: {
            "16": "../images/16_green.png",
            "32": "../images/32_green.png",
            "48": "../images/48_green.png",
            "128": "../images/128_green.png"
        }
    });

    let startPageReloading = async function () {
        currentTabData.intervalId = await chrome.runtime.sendMessage(new ReloadingSettings(currentTabData, true, currentTabData.intervalId))
    };

    let stopPageReloading = async function () {
        currentTabData.intervalId = await chrome.runtime.sendMessage(new ReloadingSettings(currentTabData, false, currentTabData.intervalId))
    };

    tabActivityCheckbox.addEventListener('change', async function () {
        console.log(`tab activity value changed: ${tabActivityCheckbox.checked}`);
        currentTabData.isActive = tabActivityCheckbox.checked;
        await saveAndReload();
    });

    secondsForReloadField.addEventListener('input', async function () {
        console.log(`seconds for reload value changed: ${secondsForReloadField.value}`);
        currentTabData.secondsForReload = secondsForReloadField.value;
        await saveAndReload();

    });

    tagToInspectField.addEventListener('input', async function () {
        console.log(`tag to inspect value changed: ${tagToInspectField.value}`);
        currentTabData.tagToInspect = tagToInspectField.value;
        await chrome.storage.session.set(allTabData);
        await saveAndReload();

    });

    isSoundOnCheckbox.addEventListener('change', async function () {
        console.log(`is sound on value changed: ${isSoundOnCheckbox.value}`);
        currentTabData.isSoundOn = isSoundOnCheckbox.checked;
        await chrome.storage.session.set(allTabData);
        await saveAndReload();
    });
});
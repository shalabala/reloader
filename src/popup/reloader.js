import { ActiveTabIdsSessionKey } from '../scripts/constants.js'

document.addEventListener('DOMContentLoaded', function () {
    const tabActivityCheckbox = document.getElementById('activeOnThisTab');

    tabActivityCheckbox.addEventListener('change', async function () {
        let savedData = await chrome.storage.local.get([ActiveTabIdsSessionKey]);
        let currentTab = await chrome.tabs.query({ active: true });
        let dataToSave = {};
        // Data to save
        if (tabActivityCheckbox.checked) {
            dataToSave[ActiveTabIdsSessionKey] = savedData;
            dataToSave[ActiveTabIdsSessionKey].append(currentTab.id);
        } else {
            dataToSave[ActiveTabIdsSessionKey] = savedData.filter(e => e != currentTab.id);
        }
        await chrome.storage.local.set(savedData);
    });
});
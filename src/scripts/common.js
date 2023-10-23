export const reloaderTabs = "reloader_tabs";
export const reloaderTabDefaults = "reloader_tab_defaults";
export const reloaderChangedMessage = "reloader_changed_message"
export const defaultReloadTimeInSeconds = 15;
export const defaultTagToInspect = "h1";
export const defaultSoundOn = true;

export function getBaseUrl(url) {
    var pathArray = url.split('/');
    var protocol = pathArray[0];
    var host = pathArray[2];
    return protocol + '//' + host;
}
export function toReloaderData(preconfig, tabId, title, isActive) {
    return new ReloaderData(tabId, title, isActive, preconfig.secondsForReload,
        preconfig.tagToInspect, preconfig.isSoundOn);
}
export class ReloaderPreconfiguration {
    constructor(secondsForReload, tagToInspect, isSoundOn) {
        this.secondsForReload = secondsForReload;
        this.tagToInspect = tagToInspect;
        this.isSoundOn = isSoundOn;
    }
}
export async function createEmptyDatasetForSession(name) {
    let dataset = {};
    dataset[name] = {};
    await chrome.storage.session.set(dataset);
}
export async function createEmptyDatasetForSync(name) {
    let dataset = {};
    dataset[name] = {};
    await chrome.storage.sync.set(dataset);
}
export function toPreconfig(data) {
    return new ReloaderPreconfiguration(data.secondsForReload, data.tagToInspect, data.isSoundOn);
}
export class ReloaderData {
    constructor(tabId, title, isActive,
        secondsForReload, tagToInspect, isSoundOn) {
        this.tabId = tabId;
        this.isActive = isActive
        this.secondsForReload = secondsForReload;
        this.tagToInspect = tagToInspect;
        this.isSoundOn = isSoundOn;
        this.lastValueOfInspectedTag;
        this.intervalId = null;
        this.htmlValue = null;
        this.title = title;
    }


}
export class ReloadingSettings {
    constructor(tabData, isCreated) {
        this.type = reloaderChangedMessage;
        this.tabData = tabData
        this.isCreated = isCreated;
    }
}
export const siteDefaults = {
    'default': new ReloaderPreconfiguration(defaultReloadTimeInSeconds, "h1", defaultSoundOn),
    'https://www.wg-gesucht.de': new ReloaderPreconfiguration(defaultReloadTimeInSeconds, ".headline.headline-default", defaultSoundOn),
    'https://www.kleinanzeigen.de': new ReloaderPreconfiguration(defaultReloadTimeInSeconds, ".breadcrump-summary", defaultSoundOn),
}

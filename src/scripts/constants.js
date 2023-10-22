export const reloaderTabs = "reloader_tabs";
export const reloaderOldHtmls = "reloader_old_htmls";
export const reloaderChangedMessage = "reloader_changed_message"
export const defaultReloadTimeInSeconds = 15;
export const defaultTagToInspect = "h1";
export const defaultSoundOn = true;

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
export class ReloadingSettings{
    constructor(tabData, isCreated){
        this.type = reloaderChangedMessage;
        this.tabData=tabData
        this.isCreated=isCreated;
    }
}
export class ReloaderInitiationResult{
    constructor(intervalId, htmlValue){
        this.intervalId = intervalId;
        this.htmlValue = htmlValue;
    }
}

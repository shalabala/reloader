export const reloaderTabs = "reloader_tabs";
export const reloaderChangedMessage = "reloader_changed_message"
export const defaultReloadTimeInSeconds = 60;

export class ReloaderData {
    constructor(tabId, isActive,
         secondsForReload, tagToInspect, isSoundOn) {
        this.tabId = tabId;
        this.isActive = isActive
        this.secondsForReload = secondsForReload;
        this.tagToInspect = tagToInspect;
        this.isSoundOn = isSoundOn;
        this.isAlarmOn = false;
        this.lastValueOfInspectedTag;
    }
}
export class ReloadingSettings{
    constructor(tabId, isCreated){
        this.type = reloaderChangedMessage;
        this.tabId = tabId;
        this.isCreated=isCreated;
    }
}

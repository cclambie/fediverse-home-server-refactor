/*
// MV3: service worker background script
chrome.action.onClicked.addListener(() => {
  // Works in Chrome and Firefox MV3
  chrome.runtime.openOptionsPage();
});
*/

// Open the options page when the toolbar icon is clicked.
browser.browserAction.onClicked.addListener(() => {
  browser.runtime.openOptionsPage().catch((error) => {
    console.error('Failed to open options page:', error);
  });
});

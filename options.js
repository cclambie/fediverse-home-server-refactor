(function() {
  const homeInput = document.getElementById('homeInstance');
  const saveButton = document.getElementById('save');
  const statusEl = document.getElementById('status');

  const storage = chrome.storage || browser.storage;

  storage.sync.get('homeInstance', (result) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    if (result.homeInstance) {
      homeInput.value = result.homeInstance;
    }
  });

  function normalizeInstance(url) {
    if (!url) return '';
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return url.replace(/\/+$/, '');
  }

  saveButton.addEventListener('click', () => {
    const normalized = normalizeInstance(homeInput.value);
    if (!normalized) {
      statusEl.textContent = 'Please enter a valid URL.';
      return;
    }
    storage.sync.set({ homeInstance: normalized }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        statusEl.textContent = 'Error saving setting.';
        return;
      }
      statusEl.textContent = 'Saved: ' + normalized;
      setTimeout(() => { statusEl.textContent = ''; }, 2000);
    });
  });
})();

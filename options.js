(function () {
  const homeInput = document.getElementById('homeInstance');
  const logCheckbox = document.getElementById('logConsole');
  const saveButton = document.getElementById('save');
  const statusEl = document.getElementById('status');

  const storage = chrome.storage || browser.storage;

  // Load saved values
  storage.sync.get(['homeInstance', 'logConsole'], (result) => {
    if (chrome.runtime && chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    if (result.homeInstance) {
      homeInput.value = result.homeInstance;
    }
    if (typeof result.logConsole === 'boolean') {
      logCheckbox.checked = result.logConsole;
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
    const logConsole = logCheckbox.checked;

    if (!normalized) {
      statusEl.textContent = 'Please enter a valid URL.';
      return;
    }

    storage.sync.set(
      {
        homeInstance: normalized,
        logConsole: logConsole
      },
      () => {
        if (chrome.runtime && chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          statusEl.textContent = 'Error saving settings.';
          return;
        }
        statusEl.textContent = 'Saved.';
        setTimeout(() => {
          statusEl.textContent = '';
        }, 2000);
      }
    );
  });
})();

// Cross-browser API wrapper
const ext = typeof browser !== 'undefined' ? browser : chrome;

(async function () {
  console.log('[Fediverse Rewriter] content script loaded');

  // Use storage.local for now (simpler, works in temp/dev)
  function getHomeInstance() {
    return new Promise((resolve) => {
      const storage = ext.storage;
      storage.local.get(['homeInstance'], (result) => {
        if (chrome.runtime && chrome.runtime.lastError) {
          console.error('[Fediverse Rewriter] storage error:', chrome.runtime.lastError);
          resolve(null);
          return;
        }
        resolve(result.homeInstance || null);
      });
    });
  }

  const homeInstance = await getHomeInstance();
  console.log('[Fediverse Rewriter] homeInstance from storage:', homeInstance);

  if (!homeInstance) {
    console.log('[Fediverse Rewriter] No homeInstance configured, exiting.');
    return;
  }

  function parseMastodonProfile(url) {
    try {
      const u = new URL(url);
      const path = u.pathname; // e.g. "/@alice" or "/@alice@remote.example"
      const match = path.match(/^\/@([^/]+)(?:\/.*)?$/);
      if (!match) return null;

      const raw = match[1]; // "alice" or "alice@remote.example"
      const parts = raw.split('@').filter(Boolean);

      if (parts.length === 1) {
        // Local username: /@alice on aus.social
        const username = parts[0];
        const host = u.hostname;
        console.log('[Fediverse Rewriter] local username:', username, 'host:', host);
        return { username, host };
      } else {
        // Remote username already encoded: /@alice@remote.example on aus.social
        const username = parts[0];
        const host = parts.slice(1).join('@'); // everything after the first "@"
        console.log('[Fediverse Rewriter] remote username:', username, 'host:', host);
        return { username, host };
      }
    } catch (e) {
      return null;
    }
  }



  function buildLocalProfileUrl(home, username, host) {
    // home: e.g. https://homeserver.com
    // result: https://homeserver.com/@username@host
    console.log('[Fediverse Rewriter] 3 username: {username} host:{host}');
    return `${home}/@${username}@${host}`;
  }


  function rewriteProfileLinks() {
    const anchors = document.querySelectorAll('a[href]');
    anchors.forEach((a) => {
      const href = a.getAttribute('href');
      if (!href) return;

      let absolute;
      try {
        absolute = new URL(href, document.baseURI).toString();
      } catch (e) {
        return;
      }

      const info = parseMastodonProfile(absolute);
      if (!info) return;

      // Do not rewrite links that already point to our home instance
      try {
        const current = new URL(absolute);
        const home = new URL(homeInstance);
        if (current.hostname === home.hostname) {
          return;
        }
      } catch (e) {
        // ignore parse errors
      }

      const localProfile = buildLocalProfileUrl(homeInstance, info.username, info.host);

      a.setAttribute('data-original-href', absolute);
      a.setAttribute('href', localProfile);


      if (!a.dataset.fediRewritten) {
        a.dataset.fediRewritten = 'true';
        a.style.outline = '1px dotted #6a0dad';
        a.title = 'View via ' + homeInstance + ' (original: ' + absolute + ')';

      }
    });
  }

  function addHomeDomainPill(homeInstance) {
    const domainButton = document.querySelector('button.account__domain-pill');
    if (!domainButton) return;

    if (domainButton.dataset.fediHomeAdded === 'true') return;

    const info = parseMastodonProfile(window.location.href);
    if (!info) return;

    const { username, host } = info;
    const localProfileUrl = buildLocalProfileUrl(homeInstance, username, host);

    const link = document.createElement('a');
    link.href = localProfileUrl;
    link.textContent = `on ${homeInstance.replace(/^https?:\/\//i, '')}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = domainButton.className;
    link.style.marginLeft = '0.5rem';

    domainButton.dataset.fediHomeAdded = 'true';
    domainButton.insertAdjacentElement('afterend', link);
  }



  // Run once now
  rewriteProfileLinks();
  addHomeDomainPill(homeInstance);


  // Run again when the DOM changes (for SPA / infinite scroll)
  const observer = new MutationObserver(() => {
    rewriteProfileLinks();
    addHomeDomainPill(homeInstance);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();

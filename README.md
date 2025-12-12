This extension rewrites Fediverse profile links so you can browse and follow accounts from your home server, no matter which instance you are currently visiting.

## Fediverse Home Server Refactor/Rewriter

This browser extension detects Mastodon/Fediverse account links on any page and rewrites them to open via your own home instance. That way, when you click on `@user` links out in the Fediverse, you land on your server’s view of that account, where you are already logged in and can follow, boost, or interact.

### What it does

- Detects Mastodon-style profile URLs such as:
  - `https://aus.social/@KathyReid`
  - `https://aus.social/@SecretAntelope@covertcreatures.xyz`
- Rewrites them to your home instance as:
  - `https://your.home.instance/@KathyReid@aus.social`
  - `https://your.home.instance/@SecretAntelope@covertcreatures.xyz`
- Works even when you are browsing:
  - Hashtag pages on a different server
  - Remote timelines
  - Profile pages that embed links to other instances
- Adds an “on {home}” pill next to the instance domain pill on Mastodon profile pages so you can jump straight to the profile as seen from your home instance.

The goal is to make cross-instance browsing feel more like a single, coherent experience, aligned with the Fediverse principle that you own your home server identity rather than the silo you are currently visiting.

## How it works

The extension uses a content script that runs on all pages and:

- Scans for `<a>` elements whose path looks like `/@username` or `/@username@remote.instance`.
- Normalises the handle with a single, consistent parser so that:
  - `/@alice` on `example.social` → `alice@example.social`
  - `/@alice@remote.example` on `example.social` → `alice@remote.example` (no double domains)
- Rewrites the link target to:
  - `https://your.home.instance/@alice@example.social`
- When it finds the instance “domain pill” button on Mastodon profiles, it:
  - Parses the current profile URL to `username@domain`
  - Appends a twin pill labelled `on your.home.instance` that links to your home instance’s view of that profile.

All behaviour is driven by your configured home instance URL, stored locally in extension storage.

## Installation (Chrome, dev mode)

1. Clone or download this repository.
2. In Chrome, open `chrome://extensions`.
3. Enable “Developer mode”.
4. Click “Load unpacked” and select the project folder.
5. The extension should appear with its icon in the toolbar.

For a production build, you would zip the folder and upload it to the Chrome Web Store following their submission guidelines.

## Configuration

1. Click the extension icon in the toolbar.
2. The options page opens.
3. Enter your home instance as a URL, for example:
   - `https://aus.social`
   - `https://fosstodon.org`
   - `https://your.custom.domain`
4. Save the settings.

From that point on, any supported profile links you click should open via this home instance.

## Usage examples

- Browsing a hashtag timeline on `aus.social`:
  - You see a post from `@SecretAntelope@covertcreatures.xyz`.
  - The profile link is rewritten to `https://your.home.instance/@SecretAntelope@covertcreatures.xyz`.
  - Clicking it opens the remote account inside your home server’s web UI.

- Viewing a remote profile on another instance:
  - Page URL: `https://aus.social/@SecretAntelope@covertcreatures.xyz`
  - The extension parses the encoded handle, avoids appending `@aus.social` again, and builds:
    - `https://your.home.instance/@SecretAntelope@covertcreatures.xyz`
  - An “on your.home.instance” pill appears next to the server name.

## Development

- The extension is written as a Manifest V3 extension for Chrome.
- Core pieces:
  - `manifest.json` – extension metadata and permissions
  - `background.js` – action icon handling and options page opening
  - `options.html` / `options.js` – settings UI for the home instance
  - `content-scripts.js` – DOM parsing and link rewriting logic

The parsing is centralised in a single function that takes a URL and returns `{ username, host }` for both local and remote profile URL shapes. All rewriting, including the “on {home}” pill, uses this parser to avoid duplicated hostnames.

## Future enhancements

These ideas are intentionally aligned with Fediverse and ActivityPub principles, and keep the browser doing only what the user explicitly asks for.

- **Federated instance discovery from the home server**
  - Add an optional feature that, when you land on a profile or hashtag, can call an API on your home server to:
    - Confirm the remote account is known and federated.
    - Discover additional instance metadata (e.g. moderation status, block lists).
  - This could be implemented via:
    - A small companion API on your home instance, or
    - A standard endpoint once there is a community convention for this kind of discovery.
  - The extension would remain “dumb” about federation graph details, delegating that logic to your home server while respecting rate limits and privacy.

- **Open hashtag links on your home instance**
  - Extend the rewriting logic to detect Mastodon hashtag URLs such as:
    - `https://aus.social/tags/fediverse`
  - Rewrite them to:
    - `https://your.home.instance/tags/fediverse`
  - This would make it possible to browse all hashtag feeds through your own instance, even when you discover them elsewhere, while still allowing an option to open the original remote view when needed (for example via a modifier key or a context menu).

- **Per-instance controls and safety**
  - Add options to:
    - Disable rewriting on specific instances.
    - Only rewrite when the target instance is federated with your home instance (once the API mentioned above exists).
    - Provide visual indicators when you are looking at content from instances your home server has limited or blocked.

## Contributing

Contributions, issues, and feature requests are welcome. Areas where help is particularly useful:

- Improving instance/URL detection across non-Mastodon ActivityPub servers.
- Better UX for toggling between “open on this instance” and “open on home instance”.
- Integrations with Mastodon, Pleroma, Akkoma, and other Fediverse stacks to standardise remote profile and hashtag URL handling.

## License

This project is licensed under the Apache License 2.0.
You may obtain a copy of the License at:
- https://www.apache.org/licenses/LICENSE-2.0

This project is intended to support open Fediverse tooling and should remain free and auditable.

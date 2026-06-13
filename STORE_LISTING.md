# Chrome Web Store - submission kit

Everything needed to publish this extension. Items marked **(you)** are manual steps in the
[Developer Dashboard](https://chrome.google.com/webstore/devconsole) that cannot be automated.

## Package to upload

`npm run package` produces `release/linear-rtl-chrome-extension.zip` containing only the runtime
files (`manifest.json`, `dist/content.js`, `icons/`). Upload that ZIP. **(you)**

## Listing fields

- **Name:** RTL for Linear
- **Short description (<=132 chars):**
  Fixes right-to-left text across Linear. A line with more than one RTL word becomes RTL. Not affiliated with Linear.
- **Category:** Workflow & Planning
- **Language:** English
- **Detailed description:**

  Linear renders every issue left-to-right, which scrambles the word order of right-to-left
  languages (Arabic, Persian, Urdu, and others). Linear RTL fixes that everywhere in the app.

  Any line that contains more than one RTL word is switched to right-to-left, so mixed
  RTL/Latin sentences read naturally. A single RTL word inside Latin text is left untouched.

  Features:
  - Works across the whole app: board, list and saved views, issue view, the command palette,
    inbox and search.
  - Right-aligns titles where it fits and mirrors list rows without breaking the layout.
  - Handles rich-text editors (title, description, comments) as you type.
  - Picks up dynamic content automatically while you scroll and navigate.
  - No configuration, no account, no data collection.

  Not affiliated with, or endorsed by, Linear. "Linear" is a trademark of its respective owner;
  it is used here only to describe what this extension is compatible with.

## Privacy (Privacy practices tab) **(you)**

- **Single purpose:** adjust text direction of right-to-left content on linear.app.
- **Permission justification:** host access to `https://linear.app/*` only - required to read and
  re-orient page text. No other permissions are requested.
- **Data usage:** does not collect, store, or transmit any user data. Check every "does not
  collect" box. Privacy policy URL: link to `PRIVACY.md` in this repo if a URL is requested.

## Assets

- **Store icon 128x128:** `icons/icon-128.png` (in the ZIP).
- **Title screenshot (1280x800):** `store-assets/title-1280x800.png` - branded graphic, satisfies the
  "at least one screenshot" requirement. **(you upload)**
- **Small promo tile 440x280:** `store-assets/promo-440x280.png`. **(you upload, optional)**
- **An in-app screenshot is nice to add too** - but capture it on a demo/non-sensitive workspace.
  Do NOT use a real board: store screenshots are public and would expose private issue titles.

## Before you submit

- One-time **$5** Chrome Web Store developer registration fee. **(you)**
- Verify the publisher email/account. **(you)**

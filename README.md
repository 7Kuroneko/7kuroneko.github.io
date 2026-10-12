# The Kuroneko Company

*Gifts received, given back as work.* (1 Peter 4:10)

The gift is the vision, the work is the detail, and the standard is excellence.

**Website:** https://7kuroneko.github.io

---

## What's in this folder

```
index.html          Portfolio homepage (11 projects)
covers/             Project covers, v6-bk-01 … v6-bk-11
logo/               Cat mark, wordmark, profile pictures
tokens/             kuroneko.css + kuroneko.json
work/<project>/     One live page per project, each with its Kuroneko loading screen
support.js          Runtime used by the homepage and project pages
image-slot.js       Image placeholder component used by the homepage
BRAND.md            Brand guide
```

Projects in `work/`: related-cheyenne, msft-cheyenne, gb200, investors-field-guide, gpu-planner, divine-energy, genetic-library, gj-504b, ny-retail, lightsaber, cursed-energy.

---

## Upload to GitHub (browser, no installs)

1. Unzip the download.
2. Go to your repository **7kuroneko/7kuroneko.github.io** on github.com. (If it doesn't exist yet: **+ → New repository**, name it exactly `7kuroneko.github.io`, Public, no README.)
3. Click **Add file → Upload files**.
4. Open the unzipped folder, select **everything inside it** (not the folder itself) and drag it into the browser. Folders upload with their contents. Existing files with the same name are replaced.
5. Write a message like `Portfolio: 11 projects + loaders` and click **Commit changes**.
6. **Settings → Pages**: Source **Deploy from a branch**, Branch **main**, folder **/(root)**, Save.
7. After a minute or two the site is live at https://7kuroneko.github.io

## Upload with Git (terminal)

```bash
cd path/to/unzipped-folder
git init
git add .
git commit -m "Portfolio: 11 projects + loaders"
git branch -M main
git remote add origin https://github.com/7kuroneko/7kuroneko.github.io.git
git push -u origin main --force
```

`--force` replaces what's in the repo with this folder. Leave it off if you want to keep files that aren't in here.

---

**Fonts:** Geist + Geist Mono (Google Fonts). **Accent:** Moonlight `#E8ECCC`.

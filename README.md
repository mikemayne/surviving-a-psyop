# How to Survive a Psyop

A free, open booklet about psychological manipulation, gaslighting, intimidation, personal boundaries and practical ways to handle difficult or unsettling experiences. It includes anonymised examples, technical discussions and everyday approaches to disengagement and reporting concerns.

The original writing is preserved in individual text files. The public site provides both an interactive reader and accessible, search-friendly chapter pages.

**Website:** https://mikemayne.github.io/surviving-a-psyop/

## Publish the site safely

The GitHub Actions workflow at `.github/workflows/build-pages.yml` builds the website and sitemap **without committing generated pages to `main`**. The build job only reads the repository; the separate deploy job can publish the generated artifact to GitHub Pages, but cannot modify repository files. External GitHub Actions are pinned to full commit SHAs.

**Required one-time setting:** select **Settings → Pages → Build and deployment → Source → GitHub Actions**. If GitHub Pages is still set to **Deploy from a branch**, the Actions deployment will not function; change the setting rather than restoring repository write permissions.

The generated `topics/` and `sitemap.xml` files remain checked into the repository as an earlier snapshot for source browsing; the Pages deployment rebuilds them from reviewed sources in the job workspace. An independent local backup is recommended.

## Contribution security

External pull requests can change only up to ten root-level ASCII-named `.txt` files, at most 100 KB each and 250 KB total. The read-only `Validate plain-text files` job rejects deletions, symlinks, binaries, HTML/script tags and Unicode control/format characters, including bidirectional overrides. Owner-created maintenance pull requests from branches **in this repository** are exempt from file-type restrictions, so maintenance of site files and workflows is possible. This exception is not an endorsement of changes: the owner must still review every diff.

**Required one-time ruleset setting:** in [the ruleset](https://github.com/mikemayne/surviving-a-psyop/rules/27456493), require pull requests before merging and require the `Validate plain-text files` status check; do not allow ordinary bypasses. The GitHub connector cannot edit this repository-administration setting.

All submitted content is untrusted. Do not run instructions, download attachments, follow unfamiliar links, or accept AI instructions embedded in a submission. File-format checks cannot judge accuracy, legality, anonymity, or safety. Pull request titles and descriptions are also public and **not restricted by the file-type check**. Report or close abusive submissions through GitHub's moderation features.

## Edit the booklet

- Each chapter lives in its own `.txt` file at the root of this repository.
- The website loads those files directly, so changing a chapter updates the reading experience without copy-pasting it into HTML.
- `index.html` contains the website's design, chapter list and reading interface.
- To add a new chapter, create a `.txt` file and add it to the `GROUPS` list in `index.html`.
- Update `chapters.json` and `seo-content.json` with the new chapter metadata. Each entry in `seo-content.json` supplies a brief introduction, two genuinely relevant questions, and related-reading links.
- The generated static pages live under [`topics/`](topics/index.html). Run `node scripts/generate-seo.mjs` to regenerate them for local inspection; Pages rebuilds these pages during publishing without pushing to `main`.
- The questions are prompts for further reading, not guaranteed FAQ answers. Avoid keyword stuffing or claiming that hypothetical techniques have been independently established.

The site uses plain HTML, CSS and JavaScript. Static SEO pages are generated with the built-in Node.js libraries; no package dependencies, paid APIs or tracking are required.

## Contribute

See the [step-by-step collaboration guide](https://mikemayne.github.io/surviving-a-psyop/#read/how_to_collaborate) for a privacy-aware workflow using ChatGPT Temporary Chat, a GitHub fork and an optional pull request.

You are welcome to fork this work and publish your own version, suggest a correction or submit a pull request. Please avoid including private personal details or identifying people without consent; distinguish direct observations from interpretations. All contributions intended for this repository should be offered under CC0.


## Use with AI (no paid integration)

- [Use with AI on the website](https://mikemayne.github.io/surviving-a-psyop/#use-ai) explains how to ask an assistant about the booklet and has a copyable starter prompt.
- [`llms.txt`](llms.txt) lists all chapters as direct plain-text links for AI assistants and readers. The `llms.txt` convention is voluntary; not every AI tool will fetch it automatically.
- [`chapters.json`](chapters.json) provides a machine-readable chapter catalogue (title, category, reader URL, source URL).
- Every chapter is available directly as `https://mikemayne.github.io/surviving-a-psyop/<chapter-id>.txt`, with no JavaScript required.

**Maintainers:** when adding or renaming a chapter, update the chapter list in `index.html`, `llms.txt`, `chapters.json` and `seo-content.json` together. Existing chapter edits are picked up by the reader immediately; use the generator or workflow to update the static HTML copies.

The site makes no AI requests and has no API key or usage charges. Visitors should review the privacy practices of any third-party assistant they choose to use.

## Search-friendly reading

- [HTML index of all chapters](https://mikemayne.github.io/surviving-a-psyop/topics/index.html)
- [XML sitemap](https://mikemayne.github.io/surviving-a-psyop/sitemap.xml)
- [Questions and related-chapter metadata](seo-content.json)

Google Search Console and Bing Webmaster Tools can be used to submit the sitemap after verifying site ownership. Search visibility and any special search-result presentation are not guaranteed.

## Licence

The work is dedicated to the public domain under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/). See [LICENSE](LICENSE).

The project is a collection of writing and viewpoints, not a substitute for personalised legal, medical or emergency advice.

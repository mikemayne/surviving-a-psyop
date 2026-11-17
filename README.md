# How to Survive a Psyop

A free, open booklet about psychological manipulation, gaslighting, intimidation, personal boundaries and practical ways to handle difficult or unsettling experiences. It includes anonymised examples, technical discussions and everyday approaches to disengagement and reporting concerns.

The original writing is preserved in individual text files. The public site provides both an interactive reader and accessible, search-friendly chapter pages.

**Website:** https://mikemayne.github.io/surviving-a-psyop/

## Publish the site

The website is hosted with GitHub Pages. The original branch-based deployment works with the files in the repository, but the new automatic regeneration workflow uses **GitHub Actions** publishing.

To enable the regeneration-and-deploy workflow, go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**. The workflow at `.github/workflows/build-pages.yml` then regenerates static HTML chapters and the sitemap when chapter text or `seo-content.json` changes, and deploys the result. This is a **one-time repository setting**, not something the workflow can change itself.

If you keep **Deploy from a branch**, the existing Pages site still works, but GitHub Actions deployment may fail and generated pages may require manual regeneration. You can regenerate locally with `node scripts/generate-seo.mjs`, then commit the updated `topics/` and `sitemap.xml` files.

## Edit the booklet

- Each chapter lives in its own `.txt` file at the root of this repository.
- The website loads those files directly, so changing a chapter updates the reading experience without copy-pasting it into HTML.
- `index.html` contains the website's design, chapter list and reading interface.
- To add a new chapter, create a `.txt` file and add it to the `GROUPS` list in `index.html`.
- Update `chapters.json` and `seo-content.json` with the new chapter metadata. Each entry in `seo-content.json` supplies a brief introduction, two genuinely relevant questions, and related-reading links.
- The generated static pages live under [`topics/`](topics/index.html). Run `node scripts/generate-seo.mjs` to rebuild them and the sitemap; the GitHub Actions workflow automates this once Pages is configured to publish from Actions.
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

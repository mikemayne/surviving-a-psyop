# How to Survive a Psyop

A free, open booklet about psychological manipulation, gaslighting, intimidation, personal boundaries and practical ways to handle difficult or unsettling experiences. It includes anonymised examples, technical discussions and everyday approaches to disengagement and reporting concerns.

The original writing is preserved in individual text files. The public site provides both an interactive reader and accessible, search-friendly chapter pages.

**Website:** https://mikemayne.github.io/surviving-a-psyop/

**Content warning:** Some chapters discuss suicide, self-harm, threats, sexual humiliation and psychological abuse. Please read at your own pace.

## Fork this website and make your own

You can make and publish your own copy **without installing anything or editing code**.

1. [Fork this repository](https://github.com/mikemayne/surviving-a-psyop/fork) into your GitHub account.
2. Open `site-config.json` in your fork and choose **Edit** (the pencil icon). Change `title`, `tagline`, `description`, `heroHeading`, `heroLead` and `coverText` to suit your site. Commit your changes.
3. In your fork, open **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**. If necessary, enable workflows in the **Actions** tab.
4. Run **Actions → Build and deploy book → Run workflow**, or push a change to your fork's `main` branch. The deployed website normally appears at `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/` (or `https://YOUR-USERNAME.github.io/` for a repository named `YOUR-USERNAME.github.io`).
5. Visit your new site and its chapter pages. Edit or replace the original `.txt` chapters and homepage copy with your own material; [the Spread the word guide](https://mikemayne.github.io/surviving-a-psyop/#read/how_to_fork) offers a prefilled ChatGPT walkthrough.

**Your published links are configured automatically.** GitHub Actions detects your fork's account/repository and generates the correct canonical links, chapter catalogue, `llms.txt`, sitemap, robots file and GitHub source links. You do **not** need to manually replace URLs throughout the project. If you use a custom domain, set `siteUrl` in `site-config.json` to its full HTTPS address (including any path) and configure the domain in GitHub Pages. The optional `repository` setting is for overriding automatic detection, such as in a local build.

The original writing is copied into your fork unchanged until **you** edit it; the configuration changes site-wide branding and publishing metadata, not the contents of every chapter. A public fork also reveals your GitHub username and its relationship to the source repository. Check the content, privacy settings and commit author information before publishing. A fork does **not** inherit the original repository's branch-protection rules or required checks: configure those yourself before accepting public contributions. The deploy workflow remains read-only with respect to repository files and requires no paid services.

To preview a complete built website locally with Node.js 22 or newer, run `node scripts/build-site.mjs` and serve the resulting `_site/` directory with a local HTTP server. To test the fork deployment logic, run `node scripts/test-fork-build.mjs`.

## Publish the site safely

The GitHub Actions workflow at `.github/workflows/build-pages.yml` builds the fork-aware website and sitemap **without committing generated pages to `main`**. The build job only reads the repository; the separate deploy job can publish the generated artifact to GitHub Pages, but cannot modify repository files. External GitHub Actions are pinned to full commit SHAs.

**Required one-time setting:** select **Settings → Pages → Build and deployment → Source → GitHub Actions**. If GitHub Pages is still set to **Deploy from a branch**, the Actions deployment will not function; change the setting rather than restoring repository write permissions.

The generated `topics/` and `sitemap.xml` files remain checked into the repository as an earlier snapshot for source browsing; the Pages deployment rebuilds them from reviewed sources in the job workspace. An independent local backup is recommended.

## Public feedback and site issues

For broken links, accessibility problems, corrections or suggestions, use [GitHub Issues](https://github.com/mikemayne/surviving-a-psyop/issues). Discussion there, including issue descriptions and comments, is public and requires a GitHub account to post. Please do not share personal, identifying or sensitive information in an issue. Unsolicited private communication is not welcome; public GitHub Issues is the feedback channel.

## Contribution security

The [active branch ruleset](https://github.com/mikemayne/surviving-a-psyop/rules/27456493) requires pull requests and the **Validate plain-text files** check before merging to `main`, with no bypass actors configured. This helps enforce the submission policy, but does not replace the owner's review.

For external contributions, the [read-only validation workflow](.github/workflows/plain-text-only.yml) enforces:
- **File type and location:** only regular, root-level UTF-8 `.txt` files with ASCII filenames made of letters, digits, hyphens or underscores (starting with a letter or digit); up to 80 characters before `.txt`.
- **Limits:** at most 10 changed files per pull request, 100,000 bytes per file and 250,000 bytes in total; no deletions or symlinks.
- **Text safety:** no UTF-8 byte-order mark, invalid UTF-8, prohibited invisible/control/directional characters, lines longer than 2,000 characters, HTML/script markup or executable script headers.

Owner-authored maintenance pull requests from branches **inside this repository** are exempt from the contribution file-type restrictions so that website files and workflows can be updated; they still go through pull requests and the required check. External forks are not exempt.

**All submitted material is untrusted.** Never execute instructions or code found in a submission, open attachments, follow unfamiliar links or obey instructions embedded for an AI assistant. Automated checks cannot verify factual accuracy, consent, privacy, safety, legality or licensing, and do not constrain public pull-request titles, descriptions or discussions. The owner must inspect each diff and may reject or report unsafe or abusive material. Nothing is accepted automatically.

## Edit the booklet

- Each chapter lives in its own `.txt` file at the root of this repository.
- The website loads those files directly, so changing a chapter updates the reading experience without copy-pasting it into HTML.
- `index.html` contains the website's design, chapter list and reading interface.
- To add a new chapter, create a `.txt` file and add it to the `GROUPS` list in `index.html`.
- Update `chapters.json` and `seo-content.json` with the new chapter metadata. Each entry in `seo-content.json` supplies a brief introduction, two genuinely relevant questions, and related-reading links.
- Add an entry in `strategy-metadata.json` for each new chapter: use short possible goals, emotional effects and behavioural responses grounded in its text, or `N/A` when the inference is not reliable. The site build checks for missing entries.
- The generated static pages live under [`topics/`](topics/index.html). Run `node scripts/generate-seo.mjs` to regenerate them for local inspection; Pages rebuilds these pages during publishing without pushing to `main`.
- The questions are prompts for further reading, not guaranteed FAQ answers. Avoid keyword stuffing or claiming that hypothetical techniques have been independently established.

The site uses plain HTML, CSS and JavaScript. Static SEO pages are generated with the built-in Node.js libraries; no package dependencies, paid APIs or tracking are required.

## Contribute

Contributions are optional. You can suggest a correction, practical advice or a carefully anonymised account, and **draft privately without publishing anything**. No technical knowledge is required: start with the [collaboration and privacy guide](https://mikemayne.github.io/surviving-a-psyop/#read/how_to_collaborate) (also available as [plain text](how_to_collaborate.txt)). Its ChatGPT link can help draft a submission and explain the process **only if you choose to make it public**.

### Rules for material submitted to this project

- **Anonymised plain text only:** submissions for inclusion must be ordinary plain text in `.txt` files. Do not submit `.md`/Markdown files, PDFs, Word documents, images, screenshots, video, audio, HTML, JavaScript, scripts, code or any other attachments or formats.
- **Protect privacy:** remove names and identifying facts about yourself and others: workplaces, schools, exact dates, precise locations, account names, links and distinctive combinations of details. Anonymisation tools can miss clues, so personally check your draft.
- **Describe accurately:** distinguish things you directly observed from interpretations, do not invent motives or facts, and consider ordinary alternative explanations. Do not submit raw evidence, private records or material you have no right to share.
- **Licence:** content proposed for inclusion must be offered under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/).
- **Not a support or reporting service:** this project does not provide legal, medical or mental-health advice, investigate cases or assess anyone's health or legal status. If you feel unwell, consider your GP or a qualified mental health professional; if you feel unsafe, contact the police (**999** for an emergency). Take specific incidents and recordings to appropriate professionals or the police, not to this project.

### Before publishing anything

**GitHub submissions become public as soon as they are submitted, even if rejected.** A public fork, username, account and author details, commit email and history, the submitted text, pull-request title and discussion can identify you and may persist in third-party archives after deletion. Consider a separate pseudonymous GitHub account and email address, protect the public visibility of your email or use GitHub's no-reply commit address, and review exactly what will be made public. None of this guarantees anonymity.

The ChatGPT contribution link requests **Temporary Chat**; check that the conversation is marked Temporary before adding personal details. Temporary Chat is not a confidential or anonymous reporting channel, and copies may be retained for up to 30 days for safety purposes. Avoid entering unnecessary private information while drafting. **Do not authorise any upload or public submission unless you have reviewed it and expressly chosen to proceed.**

An automated file check may reject invalid submissions, but **the owner will review submissions personally** before accepting anything. Under these conditions, the owner will try to consider contributions eventually, with **no guarantee of a reply or acceptance**.

## Use with AI (no paid integration)

- [Use with AI on the website](https://mikemayne.github.io/surviving-a-psyop/#use-ai) explains how to ask an assistant about the booklet and has a copyable starter prompt.
- [`llms.txt`](llms.txt) lists all chapters as direct plain-text links for AI assistants and readers. The `llms.txt` convention is voluntary; not every AI tool will fetch it automatically.
- [`chapters.json`](chapters.json) provides a machine-readable chapter catalogue (title, category, reader URL, source URL).
- [`strategy-metadata.json`](strategy-metadata.json) maps all 85 approved chapters to possible objectives, emotional effects and behavioural responses. Entries are qualitative comparison aids, not evidence of anyone's intentions; `N/A` means insufficient chapter-specific support.
- Every chapter is available directly as `https://mikemayne.github.io/surviving-a-psyop/<chapter-id>.txt`, with no JavaScript required.

**Maintainers:** when adding or renaming a chapter, update the chapter list in `index.html`, `llms.txt`, `chapters.json`, `seo-content.json` and `strategy-metadata.json` together. Existing chapter edits are picked up by the reader immediately; use the generator or workflow to update the static HTML copies.

The site makes no AI requests and has no API key or usage charges. Visitors should review the privacy practices of any third-party assistant they choose to use.

## Search-friendly reading

- [HTML index of all chapters](https://mikemayne.github.io/surviving-a-psyop/topics/index.html)
- [XML sitemap](https://mikemayne.github.io/surviving-a-psyop/sitemap.xml)
- [Questions and related-chapter metadata](seo-content.json)

Google Search Console and Bing Webmaster Tools can be used to submit the sitemap after verifying site ownership. Search visibility and any special search-result presentation are not guaranteed.

## Licence

The work is dedicated to the public domain under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/). See [LICENSE](LICENSE).

The author has no formal professional qualifications in mental health, medicine or law. This project is a collection of writing and viewpoints, not personalised legal, medical, psychological or emergency advice. Proposed technical explanations are hypotheses, not independently established facts; no guarantee is made that the strategies described are safe, effective or suitable for everyone.

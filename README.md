# How to Survive a Psyop

The source repository for a freely available booklet and its GitHub Pages reading website.

**Website (once GitHub Pages is enabled):** https://mikemayne.github.io/surviving-a-psyop/

## Publish the site

The website is ready to serve from the repository root. To turn it on:

1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select **main** and **/(root)**, then click **Save**.

GitHub will publish the site at the URL above. Subsequent changes to `main` will be published automatically.

## Edit the booklet

- Each chapter lives in its own `.txt` file at the root of this repository.
- The website loads those files directly, so changing a chapter updates the reading experience without copy-pasting it into HTML.
- `index.html` contains the website's design, chapter list and reading interface.
- To add a new chapter, create a `.txt` file and add it to the `GROUPS` list in `index.html`.

The site uses plain HTML, CSS and JavaScript. No build tools, packages or third-party services are required.

## Contribute

You are welcome to fork this work and publish your own version, suggest a correction or submit a pull request. Please avoid including private personal details or identifying people without consent; distinguish direct observations from interpretations. All contributions intended for this repository should be offered under CC0.


## Use with AI (no paid integration)

- [Use with AI on the website](https://mikemayne.github.io/surviving-a-psyop/#use-ai) explains how to ask an assistant about the booklet and has a copyable starter prompt.
- [`llms.txt`](llms.txt) lists all chapters as direct plain-text links for AI assistants and readers. The `llms.txt` convention is voluntary; not every AI tool will fetch it automatically.
- [`chapters.json`](chapters.json) provides a machine-readable chapter catalogue (title, category, reader URL, source URL).
- Every chapter is available directly as `https://mikemayne.github.io/surviving-a-psyop/<chapter-id>.txt`, with no JavaScript required.

**Maintainers:** when adding or renaming a chapter, update the chapter list in `index.html`, `llms.txt`, and `chapters.json` together. Changing a chapter's existing `.txt` content does not require index updates.

The site makes no AI requests and has no API key or usage charges. Visitors should review the privacy practices of any third-party assistant they choose to use.

## Licence

The work is dedicated to the public domain under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/). See [LICENSE](LICENSE).

The project is a collection of writing and viewpoints, not a substitute for personalised legal, medical or emergency advice.

# Theoistic — a markdown blog you can host on GitHub Pages

A tiny, dependency-free blog. Posts are plain `.md` files with a little frontmatter.
No build step, no database, no CMS account. Edit a file, push, done.

```
index.html         ← the blog (this is what GitHub Pages serves)
serve.js           ← optional local preview server (Bun)
generate-index.js  ← rebuilds posts/index.json from your markdown
about.md           ← the About page (markdown + frontmatter)
posts/
  index.json       ← GENERATED card metadata for the front page (don't hand-edit)
  *.md             ← one markdown file per article (the source of truth)
.nojekyll          ← tells GitHub Pages to serve files as-is
```

The front page only ever loads `posts/index.json` (fast, even with hundreds of
posts). Each article's full text is fetched on demand, only when a reader opens it.

---

## Deploy to GitHub Pages

1. Create a repository and push this folder to it.
2. **Settings → Pages → Build and deployment → Source:** *Deploy from a branch*.
3. Pick your branch and the `/ (root)` folder, then **Save**.
4. After ~1 minute your blog is live at `https://<your-username>.github.io/<repo-name>/`
   (it serves `index.html` automatically — no filename needed in the URL).

### Custom domain — serving from the apex `theoistic.com`

To serve this site from the root domain `theoistic.com`:

1. In **Settings → Pages → Custom domain**, enter `theoistic.com` and **Save**.
   GitHub commits a `CNAME` file to the repo for you.
2. At your DNS provider, point the apex at GitHub Pages with four `A` records — and,
   ideally, the matching `AAAA` records for IPv6:

   ```
   A     @    185.199.108.153
   A     @    185.199.109.153
   A     @    185.199.110.153
   A     @    185.199.111.153
   AAAA  @    2606:50c0:8000::153
   AAAA  @    2606:50c0:8001::153
   AAAA  @    2606:50c0:8002::153
   AAAA  @    2606:50c0:8003::153
   ```

   Optionally add `CNAME  www  theoistic.github.io` so `www.theoistic.com` redirects
   to the apex.
3. Wait for DNS to propagate, then tick **Enforce HTTPS** in Settings → Pages.

Your blog is then live at **https://theoistic.com/** instead of the
`…github.io/<repo-name>/` URL above. (An apex domain is just A/AAAA records pointing at
GitHub — a subdomain like `blog.theoistic.com` would instead be a single
`CNAME → theoistic.github.io`. Verify the IPs against GitHub's current
"Managing a custom domain for your Pages site" docs; they change rarely but do change.)

> Hosting the blog from a dedicated repo? Rename this file to `README.md` there so the
> instructions show up on the repo's front page.

---

## Add a new post

1. Create `posts/my-new-post.md`. The filename (without `.md`) becomes the URL slug.
2. Start it with this frontmatter block, then write the body in normal markdown:

   ```markdown
   ---
   title: "Your headline goes here"
   excerpt: "One or two sentences shown on the article card."
   author: "Theodor Solbjorg"
   authorRole: "Software Engineer"
   category: "Notes"
   date: "2026-07-01"
   readingTime: "6 min read"
   color: "blue"
   image: ""
   featured: false
   ---

   Your article body. Use ## for section headings, **bold**, lists,

   > and blockquotes.
   ```

3. Rebuild the index, then commit and push:

   ```bash
   bun run generate-index.js     # or: node generate-index.js
   git add -A && git commit -m "New post" && git push
   ```

`generate-index.js` scans every `posts/*.md` and writes the card metadata into
`posts/index.json`. **Re-run it after every add / rename / delete** — the front page
reads only `index.json`, so a post you forget to index won't appear (and a stale entry
will show a card whose article fails to load).

> No Bun or Node? You can hand-edit `posts/index.json`: add one object per post with
> the same fields shown above plus `"slug"` (the filename without `.md`). Running the
> script is easier and less error-prone.

### Frontmatter reference

| Field         | What it does                                                                 |
|---------------|------------------------------------------------------------------------------|
| `title`       | Post headline (card + reading view).                                         |
| `excerpt`     | Short summary on the card.                                                   |
| `author`      | Shown on the card and reading view.                                          |
| `authorRole`  | Optional. Shown under the author in the reading view.                        |
| `category`    | Becomes a filter tab automatically.                                          |
| `date`        | `YYYY-MM-DD`. Controls sort order and the displayed date.                    |
| `readingTime` | Free text, e.g. `"5 min read"`.                                             |
| `color`       | Card tint: `blue`, `green`, `teal`, `amber`, `violet`, or `rose`.            |
| `image`       | Optional cover photo (e.g. `assets/my-post.jpg`). Omit to use `assets/default-image.jpg`. |
| `featured`    | `true` pins it to the large featured slot. Use it on at most one post.       |

---

## Links you can share

Every page and article has its own URL via a hash route, so you can link straight to it:

| Page       | URL                                    |
|------------|----------------------------------------|
| Home       | `https://theoistic.com/`               |
| About      | `https://theoistic.com/#/about`        |
| An article | `https://theoistic.com/#/post/<slug>`  |

`<slug>` is the post's filename without `.md` (e.g. `greetings` → `/#/post/greetings`).
These links survive refresh and browser back/forward, and work on GitHub Pages with no
extra configuration (no `404.html` redirect trick needed). An unknown slug quietly falls
back to the home page.

---

## Preview locally

The blog uses `fetch()` to read `index.json` and the markdown files, which browsers
block over `file://`. Serve it over HTTP instead:

```bash
bun serve.js          # then open http://127.0.0.1:8731/
# or, without this repo's helper:
bunx serve .          # or: npx serve .
```

---

## Customising the look

Open `index.html` and look near the top of the `<script>` block:

```js
var ACCENT = '#2563eb';        // accent colour: #2563eb | #0f172a | #7c3aed | #15803d
var DEFAULT_SORT = 'Newest';   // Newest | Oldest | A–Z
var SHOW_SEARCH = true;
```

The hero headline/subtitle live in `renderListHero()`, and the About page content
(name, role, intro, body) is driven entirely by the frontmatter and markdown in
`about.md`. It's all vanilla JavaScript — no framework, no build tooling.

That's the whole CMS. Markdown in, blog out.

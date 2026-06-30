// Regenerates posts/index.json from the frontmatter of every posts/*.md file.
// The blog's front page reads ONLY index.json (fast, even with hundreds of
// posts); the full article body is fetched lazily when a post is opened.
//
// Run after adding/editing/removing a post:
//     node generate-index.js
//
// No dependencies. Requires Node 12+.

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, 'posts');

function parseFrontmatter(raw) {
  const m = raw.match(/^\uFEFF?---\s*\r?\n([\s\S]*?)\r?\n---/);
  const meta = {};
  if (!m) return meta;
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    meta[key] = val;
  }
  return meta;
}

const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
const posts = files.map(f => {
  const meta = parseFrontmatter(fs.readFileSync(path.join(POSTS_DIR, f), 'utf8'));
  return {
    slug: f.replace(/\.md$/, ''),
    title: meta.title || '',
    excerpt: meta.excerpt || '',
    author: meta.author || '',
    authorRole: meta.authorRole || '',
    category: meta.category || '',
    date: meta.date || '',
    readingTime: meta.readingTime || '',
    color: meta.color || 'blue',
    featured: meta.featured === true,
    image: meta.image || ''
  };
});

posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
fs.writeFileSync(path.join(POSTS_DIR, 'index.json'), JSON.stringify(posts, null, 2) + '\n');
console.log('Wrote posts/index.json with ' + posts.length + ' post(s).');

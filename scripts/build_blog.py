#!/usr/bin/env python3
"""Build the static blog from content/blog/*.html.

Each source file starts with an HTML comment of `key: value` front matter,
followed by the article body. Run from anywhere: python3 scripts/build_blog.py

Writes blog/index.html, blog/<slug>.html, blog/category/<category>.html and
blog/feed.xml, and refreshes the blog entries in sitemap.xml and llms.txt.
Posts with `status: draft` are built to blog/<slug>.html for local review only:
they are marked noindex and left out of the index, categories, feed and sitemap.

In an article body, `<!-- cta -->` places the inline app call-to-action.
"""
import html
import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'content' / 'blog'
OUT = ROOT / 'blog'
SITE = 'https://budgetgo.ai'
APP = 'https://apps.apple.com/us/app/budgetgo-track-budget/id6761938917'
WORDS_PER_MINUTE = 220

CATEGORIES = {
    'inside-budgetgo': ('Inside BudgetGo', 'How BudgetGo works: insight stories, AI categorization, automations and analytics.'),
    'budgeting': ('Budgeting', 'Budgeting methods that fit real life, from the 50/30/20 rule to zero-based budgets.'),
    'spending': ('Spending', 'Track where your money goes and spot the patterns worth changing.'),
    'saving': ('Saving', 'Practical ways to keep more of what you earn.'),
}

AUTHORS = {
    'budgetgo-team': {
        'name': 'The BudgetGo Team',
        'role': 'Product & money writers',
        'bio': 'We build BudgetGo, the app that brings all your spending together and turns it into clear insights. We write about budgeting, spending habits, and how to get the most out of the app.',
        'image': 'src/images/logo.png',
    },
}

ARROW_SVG = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CURRENT = ' aria-current="page"'


# ---------- parsing ----------

def parse(path):
    text = path.read_text(encoding='utf-8')
    match = re.match(r'\s*<!--(.*?)-->\s*', text, re.S)
    if not match:
        raise SystemExit(f'{path.name}: missing front matter comment')
    meta = {}
    for line in match.group(1).strip().splitlines():
        if ':' in line:
            key, value = line.split(':', 1)
            meta[key.strip()] = value.strip()
    for key in ('title', 'description', 'category', 'cover', 'published', 'status'):
        if key not in meta:
            raise SystemExit(f'{path.name}: front matter needs "{key}"')
    if meta['category'] not in CATEGORIES:
        raise SystemExit(f'{path.name}: unknown category "{meta["category"]}"')
    if meta.get('author', 'budgetgo-team') not in AUTHORS:
        raise SystemExit(f'{path.name}: unknown author "{meta["author"]}"')
    meta.setdefault('seo_title', f"{meta['title']} | BudgetGo")
    meta.setdefault('dek', meta['description'])
    meta.setdefault('cover_alt', '')
    meta.setdefault('author', 'budgetgo-team')
    meta.setdefault('updated', meta['published'])
    meta['slug'] = path.stem
    meta['body'] = text[match.end():].strip()
    words = len(re.sub(r'<[^>]+>', ' ', meta['body']).split())
    meta['words'] = words
    meta['minutes'] = max(1, round(words / WORDS_PER_MINUTE))
    meta['url'] = f"{SITE}/blog/{meta['slug']}.html"
    return meta


def slugify(text):
    plain = html.unescape(re.sub(r'<[^>]+>', '', text)).lower()
    return re.sub(r'[^a-z0-9]+', '-', plain).strip('-')


def add_heading_ids(body):
    """Gives each h2 an id so the table of contents can link to it."""
    toc = []

    def repl(m):
        attrs, inner = m.group(1), m.group(2)
        found = re.search(r'id="([^"]+)"', attrs)
        if found:
            hid = found.group(1)
        else:
            hid = slugify(inner)
            attrs = f'{attrs} id="{hid}"'
        if 'data-toc="false"' not in attrs:
            toc.append((hid, html.unescape(re.sub(r'<[^>]+>', '', inner))))
        return f'<h2{attrs}>{inner}</h2>'

    body = re.sub(r'<h2([^>]*)>(.*?)</h2>', repl, body, flags=re.S)
    return body, toc


def human_date(iso):
    d = date.fromisoformat(iso)
    return f'{d.strftime("%B")} {d.day}, {d.year}'


def esc(text):
    return html.escape(text, quote=True)


# ---------- shared page chrome ----------

def head(p, title, desc, canonical, og_type, image, ld, noindex=False):
    robots = '\n  <meta name="robots" content="noindex, nofollow" />' if noindex else ''
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}" />{robots}
  <link rel="canonical" href="{canonical}" />
  <meta property="og:title" content="{esc(title)}" />
  <meta property="og:description" content="{esc(desc)}" />
  <meta property="og:type" content="{og_type}" />
  <meta property="og:url" content="{canonical}" />
  <meta property="og:image" content="{image}" />
  <meta property="og:site_name" content="BudgetGo" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#101010" />
  <link rel="icon" type="image/png" href="{p}src/images/favicon-rounded.png" />
  <link rel="apple-touch-icon" href="{p}src/images/favicon-rounded.png" />
  <link rel="alternate" type="application/rss+xml" title="BudgetGo Blog" href="{SITE}/blog/feed.xml" />
  <link rel="stylesheet" href="{p}styles.css?v=20261001-rounded" />
  <link rel="preload" href="{p}src/fonts/switzer-600.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="{p}src/css/site-shell.css?v=20261002" />
  <link rel="stylesheet" href="{p}src/css/inner-pages.css?v=20261002" />
  <link rel="stylesheet" href="{p}src/css/app-site.css?v=20261004" />
  <link rel="stylesheet" href="{p}src/css/app-site-inner.css?v=20261004" />
  <link rel="stylesheet" href="{p}src/css/language-switcher.css?v=20261008" />
  <link rel="stylesheet" href="{p}src/css/blog.css?v=20261101" />
  <script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
'''


def header(p):
    return f'''<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
  <div class="wrap nav-row">
    <a class="brand" href="{p}index.html" aria-label="BudgetGo homepage"><img src="{p}src/images/logo.png" alt="" width="34" height="34" /><span>BudgetGo</span></a>
    <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="site-nav"><span></span></button>
    <nav id="site-nav" class="nav-links" aria-label="Primary navigation">
      <a href="{p}index.html#inputs">Add spending</a><a href="{p}index.html#insights">Insights</a><a href="{p}index.html#analytics">Analytics</a><a href="{p}index.html#privacy">Privacy</a><a href="{p}automations.html">Guides</a><a href="{p}blog/"{CURRENT}>Blog</a>
      <a class="btn btn--light btn--sm" href="{APP}" target="_blank" rel="noopener noreferrer">Get the app{ARROW_SVG}</a>
    </nav>
  </div>
</header>
'''


def footer(p):
    return f'''
  <footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand"><a class="brand" href="{p}index.html"><img src="{p}src/images/logo.png" alt="" width="34" height="34" /><span>BudgetGo</span></a><p>Let’s make sense of all of it.</p></div>
      <div><h3>App</h3><a href="{p}index.html#inputs">Add spending</a><a href="{p}index.html#insights">Insights</a><a href="{p}index.html#analytics">Analytics</a><a href="{APP}" target="_blank" rel="noopener noreferrer">Get BudgetGo</a></div>
      <div><h3>Help</h3><a href="{p}automations.html">Automation guides</a><a href="{p}blog/">Blog</a><a href="{p}support.html">Support</a><a href="{p}index.html#faq">Common questions</a><a href="{p}mcp.html">MCP · Coming soon</a></div>
      <div><h3>Contact</h3><a href="mailto:support@budgetgo.ai">support@budgetgo.ai</a><a href="https://instagram.com/budgetgo.ai" target="_blank" rel="noopener noreferrer">Instagram →</a><a href="https://www.tiktok.com/@budgetgo.ai" target="_blank" rel="noopener noreferrer">TikTok →</a></div>
    </div>
    <div class="footer-bottom"><p>© 2026 GraphLeaf LLC.</p><p><a href="{p}privacy_policy.html">Privacy Policy</a> &nbsp;/&nbsp; <a href="{p}terms_of_service.html">Terms of Service</a></p></div>
  </div>
</footer>

  <script src="{p}src/js/i18n.js"></script>
  <script src="{p}src/js/home.js"></script>
</body>
</html>
'''


PUBLISHER = {'@type': 'Organization', 'name': 'BudgetGo', 'url': SITE + '/',
             'logo': {'@type': 'ImageObject', 'url': SITE + '/src/images/logo.png'}}


def cover_url(post):
    return f"{SITE}/{post['cover']}"


# ---------- components ----------

def card(post, p, featured=False, level='h2', link_base=''):
    cls = 'blog-card blog-card--featured' if featured else 'blog-card'
    label = CATEGORIES[post['category']][0]
    loading = 'eager' if featured else 'lazy'
    media_cls = 'blog-card-media blog-card-media--product' if 'app-live' in post['cover'] else 'blog-card-media'
    return f'''<article class="{cls}">
          <div class="{media_cls}"><img src="{p}{post['cover']}" alt="{esc(post['cover_alt'])}" loading="{loading}" decoding="async" /></div>
          <div class="blog-card-body">
            <div class="blog-meta"><span class="blog-tag">{label}</span><span>{post['minutes']} min read</span></div>
            <{level}><a href="{link_base}{post['slug']}.html">{post['title']}</a></{level}>
            <p>{esc(post['description'])}</p>
          </div>
        </article>'''


def category_nav(p, current, used):
    links = [f'<a href="{p}blog/"{CURRENT if current is None else ""}>All</a>']
    for key, (label, _) in CATEGORIES.items():
        if key in used:
            links.append(f'<a href="{p}blog/category/{key}.html"{CURRENT if key == current else ""}>{label}</a>')
    return '<nav class="blog-categories" aria-label="Blog categories">' + ''.join(links) + '</nav>'


def inline_cta():
    return f'''<aside class="inline-cta" aria-label="Get BudgetGo">
  <div><p class="inline-cta-title">Try it with your own spending</p><p>BudgetGo sorts every purchase and turns it into short, clear insights.</p></div>
  <a class="btn" href="{APP}" target="_blank" rel="noopener noreferrer">Get BudgetGo</a>
</aside>'''


# ---------- pages ----------

def article_page(post, published):
    p = '../'
    author = AUTHORS[post['author']]
    label = CATEGORIES[post['category']][0]
    body, toc = add_heading_ids(post['body'])
    body = body.replace('<!-- cta -->', inline_cta())
    toc_html = ''
    if len(toc) >= 3:
        items = ''.join(f'<li><a href="#{hid}">{esc(text)}</a></li>' for hid, text in toc)
        toc_html = f'<nav class="article-toc" aria-labelledby="toc-title"><p id="toc-title">In this article</p><ol>{items}</ol></nav>'
    others = sorted((o for o in published if o['slug'] != post['slug']), key=lambda o: o['published'], reverse=True)
    others.sort(key=lambda o: o['category'] != post['category'])
    related = '\n        '.join(card(o, p, level='h3') for o in others[:2])
    updated = ''
    if post['updated'] != post['published']:
        updated = f'<span aria-hidden="true">·</span><span>Updated <time datetime="{post["updated"]}">{human_date(post["updated"])}</time></span>'
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'BlogPosting', 'headline': post['title'], 'description': post['description'],
         'image': cover_url(post), 'datePublished': post['published'], 'dateModified': post['updated'],
         'author': {'@type': 'Organization', 'name': author['name'], 'url': SITE + '/'},
         'publisher': PUBLISHER, 'mainEntityOfPage': post['url'], 'articleSection': label,
         'wordCount': post['words'], 'inLanguage': 'en'},
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE + '/'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': SITE + '/blog/'},
            {'@type': 'ListItem', 'position': 3, 'name': label, 'item': f"{SITE}/blog/category/{post['category']}.html"},
            {'@type': 'ListItem', 'position': 4, 'name': post['title'], 'item': post['url']}]}]}
    draft = post['status'] != 'published'
    cover_cls = 'article-cover article-cover--product' if 'app-live' in post['cover'] else 'article-cover'
    related_html = f'''
  <section class="related" aria-labelledby="related-title">
    <h2 id="related-title">Keep reading</h2>
    <div class="blog-grid">
        {related}
    </div>
  </section>''' if related else ''
    out = head(p, post['seo_title'], post['description'], post['url'], 'article', cover_url(post), ld, noindex=draft)
    out += f'''<body class="inner-page blog-page" id="top">
{header(p)}
  <main id="main">
  <article class="article">
    <header class="article-head">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="{p}index.html">Home</a></li><li><a href="./">Blog</a></li><li><a href="category/{post['category']}.html">{label}</a></li></ol></nav>
      <h1>{post['title']}</h1>
      <p class="article-dek">{post['dek']}</p>
      <div class="article-byline">
        <img src="{p}{author['image']}" alt="" width="44" height="44" />
        <div><p class="article-author">{author['name']}</p><p class="blog-meta"><time datetime="{post['published']}">{human_date(post['published'])}</time>{updated}<span aria-hidden="true">·</span><span>{post['minutes']} min read</span></p></div>
      </div>
    </header>
    <figure class="{cover_cls}"><img src="{p}{post['cover']}" alt="{esc(post['cover_alt'])}" fetchpriority="high" decoding="async" /></figure>
    <div class="article-layout">
      {toc_html}
      <div class="article-body">
{body}
        <aside class="author-box" aria-label="About the author">
          <img src="{p}{author['image']}" alt="" width="56" height="56" />
          <div><p class="author-box-name">{author['name']}</p><p class="author-box-role">{author['role']}</p><p>{author['bio']}</p></div>
        </aside>
      </div>
    </div>
  </article>
  <section class="article-cta" aria-labelledby="cta-title">
    <div><h2 id="cta-title">See where your money goes.</h2><p>BudgetGo brings your spending together, sorts it automatically, and shows where you can save.</p></div>
    <a class="btn" href="{APP}" target="_blank" rel="noopener noreferrer">Get BudgetGo</a>
  </section>{related_html}
</main>
'''
    return out + footer(p)


def listing_page(posts, used, category=None):
    if category:
        p = '../../'
        label, intro = CATEGORIES[category]
        title = f'{label} Articles | BudgetGo Blog'
        canonical = f'{SITE}/blog/category/{category}.html'
        h1 = label
        link_base = '../'
        ld_type, list_key = 'CollectionPage', 'hasPart'
    else:
        p = '../'
        title = 'Budgeting & Money Tips Blog | BudgetGo'
        canonical = f'{SITE}/blog/'
        h1 = 'Money, made simpler.'
        intro = 'Practical guides on budgeting, tracking your spending, and getting the most out of BudgetGo.'
        link_base = ''
        ld_type, list_key = 'Blog', 'blogPost'
    ld = {'@context': 'https://schema.org', '@type': ld_type,
          'name': 'BudgetGo Blog' if not category else f'{h1} · BudgetGo Blog', 'url': canonical,
          'description': intro, 'publisher': PUBLISHER,
          list_key: [{'@type': 'BlogPosting', 'headline': x['title'], 'url': x['url'],
                      'datePublished': x['published'], 'image': cover_url(x)} for x in posts]}
    if posts:
        cards = card(posts[0], p, featured=True, link_base=link_base)
        cards += ''.join('\n        ' + card(x, p, link_base=link_base) for x in posts[1:])
    else:
        cards = '<p class="blog-empty">New articles are on the way.</p>'
    image = cover_url(posts[0]) if posts else SITE + '/src/images/og-home.jpg'
    out = head(p, title, intro, canonical, 'website', image, ld)
    out += f'''<body class="inner-page blog-page" id="top">
{header(p)}
  <main id="main">
  <section class="blog-hero" aria-labelledby="blog-title">
    <div class="container">
      <p class="page-pill">BudgetGo blog</p>
      <h1 id="blog-title">{h1}</h1>
      <p class="blog-hero-intro">{intro}</p>
      {category_nav(p, category, used)}
    </div>
  </section>
  <section class="blog-list" aria-label="Articles">
    <div class="container blog-grid">
        {cards}
    </div>
  </section>
</main>
'''
    return out + footer(p)


def feed(posts):
    items = ''.join(f'''
    <item><title>{esc(x['title'])}</title><link>{x['url']}</link><guid>{x['url']}</guid><pubDate>{date.fromisoformat(x['published']).strftime('%a, %d %b %Y')} 09:00:00 +0000</pubDate><description>{esc(x['description'])}</description></item>''' for x in posts)
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BudgetGo Blog</title>
    <link>{SITE}/blog/</link>
    <description>Practical guides on budgeting, tracking spending, and getting the most out of BudgetGo.</description>
    <language>en</language>{items}
  </channel>
</rss>
'''


# ---------- sitemap and llms.txt ----------

def update_sitemap(posts, used):
    path = ROOT / 'sitemap.xml'
    text = path.read_text(encoding='utf-8')
    text = re.sub(r'\s*<url>\s*<loc>https://budgetgo\.ai/blog/.*?</url>', '', text, flags=re.S)
    newest = max((x['updated'] for x in posts), default=date.today().isoformat())
    entries = [(f'{SITE}/blog/', newest, 'weekly', '0.8')]
    entries += [(f'{SITE}/blog/category/{c}.html', newest, 'weekly', '0.5') for c in used]
    entries += [(x['url'], x['updated'], 'monthly', '0.7') for x in posts]
    block = ''.join(f'''
  <url>
    <loc>{loc}</loc>
    <lastmod>{mod}</lastmod>
    <changefreq>{freq}</changefreq>
    <priority>{prio}</priority>
  </url>''' for loc, mod, freq, prio in entries)
    text = text.replace('\n</urlset>', block + '\n</urlset>')
    path.write_text(text, encoding='utf-8')


def update_llms(posts):
    path = ROOT / 'llms.txt'
    text = path.read_text(encoding='utf-8')
    text = re.sub(r'^- \[[^\]]*\]\(https://budgetgo\.ai/blog/[^)]*\).*\n', '', text, flags=re.M)
    lines = ['- [Blog](https://budgetgo.ai/blog/): Guides on budgeting, tracking spending, saving, and how BudgetGo works']
    lines += [f"- [{x['title']}]({x['url']}): {x['description']}" for x in posts]
    anchor = '- [Support](https://budgetgo.ai/support.html)'
    text = text.replace(anchor, '\n'.join(lines) + '\n' + anchor, 1)
    path.write_text(text, encoding='utf-8')


def main():
    posts = [parse(f) for f in sorted(SRC.glob('*.html'))]
    published = sorted((x for x in posts if x['status'] == 'published'),
                       key=lambda x: (x['published'], x['slug']), reverse=True)
    drafts = [x for x in posts if x['status'] != 'published']
    used = [c for c in CATEGORIES if any(x['category'] == c for x in published)]
    (OUT / 'category').mkdir(parents=True, exist_ok=True)
    for x in posts:
        (OUT / f"{x['slug']}.html").write_text(article_page(x, published), encoding='utf-8')
    (OUT / 'index.html').write_text(listing_page(published, used), encoding='utf-8')
    for c in used:
        (OUT / 'category' / f'{c}.html').write_text(
            listing_page([x for x in published if x['category'] == c], used, c), encoding='utf-8')
    (OUT / 'feed.xml').write_text(feed(published), encoding='utf-8')
    update_sitemap(published, used)
    update_llms(published)
    print(f'Built {len(published)} published post(s), {len(drafts)} draft(s).')
    for x in drafts:
        print(f"  draft for review: blog/{x['slug']}.html")


if __name__ == '__main__':
    main()

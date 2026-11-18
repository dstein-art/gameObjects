#!/usr/bin/env python3
"""
Builds the GameObjects.js help site.

    pip install markdown
    python3 docs/build.py

Each page is written in Markdown in docs/src/ and turned into an HTML page in
docs/ using the shared layout below. The API reference is built from API.md in
the project root (the same file GitHub shows), into docs/api.html.

Special lines you can use in the Markdown:

    [[demo: sketch-name]]                  a live demo from docs/demos/sketch-name.js
    [[demo: sketch-name | 420]]            ...with a custom height in pixels (canvas 640 wide)
    [[demo: sketch-name | 420 | keys]]     ...and a "click, then use the keyboard" hint
    [[demo: examples/platformer | 800x500 | keys]]
                                           a sketch from docs/examples/, with its canvas
                                           size (it's scaled down to fit the page)
"""
import hashlib
import html
import pathlib
import re

import markdown

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"


def site_version():
    """A short fingerprint of the library, the site's scripts and every sketch.

    It's added to the end of addresses (?v=...), so when any of these files
    change, browsers fetch the new copies instead of using old ones they saved.
    """
    files = [ROOT.parent / "gameobjects.js", ROOT / "js" / "docs.js", ROOT / "css" / "docs.css",
             ROOT / "demos" / "run.html"]
    files += sorted((ROOT / "demos").glob("*.js")) + sorted((ROOT / "examples").glob("*.js"))
    h = hashlib.md5()
    for f in files:
        h.update(f.read_bytes())
    return h.hexdigest()[:8]


VERSION = site_version()

# The order of the site. Each entry is (file name, menu title, [sub-pages]).
PAGES = [
    ("getting-started", "Getting Started", []),
    ("game-objects", "Game Objects", []),
    ("movement", "Movement", []),
    ("groups", "Groups of Game Objects", []),
    ("physics", "Physics", []),
    ("collisions", "Collisions and Overlaps", []),
    ("animation", "Spritesheets and Animations", []),
    ("sounds", "Sounds", []),
    ("input-camera", "Player Input and Camera", []),
    ("levels-score", "Managing your Game with Levels and Score", []),
    (
        "examples",
        "Example Games",
        [
            ("example-basics", "Physics Sandbox"),
            ("example-joints", "Joints Playground"),
            ("example-breakout", "Breakout"),
            ("example-platformer", "Platformer"),
            ("example-space-shooter", "Space Shooter"),
        ],
    ),
]

# Built from a file outside docs/src
API_PAGE = ("api", "API Reference", ROOT.parent / "API.md")

# The footer, like the other David Stein sites. This list is a fallback: when the
# page loads, docs.js fetches the current list from davidstein.us/shared/footer.json.
FOOTER_SITES = [
    ["machine.net", "https://machine.net"],
    ["newsnix.com", "https://newsnix.com"],
    ["instructor.cc", "https://instructor.cc"],
    ["p5code.com", "https://p5code.com"],
    ["p5sound.com", "https://p5sound.com"],
    ["midiconductor.com", "https://midiconductor.com"],
    ["procontrols.org", "https://procontrols.org"],
    ["supermod3l.com", "https://supermod3l.com"],
    ["indienewyork.com", "https://indienewyork.com"],
    ["indieboston.com", "https://indieboston.com"],
    ["iHearYouCanCode.com", "https://iHearYouCanCode.com"],
    ["davidstein.us", "http://www.davidstein.us/portfolio/"],
    ["colonelPanix.com", "https://colonelPanix.com"],
]


def footer_html():
    links = " · ".join(
        f'<a href="{url}" target="_blank" rel="noopener">{html.escape(label)}</a>' for label, url in FOOTER_SITES
    )
    return (
        '<footer id="site-footer" class="site-footer">\n'
        '      <span class="footer-credit">© <span class="footer-year">2026</span> '
        '<a href="https://davidstein.us" target="_blank" rel="noopener">David Stein</a> · MIT License · '
        'Physics by <a href="https://brm.io/matter-js/" target="_blank" rel="noopener">Matter.js</a></span>\n'
        f'      <span class="footer-promo">Another David Stein Production: {links}</span>\n'
        "    </footer>"
    )


LAYOUT = """<!DOCTYPE html>
<html lang="en">
<head>
<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-TWCP3RR3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
</script>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title} · GameObjects.js</title>
  <!-- CodeMirror 5 (MIT) makes the demo code editable -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.65.21/lib/codemirror.css" />
  <script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.21/lib/codemirror.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.21/mode/javascript/javascript.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror@5.65.21/addon/edit/matchbrackets.js"></script>
  <link rel="icon" href="../favicon.ico" sizes="any" />
  <link rel="icon" href="../favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="../apple-touch-icon.png" />
  <link rel="stylesheet" href="css/docs.css?v={version}" />
</head>
<body class="page-{slug}">
  <header class="topbar">
    <button class="menu-btn" aria-label="Menu" onclick="document.body.classList.toggle('nav-open')">☰</button>
    <a class="brand" href="../index.html"><span class="logo"><span class="logo-circle">●</span><span class="logo-square">■</span><span class="logo-triangle">▲</span></span> <span class="brand-name">GameObjects.js</span></a>
    <span class="tagline">physics game objects for p5.js</span>
    <nav class="topnav">
      <a href="getting-started.html"{top_learn}>Learn</a>
      <a href="examples.html"{top_examples}>Examples</a>
      <a href="api.html"{top_api}>API</a>
      <a href="api.html#search" class="search-link" title="Search the API" aria-label="Search the API"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg></a>
    </nav>
  </header>
  <nav class="sidebar">
{sidebar}
    <div class="sidebar-foot">
      <a href="../index.html">← Home</a>
    </div>
  </nav>
  <main class="content">
    <p class="section-num">{kicker}</p>
{body}
    <nav class="pager">
      {prev}
      {next}
    </nav>
    {footer}
  </main>
  <script src="js/docs.js?v={version}"></script>
</body>
</html>
"""

DEMO_RE = re.compile(r"^\[\[demo:\s*((?:examples/)?[\w-]+)\s*((?:\|[^\]|]*)*)\]\]\s*$", re.M)


def demo_html(m):
    name = m.group(1)
    width, height, keys = 640, 360, False
    for opt in (o.strip() for o in m.group(2).split("|") if o.strip()):
        if opt == "keys":
            keys = True
        elif re.fullmatch(r"\d+x\d+", opt):
            width, height = (int(v) for v in opt.split("x"))
        elif opt.isdigit():
            height = int(opt)
        else:
            raise SystemExit(f"Unknown demo option '{opt}' for {name}")
    path = ROOT / (f"{name}.js" if name.startswith("examples/") else f"demos/{name}.js")
    if not path.exists():
        raise SystemExit(f"Missing demo: {path.relative_to(ROOT)}")
    hint = ' data-keys="1"' if keys else ""
    return f'<div class="demo" data-sketch="{name}" data-width="{width}" data-height="{height}"{hint}></div>'


def nav_html(current):
    lines = []
    for slug, title, children in PAGES:
        cls = ' class="current"' if current == slug else ""
        item = f'      <li{cls}><a href="{slug}.html">{html.escape(title)}</a>'
        if children:
            subs = "".join(
                f'<li{" class=current" if current == c else ""}><a href="{c}.html">{html.escape(t)}</a></li>'
                for c, t in children
            )
            item += f'<ul class="sub">{subs}</ul>'
        lines.append(item + "</li>")
    return "\n".join(lines)


def learn_sidebar(current):
    return f"""    <ol>
{nav_html(current)}
    </ol>
    <div class="sidebar-ref">
      <a href="api.html"><span class="ref-icon">{{ }}</span> API Reference</a>
    </div>"""


def color_swatches(body):
    """On the API page, each color name in the Color names table becomes a
    swatch you can click to copy. (On GitHub the same table is plain text.)"""
    start = body.find('<h2 id="color-names">')
    if start == -1:
        return body
    end = body.find("<h2", start + 4)
    end = len(body) if end == -1 else end
    section = body[start:end]

    def cell(m):
        names = re.findall(r"<code>([a-z]+)</code>", m.group(1))
        if not names:
            return m.group(0)
        chips = "".join(
            f'<button class="swatch" type="button" data-copy="\'{n}\'" title="Copy \'{n}\'">'
            f'<span class="chip" style="background:{n}"></span><span class="swatch-name">{n}</span></button>'
            for n in names
        )
        return f'<td><div class="swatches">{chips}</div></td>'

    section = re.sub(r"<td>((?:<code>[a-z]+</code>\s*)+)</td>", cell, section)
    return body[:start] + section + body[end:]


def api_sidebar(toc_tokens):
    """The API page's own contents: each ## heading, with its ### headings under it."""
    # toc_tokens is [h1 -> [h2 -> [h3]]]
    sections = toc_tokens[0]["children"] if toc_tokens and toc_tokens[0]["level"] == 1 else toc_tokens
    items = []
    for h2 in sections:
        if h2["id"] == "contents":
            continue
        subs = "".join(f'<li><a href="#{h3["id"]}">{h3["name"]}</a></li>' for h3 in h2.get("children", []))
        sub_html = f'<ul class="sub">{subs}</ul>' if subs else ""
        items.append(f'      <li><a href="#{h2["id"]}">{h2["name"]}</a>{sub_html}</li>')
    return (
        '    <p class="sidebar-title"><span class="ref-icon">{ }</span> API Reference</p>\n'
        '    <div class="api-search" id="search">\n'
        '      <input id="api-search" type="search" placeholder="Search the API…" autocomplete="off" spellcheck="false" aria-label="Search the API" />\n'
        '      <ul class="api-results" hidden></ul>\n'
        '    </div>\n'
        '    <ul class="api-toc">\n' + "\n".join(items) + "\n    </ul>\n"
        '    <div class="sidebar-ref">\n'
        '      <a href="getting-started.html"><span class="ref-icon learn">?</span> Learn GameObjects</a>\n'
        "    </div>"
    )


def pager_link(cls, label, page):
    if not page:
        return "<span></span>"
    slug, title = page
    return f'<a class="{cls}" href="{slug}.html"><small>{label}</small>{html.escape(title)}</a>'


def render(md, slug, title, text, kicker, area, prev=None, nxt=None):
    text = DEMO_RE.sub(demo_html, text)
    md.reset()
    body = md.convert(text)
    if area == "api":
        body = color_swatches(body)
        # API.md links to the Learn pages with full addresses (for GitHub); on the site, keep them local
        body = body.replace('href="https://www.gameobjects.org/docs/', 'href="')
    on = ' class="current" aria-current="page"'
    sidebar = api_sidebar(md.toc_tokens) if area == "api" else learn_sidebar(slug)
    page = LAYOUT.format(
        title=html.escape(title),
        slug=slug,
        sidebar=sidebar,
        top_learn=on if area == "learn" else "",
        top_examples=on if area == "examples" else "",
        top_api=on if area == "api" else "",
        body=body,
        version=VERSION,
        kicker=kicker,
        footer=footer_html(),
        prev=pager_link("prev", "Previous", prev),
        next=pager_link("next", "Next", nxt),
    )
    (ROOT / f"{slug}.html").write_text(page, encoding="utf-8")
    print(f"built {slug}.html")


def build():
    md = markdown.Markdown(extensions=["fenced_code", "tables", "toc", "attr_list"])

    # reading order: every page and sub-page, for the Previous / Next links
    order = []
    for slug, title, children in PAGES:
        order.append((slug, title))
        order.extend(children)

    titles = dict(order)
    parent_of = {c: (slug, title) for slug, title, children in PAGES for c, _ in children}
    section_num = {slug: i + 1 for i, (slug, _, _) in enumerate(PAGES)}

    for i, (slug, title) in enumerate(order):
        text = (SRC / f"{slug}.md").read_text(encoding="utf-8")
        if slug in parent_of:
            p_slug, p_title = parent_of[slug]
            kicker = f'<a href="{p_slug}.html">{html.escape(p_title)}</a> › {html.escape(title)}'
        else:
            kicker = f"Section {section_num[slug]} of {len(PAGES)}"
        area = "examples" if slug == "examples" or parent_of.get(slug, (None,))[0] == "examples" else "learn"
        render(
            md, slug, titles[slug], text, kicker, area,
            prev=order[i - 1] if i > 0 else None,
            nxt=order[i + 1] if i < len(order) - 1 else None,
        )

    # the API reference, from the project's API.md (links adjusted for docs/)
    slug, title, path = API_PAGE
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"\n## Contents\n.*?\n---\n", "\n", text, flags=re.S)
    text = re.sub(r"\]\(docs/", "](", text)
    text = re.sub(r"\]\((README|LICENSE|API)\.md", r"](../\1.md", text)
    render(md, slug, title, text, "Reference", "api")

    # the home page isn't built from Markdown, but it uses the same files
    home = ROOT.parent / "index.html"
    page = home.read_text(encoding="utf-8")
    page = re.sub(r'docs/css/docs\.css(\?v=\w+)?"', f'docs/css/docs.css?v={VERSION}"', page)
    page = re.sub(r'docs/js/docs\.js(\?v=\w+)?"', f'docs/js/docs.js?v={VERSION}"', page)
    page = re.sub(r"<footer[^>]*>.*?</footer>", lambda m: footer_html(), page, count=1, flags=re.S)
    home.write_text(page, encoding="utf-8")
    print(f"updated index.html (version {VERSION})")


if __name__ == "__main__":
    build()

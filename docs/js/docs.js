// GameObjects.js help site: code highlighting + live demos
(function () {
  'use strict';

  // The site version, from this script's own address (docs.js?v=...). It's added
  // to the demo addresses so browsers never run an old saved copy.
  let VERSION = '';
  try {
    VERSION = new URL(document.currentScript.src).searchParams.get('v') || '';
  } catch (e) {}
  let withVersion = (url) => (VERSION ? url + (url.includes('?') ? '&' : '?') + 'v=' + VERSION : url);

  // ---------------------------------------------------------------------------
  // A small JavaScript highlighter (no dependencies)
  // ---------------------------------------------------------------------------
  let KEYWORDS = new Set(
    ('let const var function return if else for while do of in new class extends super this ' +
      'true false null undefined async await break continue switch case default typeof instanceof try catch')
      .split(' ')
  );
  let LIB = new Set(['GameWorld', 'GameObject', 'GameGroup', 'GameObjects', 'world']);
  let P5 = new Set(
    ('setup draw createCanvas background fill stroke noFill noStroke strokeWeight text textSize textAlign ' +
      'random floor round abs min max constrain dist width height mouseX mouseY mouseIsPressed keyIsDown ' +
      'keyPressed mousePressed key keyCode loadImage loadSound image frameCount createGraphics line rect ' +
      'circle ellipse push pop translate rotate color lerp map sin cos PI LEFT_ARROW RIGHT_ARROW UP_ARROW ' +
      'DOWN_ARROW CENTER LEFT RIGHT TOP storeItem getItem userStartAudio millis noSmooth')
      .split(' ')
  );

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlight(src) {
    let out = '';
    let i = 0;
    let prevSig = ''; // previous significant char, to tell a property from a variable
    let n = src.length;
    while (i < n) {
      let c = src[i];
      let rest = src.slice(i);
      let m;
      if (rest.startsWith('//')) {
        let end = src.indexOf('\n', i);
        let tok = end === -1 ? rest : src.slice(i, end);
        out += `<span class="t-com">${esc(tok)}</span>`;
        i += tok.length;
        continue;
      }
      if (rest.startsWith('/*')) {
        let end = src.indexOf('*/', i + 2);
        let tok = end === -1 ? rest : src.slice(i, end + 2);
        out += `<span class="t-com">${esc(tok)}</span>`;
        i += tok.length;
        continue;
      }
      if (c === '"' || c === "'" || c === '`') {
        let j = i + 1;
        while (j < n && src[j] !== c) {
          if (src[j] === '\\') j++;
          j++;
        }
        let tok = src.slice(i, j + 1);
        out += `<span class="t-str">${esc(tok)}</span>`;
        i = j + 1;
        prevSig = c;
        continue;
      }
      if ((m = /^\d+(\.\d+)?/.exec(rest))) {
        out += `<span class="t-num">${m[0]}</span>`;
        i += m[0].length;
        prevSig = '0';
        continue;
      }
      if ((m = /^[A-Za-z_$][\w$]*/.exec(rest))) {
        let w = m[0];
        let isCall = /^\s*\(/.test(src.slice(i + w.length));
        let cls = '';
        if (prevSig === '.') cls = isCall ? 't-fn' : 't-prop';
        else if (KEYWORDS.has(w)) cls = 't-kw';
        else if (LIB.has(w)) cls = 't-lib';
        else if (P5.has(w)) cls = 't-p5';
        else if (isCall) cls = 't-fn';
        out += cls ? `<span class="${cls}">${w}</span>` : w;
        i += w.length;
        prevSig = 'a';
        continue;
      }
      out += esc(c);
      if (!/\s/.test(c)) prevSig = c;
      i++;
    }
    return out;
  }

  document.querySelectorAll('pre code').forEach((el) => {
    let cls = el.className || '';
    if (cls.includes('language-js') || cls.includes('language-javascript') || cls === '') {
      el.innerHTML = highlight(el.textContent);
    }
  });

  // API page: highlight the sidebar link for the section you're reading
  let tocLinks = [...document.querySelectorAll('.api-toc a')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    let byId = new Map(tocLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    let headings = [...document.querySelectorAll('.content h2[id], .content h3[id]')].filter((h) => byId.has(h.id));
    let current = null;
    let setActive = (id) => {
      if (id === current) return;
      current = id;
      tocLinks.forEach((a) => a.classList.remove('active'));
      let link = byId.get(id);
      if (link) {
        link.classList.add('active');
        let side = document.querySelector('.sidebar');
        let r = link.getBoundingClientRect(), sr = side.getBoundingClientRect();
        if (r.top < sr.top + 40 || r.bottom > sr.bottom - 40) side.scrollTop += r.top - sr.top - sr.height / 2;
      }
    };
    let onScroll = () => {
      let id = headings.length ? headings[0].id : null;
      for (let h of headings) {
        if (h.getBoundingClientRect().top < 120) id = h.id;
        else break;
      }
      setActive(id);
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    // close the mobile menu after picking a section
    tocLinks.forEach((a) => a.addEventListener('click', () => document.body.classList.remove('nav-open')));
  }

  // ---------- API search ----------
  let searchBox = document.getElementById('api-search');
  if (searchBox) {
    let results = document.querySelector('.api-results');
    let toc = document.querySelector('.api-toc');
    let clean = (t) => t.replace(/\s+/g, ' ').trim();
    let entries = [];
    let h2 = '', h3 = '';
    let rowCount = 0;
    document.querySelectorAll('.content h2[id], .content h3[id], .content tbody tr').forEach((el) => {
      if (el.tagName === 'H2') {
        h2 = clean(el.textContent);
        h3 = '';
        entries.push({ name: h2, where: 'Section', desc: '', el });
      } else if (el.tagName === 'H3') {
        h3 = clean(el.textContent);
        entries.push({ name: h3, where: h2, desc: '', el });
      } else {
        let cells = [...el.children];
        if (!cells.length) return;
        if (!el.id) el.id = 'api-row-' + ++rowCount;
        let name = clean(cells[0].textContent);
        let where = h3 ? h2 + ' › ' + h3 : h2;
        let swatchNames = [...el.querySelectorAll('.swatch-name')].map((n) => n.textContent);
        if (swatchNames.length) {
          // the Color names table: each color is its own result
          swatchNames.forEach((n) => entries.push({ name: n, where: where + ' › ' + name, desc: 'color name', el }));
          entries.push({ name, where, desc: swatchNames.join(', '), el });
          return;
        }
        let desc = clean(cells.slice(1).map((c) => c.textContent).join(' · '));
        entries.push({ name, where, desc, el });
      }
    });
    let plain = (t) => t.toLowerCase().replace(/[()`'"]/g, '');

    let score = (e, words) => {
      let name = plain(e.name), all = name + ' ' + plain(e.where) + ' ' + plain(e.desc);
      let s = 0;
      for (let w of words) {
        if (!all.includes(w)) return 0;
        if (name === w) s += 100;
        else if (name.split(/[\s,.(]+/).some((part) => part.startsWith(w))) s += 50;
        else if (name.includes(w)) s += 30;
        else if (plain(e.where).includes(w)) s += 10;
        else s += 3;
      }
      return s;
    };
    let escapeHtml = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    let shown = [], selected = 0;

    let render = () => {
      let q = plain(searchBox.value).trim();
      if (!q) {
        results.hidden = true;
        toc.hidden = false;
        return;
      }
      let words = q.split(/\s+/);
      shown = entries
        .map((e) => ({ e, s: score(e, words) }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 40)
        .map((r) => r.e);
      selected = 0;
      toc.hidden = true;
      results.hidden = false;
      if (!shown.length) {
        results.innerHTML = '<li class="none">Nothing found</li>';
        return;
      }
      results.innerHTML = shown
        .map(
          (e, i) =>
            `<li><a href="#${e.el.id}" data-i="${i}"${i === 0 ? ' class="sel"' : ''}>` +
            `<code>${escapeHtml(e.name)}</code><span class="where">${escapeHtml(e.where)}</span>` +
            (e.desc ? `<span class="desc">${escapeHtml(e.desc.length > 90 ? e.desc.slice(0, 88) + '…' : e.desc)}</span>` : '') +
            `</a></li>`
        )
        .join('');
    };
    let go = (e) => {
      if (!e) return;
      document.body.classList.remove('nav-open');
      let top = e.el.getBoundingClientRect().top + scrollY - 76;
      scrollTo({ top, behavior: 'smooth' });
      history.replaceState(null, '', '#' + e.el.id);
      e.el.classList.remove('search-hit');
      void e.el.offsetWidth; // restart the flash
      e.el.classList.add('search-hit');
      setTimeout(() => e.el.classList.remove('search-hit'), 2000);
    };
    let select = (i) => {
      let links = [...results.querySelectorAll('a')];
      if (!links.length) return;
      selected = (i + links.length) % links.length;
      links.forEach((a, k) => a.classList.toggle('sel', k === selected));
      links[selected].scrollIntoView({ block: 'nearest' });
    };
    searchBox.addEventListener('input', render);
    searchBox.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); select(selected + 1); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); select(selected - 1); }
      else if (ev.key === 'Enter') { ev.preventDefault(); go(shown[selected]); }
      else if (ev.key === 'Escape') { searchBox.value = ''; render(); }
    });
    results.addEventListener('click', (ev) => {
      let a = ev.target.closest('a[data-i]');
      if (!a) return;
      ev.preventDefault();
      go(shown[+a.dataset.i]);
    });
    let focusSearch = () => {
      document.body.classList.add('nav-open'); // on small screens the sidebar is a slide-out menu
      document.querySelector('.sidebar').scrollTop = 0;
      searchBox.focus();
      searchBox.select();
    };
    // the magnifying glass in the top bar, and api.html#search from other pages
    document.querySelectorAll('.search-link').forEach((a) =>
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        focusSearch();
      })
    );
    if (location.hash === '#search') {
      history.replaceState(null, '', location.pathname);
      focusSearch();
    }
    // press / anywhere on the page to search
    addEventListener('keydown', (ev) => {
      if (ev.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) && !document.activeElement.closest('.CodeMirror')) {
        ev.preventDefault();
        focusSearch();
      }
    });
  }

  // Blockquotes that start with "Tip:" or "Watch out:" get a color
  document.querySelectorAll('blockquote').forEach((q) => {
    let t = q.textContent.trim();
    if (/^Tip\b/i.test(t)) q.classList.add('tip');
    if (/^(Watch out|Careful|Warning)\b/i.test(t)) q.classList.add('warn');
  });

  // ---------------------------------------------------------------------------
  // Live demos with editable code
  // ---------------------------------------------------------------------------
  let demos = [];
  let editedCode = {}; // demo id -> code to run (only once the reader presses Run)
  let editors = {};    // demo id -> { editor, markError, clearError }

  // run.html (inside each iframe) talks to the page through this object
  window.GODemos = {
    getCode(id) {
      return editedCode[id];
    },
    reportError(id, message, line) {
      let ed = editors[id];
      if (ed) ed.markError(message, line);
    },
  };

  function makeEditor(host, source, onRun) {
    // CodeMirror if it loaded, otherwise a plain textarea
    if (window.CodeMirror) {
      let cm = window.CodeMirror(host, {
        value: source,
        mode: 'javascript',
        lineNumbers: true,
        indentUnit: 2,
        tabSize: 2,
        matchBrackets: true,
        viewportMargin: Infinity,
        extraKeys: {
          'Ctrl-Enter': onRun,
          'Cmd-Enter': onRun,
          'Shift-Enter': onRun,
          Tab: (c) => (c.somethingSelected() ? c.indentSelection('add') : c.replaceSelection('  ')),
        },
      });
      let marked = null;
      return {
        get: () => cm.getValue(),
        set: (v) => cm.setValue(v),
        onChange: (fn) => cm.on('change', fn),
        refresh: () => cm.refresh(),
        markLine(line) {
          if (marked !== null) cm.removeLineClass(marked, 'background', 'cm-error-line');
          marked = null;
          if (line && line <= cm.lineCount()) {
            marked = line - 1;
            cm.addLineClass(marked, 'background', 'cm-error-line');
            cm.scrollIntoView({ line: marked, ch: 0 }, 60);
          }
        },
      };
    }
    let ta = document.createElement('textarea');
    ta.className = 'plain-editor';
    ta.spellcheck = false;
    ta.value = source;
    ta.rows = Math.min(28, source.split('\n').length + 1);
    ta.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey || e.shiftKey) && e.key === 'Enter') {
        e.preventDefault();
        onRun();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end');
      }
    });
    host.appendChild(ta);
    return {
      get: () => ta.value,
      set: (v) => (ta.value = v),
      onChange: (fn) => ta.addEventListener('input', fn),
      refresh: () => {},
      markLine: () => {},
    };
  }

  document.querySelectorAll('.demo').forEach((box, index) => {
    let name = box.dataset.sketch;
    let id = `demo-${index}`;
    let width = parseInt(box.dataset.width || '640', 10);
    let height = parseInt(box.dataset.height || '360', 10);
    let srcPath = name.startsWith('examples/') ? `${name}.js` : `demos/${name}.js`;
    let fileName = name.split('/').pop() + '.js';
    let fileUrl = withVersion(`demos/run.html?s=${encodeURIComponent(name)}`);
    let runUrl = `${fileUrl}&id=${id}`;

    let icon = (path) =>
      `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
    let ICONS = {
      run: '<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/>',
      reset: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
      code: '<path d="M8 7l-5 5 5 5"/><path d="M16 7l5 5-5 5"/>',
      copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
      open: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
      check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    };

    box.innerHTML = `
      <div class="demo-bar">
        <span class="label">Live demo</span>
        <span class="name">${fileName}</span>
        <span class="edited" hidden>edited</span>
        ${box.dataset.keys ? '<span class="hint">· click the demo, then use the keyboard</span>' : ''}
      </div>
      <div class="demo-stage"><div class="demo-fit"><iframe title="${fileName} demo" loading="lazy" width="${width}" height="${height}"></iframe></div></div>
      <div class="icon-bar" role="toolbar" aria-label="Demo controls">
        <button type="button" class="icon run" data-act="run" title="Run your code (Ctrl/⌘ + Enter)" aria-label="Run">${icon(ICONS.run)}</button>
        <button type="button" class="icon" data-act="reset" title="Reset to the original code" aria-label="Reset" disabled>${icon(ICONS.reset)}</button>
        <span class="divider"></span>
        <button type="button" class="icon" data-act="code" title="Hide the code" aria-label="Hide the code" aria-pressed="true">${icon(ICONS.code)}</button>
        <button type="button" class="icon" data-act="copy" title="Copy the code" aria-label="Copy the code">${icon(ICONS.copy)}</button>
        <a class="icon" href="${fileUrl}" target="_blank" rel="noopener" title="Open the original demo in a new tab" aria-label="Open in a new tab">${icon(ICONS.open)}</a>
        <span class="spacer"></span>
        <span class="status" aria-live="polite"></span>
      </div>
      <div class="code-wrap">
        <div class="error-bar" hidden></div>
        <div class="editor-host"><pre><code>Loading ${name}.js…</code></pre></div>
        <div class="editor-tip">Change the code, then press ▶ or <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> to run it. Your changes aren't saved; ↺ puts the original back.</div>
      </div>`;

    let iframe = box.querySelector('iframe');
    let codeWrap = box.querySelector('.code-wrap');
    let codeBtn = box.querySelector('[data-act="code"]');
    let resetBtn = box.querySelector('[data-act="reset"]');
    let editedTag = box.querySelector('.edited');
    let errorBar = box.querySelector('.error-bar');
    let host = box.querySelector('.editor-host');
    let original = null;
    let editor = null;

    iframe.src = fileUrl;

    function clearError() {
      errorBar.hidden = true;
      errorBar.textContent = '';
      if (editor) editor.markLine(null);
    }

    editors[id] = {
      markError(message, line) {
        errorBar.hidden = false;
        errorBar.textContent = '⚠ ' + message + (line ? `  — line ${line}` : '');
        if (editor && line) editor.markLine(line);
      },
    };

    function run() {
      clearError();
      if (typeof flash === 'function') flash('Running…');
      if (editor) editedCode[id] = editor.get();
      iframe.src = runUrl + '&t=' + Date.now();
      iframe.addEventListener('load', () => iframe.contentWindow && iframe.contentWindow.focus(), { once: true });
    }

    function updateEdited() {
      let changed = editor && editor.get() !== original;
      editedTag.hidden = !changed;
      resetBtn.disabled = !changed;
    }

    box.querySelector('[data-act="run"]').addEventListener('click', run);
    resetBtn.addEventListener('click', () => {
      if (!editor) return;
      editor.set(original);
      delete editedCode[id];
      updateEdited();
      clearError();
      iframe.src = fileUrl + '&t=' + Date.now();
    });
    codeBtn.addEventListener('click', () => {
      codeWrap.hidden = !codeWrap.hidden;
      let label = codeWrap.hidden ? 'Show the code' : 'Hide the code';
      codeBtn.title = label;
      codeBtn.setAttribute('aria-label', label);
      codeBtn.setAttribute('aria-pressed', String(!codeWrap.hidden));
      if (!codeWrap.hidden && editor) editor.refresh();
    });

    let status = box.querySelector('.status');
    let copyBtn = box.querySelector('[data-act="copy"]');
    let statusTimer = null;
    function flash(msg) {
      status.textContent = msg;
      clearTimeout(statusTimer);
      statusTimer = setTimeout(() => (status.textContent = ''), 1600);
    }
    copyBtn.addEventListener('click', async () => {
      let text = editor ? editor.get() : original || '';
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        // older browsers / insecure pages
        let ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      copyBtn.innerHTML = icon(ICONS.check);
      flash('Copied!');
      setTimeout(() => (copyBtn.innerHTML = icon(ICONS.copy)), 1600);
    });

    // big canvases (like the example games) are scaled down to fit the page
    let stage = box.querySelector('.demo-stage');
    let fit = box.querySelector('.demo-fit');
    function fitToPage() {
      let scale = Math.min(1, stage.clientWidth / width);
      iframe.style.transform = scale < 1 ? `scale(${scale})` : '';
      fit.style.width = width * scale + 'px';
      fit.style.height = height * scale + 'px';
    }
    fitToPage();
    if ('ResizeObserver' in window) new ResizeObserver(fitToPage).observe(stage);
    else addEventListener('resize', fitToPage);

    fetch(withVersion(srcPath))
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((src) => {
        original = src.trimEnd() + '\n';
        host.innerHTML = '';
        editor = makeEditor(host, original, run);
        editor.onChange(updateEdited);
      })
      .catch(() => {
        host.querySelector('code').textContent =
          `// Couldn't load ${srcPath} — open this site through a web server (not file://).`;
      });

    demos.push(iframe);
  });

  // Pause demos that are scrolled out of view, to keep the page fast
  if ('IntersectionObserver' in window) {
    let io = new IntersectionObserver((entries) => {
      for (let e of entries) {
        try {
          let w = e.target.contentWindow;
          if (!w || typeof w.loop !== 'function') continue;
          e.isIntersecting ? w.loop() : w.noLoop();
        } catch (err) {
          /* cross-origin or not ready yet */
        }
      }
    });
    demos.forEach((f) => io.observe(f));
  }

  // ---------- Color names page: click a swatch to copy its name ----------
  document.querySelectorAll('.swatch[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      let text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        let ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      let name = btn.querySelector('.swatch-name');
      let old = name.textContent;
      btn.classList.add('copied');
      name.textContent = 'Copied!';
      setTimeout(() => {
        name.textContent = old;
        btn.classList.remove('copied');
      }, 1200);
    });
  });

  // ---------- Footer: the current list of David Stein sites ----------
  let footer = document.getElementById('site-footer');
  if (footer) {
    let year = footer.querySelector('.footer-year');
    if (year) year.textContent = new Date().getFullYear();
    fetch('https://davidstein.us/shared/footer.json')
      .then((r) => r.json())
      .then((f) => {
        let promo = footer.querySelector('.footer-promo');
        if (!promo || !f || !Array.isArray(f.links)) return;
        promo.textContent = (f.credit || 'Another David Stein Production') + ': ';
        f.links.forEach((l, i) => {
          if (!/^https?:\/\//.test(l.url)) return;
          if (i) promo.append(' · ');
          let a = document.createElement('a');
          a.href = l.url;
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = l.label;
          promo.append(a);
        });
      })
      .catch(() => {}); // keep the built-in list if the fetch fails
  }
})();

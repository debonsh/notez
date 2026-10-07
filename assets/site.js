/* ==========================================================================
   zevu.learn — shared site layer
   Vanilla JS, no dependencies, no build. Loaded on every page the sync
   script touched. Degrades to nothing if assets/nav.js is absent, so a
   bare copy of a note file still opens and reads normally.

   Keyboard
     Ctrl/Cmd K   command palette
     [            toggle sidebar
     Esc          close sidebar / palette
     ]            next topic        Alt+Left / Alt+Right
     [ with Shift] previous topic
     t            back to top
   ========================================================================== */

(function () {
  "use strict";

  var NAV = window.__NAV__ || null;
  var CFG = window.ZV_CONFIG || {};

  /* ---------------------------------------------------------------- utils */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ------------------------------------------------- base-URL resolution

     The site has to work at a domain root, inside a Vercel subpath, and
     from file:// with no server. So everything is derived from the resolved
     URL of nav.js rather than from window.location, and the base is kept
     WITHOUT a trailing slash: a base ending in "/" yields
     "https://host//notes/...", and that leading "//" is a
     protocol-relative reference, so a browser would read "notes" as a
     hostname instead of a path. */

  function siteBase() {
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
      var src = scripts[i].getAttribute("src") || "";
      if (!/nav\.js(\?|$)/.test(src)) continue;
      var abs;
      try {
        abs = new URL(src, window.location.href).href;
      } catch (e) {
        abs = src;
      }
      return abs.replace(/assets\/nav\.js(\?.*)?$/, "").replace(/\/+$/, "");
    }
    return "";
  }

  function currentPath(base) {
    var p = window.location.href;
    if (base && p.indexOf(base) === 0) p = p.slice(base.length);
    return decodeURIComponent(p.split("?")[0].split("#")[0])
      .replace(/^\/+/, "")
      .replace(/index\.html$/, "");
  }

  function hrefFor(base, target) {
    if (!target) return base ? base + "/" : "./";
    return base + "/" + target;
  }

  function plural(n, word) {
    return n + " " + word + (n === 1 ? "" : "s");
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ------------------------------------------------------- reading progress */

  function progressBar() {
    var bar = el("div", "zv-progress");
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    var ticking = false;
    function paint() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var pct = h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0;
      bar.style.width = pct + "%";
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(paint);
        }
      },
      { passive: true }
    );
    paint();
    return bar;
  }

  /* ------------------------------------------------------------- visited set
     Per-browser study history, so the tree can show what you have opened.
     Private-mode browsers keep it in memory only.                        */

  var Visited = (function () {
    var key = "zv-visited";
    var set = [];
    try {
      set = JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {
      set = [];
    }
    return {
      has: function (p) {
        return set.indexOf(p) !== -1;
      },
      add: function (p) {
        if (set.indexOf(p) === -1) {
          set.push(p);
          if (set.length > 400) set = set.slice(-400);
          try {
            localStorage.setItem(key, JSON.stringify(set));
          } catch (e) {}
        }
      }
    };
  })();

  /* ------------------------------------------------------------------- FAB */

  function buildFab() {
    var wrap = el("div", "zv-fab");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Page controls");

    function mk(label, kbd, title, onClick) {
      var b = el("button");
      b.type = "button";
      b.title = title;
      b.setAttribute("aria-label", title);
      b.appendChild(document.createTextNode(label));
      if (kbd) {
        var k = el("kbd", null, kbd);
        b.appendChild(k);
      }
      b.addEventListener("click", onClick);
      wrap.appendChild(b);
      return b;
    }

    mk("⌕ search", "K", "Search notes (Ctrl+K)", function () {
      Palette.open();
    });

    mk("☰ notes", null, "Open notes index", function () {
      Sidebar.toggle();
    });

    mk("≡ sections", null, "Sections on this page", function () {
      Outline.toggle();
    });

    mk("◎ focus", "F", "Focus mode: hide the chrome", function () {
      toggleFocus();
    });

    mk("? keys", null, "Keyboard shortcuts", function () {
      KeySheet.toggle();
    });

    var top = mk("▲ top", "T", "Back to top", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener(
      "scroll",
      function () {
        top.classList.toggle("zv-fab-hide", window.scrollY < 400);
      },
      { passive: true }
    );

    document.body.appendChild(wrap);
    return wrap;
  }

  /* --------------------------------------------------------------- sidebar */

  var Sidebar = (function () {
    var root, scrim, built = false;

    function link(entry, base, here, opts) {
      opts = opts || {};
      var a = el("a", "zv-tree-link");
      a.href = hrefFor(base, entry.path);
      a.title = entry.title;
      if (entry.path === here) a.setAttribute("aria-current", "page");
      if (opts.num) a.appendChild(el("span", "zv-n", opts.num));
      a.appendChild(el("span", "zv-t", entry.short || entry.title));
      if (opts.badge) a.appendChild(el("span", "zv-badge", opts.badge));
      if (Visited.has(entry.path)) a.setAttribute("data-visited", "1");
      return a;
    }

    function build() {
      if (built || !NAV) return;
      built = true;

      root = el("nav", "zv-side");
      root.setAttribute("aria-label", "Notes index");
      root.setAttribute("data-open", "0");

      var head = el("div", "zv-side-head");
      head.appendChild(el("span", "zv-side-title", "zevu:~/learn"));
      head.appendChild(el("span", "zv-side-user", "bt1"));
      var close = el("button", null, "esc");
      close.type = "button";
      close.title = "Close (Esc)";
      close.addEventListener("click", function () {
        toggle(false);
      });
      head.appendChild(close);
      root.appendChild(head);

      var body = el("div", "zv-side-body");
      var base = siteBase();
      var here = currentPath(base);

      body.appendChild(el("div", "zv-tree-label", "start"));
      var home = el("a", "zv-tree-link");
      home.href = hrefFor(base, "");
      home.appendChild(el("span", "zv-n", "~/"));
      home.appendChild(el("span", "zv-t", "Home"));
      body.appendChild(home);

      NAV.subjects.forEach(function (s) {
        body.appendChild(el("div", "zv-tree-label", s.code + " · " + s.title));

        s.extra.forEach(function (p) {
          var g = el("div", "zv-tree-group");
          g.appendChild(link(p, base, here));
          body.appendChild(g);
        });

        s.units.forEach(function (u) {
          var g = el("div", "zv-tree-group");
          var row = el("div", "zv-tree-row");
          row.setAttribute("data-open", "1");

          var isOpen = u.pages.some(function (p) {
            return p.path === here;
          });
          row.setAttribute("data-open", isOpen ? "1" : "0");

          var caret = el("button", "zv-tree-caret");
          caret.type = "button";
          caret.setAttribute("aria-label", "Toggle " + u.title);
          var arrow = el("span", "zv-arrow", "▾");
          caret.appendChild(arrow);
          caret.addEventListener("click", function () {
            row.setAttribute(
              "data-open",
              row.getAttribute("data-open") === "1" ? "0" : "1"
            );
          });
          row.appendChild(caret);
          row.appendChild(link(u, base, here, { badge: u.pages.length }));

          g.appendChild(row);

          var sub = el("div", "zv-tree-sub");
          u.pages.forEach(function (p) {
            // the unit row already links to the hub, so listing it again
            // would show the same destination twice
            if (p.kind === "hub") return;
            var base_name = p.path.split("/").pop();
            sub.appendChild(
              link(p, base, here, {
                num: /^\d{2}-/.test(base_name) ? base_name.slice(0, 2) : "",
                badge: p.kind === "sheet" ? "sheet" : "",
              })
            );
          });
          g.appendChild(sub);
          body.appendChild(g);
        });
      });

      root.appendChild(body);

      var foot = el("div", "zv-side-foot");
      foot.appendChild(
        el("span", null, "zevu.learn · static build")
      );
      root.appendChild(foot);

      scrim = el("div", "zv-scrim");
      scrim.addEventListener("click", function () {
        toggle(false);
      });

      document.body.appendChild(scrim);
      document.body.appendChild(root);
    }

    function toggle(force) {
      if (!NAV) return;
      build();
      var open = force != null ? force : root.getAttribute("data-open") !== "1";
      root.setAttribute("data-open", open ? "1" : "0");
      scrim.setAttribute("data-open", open ? "1" : "0");
      document.body.style.overflow = open ? "hidden" : "";
      if (open) {
        var cur = root.querySelector('[aria-current="page"]');
        if (cur) cur.scrollIntoView({ block: "center" });
      }
    }

    return {
      toggle: toggle,
      close: function () {
        toggle(false);
      },
      isOpen: function () {
        return !!(root && root.getAttribute("data-open") === "1");
      }
    };
  })();

  /* ------------------------------------------------------ command palette */

  var Palette = (function () {
    var box, input, list, idx = 0, rows = [];

    function build() {
      box = el("div", "zv-cmdk");
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.setAttribute("aria-label", "Search notes");
      box.setAttribute("data-open", "0");

      var inner = el("div", "zv-cmdk-box");

      var bar = el("div", "zv-cmdk-input");
      bar.appendChild(el("span", "zv-sign", "$"));
      input = el("input");
      input.type = "search";
      input.placeholder = "find a topic, unit, or formula sheet…";
      input.setAttribute("aria-label", "Search notes");
      input.autocomplete = "off";
      bar.appendChild(input);
      inner.appendChild(bar);

      list = el("ul", "zv-cmdk-list");
      list.setAttribute("role", "listbox");
      inner.appendChild(list);

      var foot = el("div", "zv-cmdk-foot");
      [
        ["↑↓", "move"],
        ["↵", "open"],
        ["esc", "close"],
      ].forEach(function (pair) {
        var s = el("span");
        s.appendChild(el("kbd", null, pair[0]));
        s.appendChild(document.createTextNode(pair[1]));
        foot.appendChild(s);
      });
      inner.appendChild(foot);

      box.appendChild(inner);
      document.body.appendChild(box);

      box.addEventListener("mousedown", function (e) {
        if (e.target === box) close();
      });
      input.addEventListener("input", render);
      input.addEventListener("keydown", onKey);
    }

    /* Subsequence match with a light score: prefix > word-start > scattered.
       Good enough for ~30 pages, and it never needs an index file.

       The spread guard matters. A pure subsequence match is far too loose on
       long titles — "calc" matches "System vs Application Software" because
       the letters happen to appear in order, and the result list fills with
       noise. So a scattered match is only accepted when the matched letters
       sit close together; otherwise the page is dropped entirely. */
    function score(needle, hay) {
      var n = needle.toLowerCase();
      var h = hay.toLowerCase();
      if (!n) return 1;
      var i = h.indexOf(n);
      if (i === 0) return 1000 - hay.length;
      if (i > 0) return 700 - i - hay.length / 10;

      var pos = 0;
      var hits = 0;
      var streak = 0;
      var first = -1;
      var last = -1;
      for (var j = 0; j < h.length && pos < n.length; j++) {
        if (h[j] === n[pos]) {
          if (first === -1) first = j;
          last = j;
          streak++;
          hits += 1 + streak;
          pos++;
        } else {
          streak = 0;
        }
      }
      if (pos !== n.length) return -1;
      // every matched letter must fall inside a window a few times the
      // needle length, so real clusters score and coincidences do not
      if (last - first + 1 > n.length * 3) return -1;
      return hits * 4 - hay.length / 10;
    }

    function collect() {
      if (!NAV) return [];
      var base = siteBase();
      var out = [
        { title: "Home", short: "Home", path: "", crumb: "~" },
        {
          title: "Toggle focus mode",
          short: "Focus mode",
          crumb: "action",
          action: "focus",
        },
        {
          title: "Jump to the next topic",
          short: "Next topic",
          crumb: "action",
          action: "next",
        },
        {
          title: "Sections on this page",
          short: "Sections",
          crumb: "action",
          action: "outline",
        },
        {
          title: "Show keyboard shortcuts",
          short: "Shortcuts",
          crumb: "action",
          action: "keys",
        },
      ];
      NAV.subjects.forEach(function (s) {
        s.extra.forEach(function (p) {
          out.push({ title: p.title, short: p.short, path: p.path, crumb: s.code });
        });
        s.units.forEach(function (u) {
          out.push({
            title: s.code + " / " + u.title + " hub",
            short: u.title + " hub",
            path: u.path,
            crumb: s.code,
          });
          u.pages.forEach(function (p) {
            if (p.path === u.path) return;
            out.push({
              title: p.title,
              short: p.short,
              path: p.path,
              crumb: s.code + " / " + u.title,
            });
          });
        });
      });
      return out;
    }

    function render() {
      var q = input.value.trim();
      var all = collect();

      var items;
      if (!q) {
        items = all.slice(0, 40);
      } else {
        items = all
          .map(function (it) {
            // Match the short label, the full <h1>, and the code path, so all
            // three of "arrays", "operating system" and "bt205" land on the
            // right page. A short label alone loses words — the formula
            // sheets are labelled "Unit 1 Calculus" but are what you want
            // when you type "formula".
            return {
              it: it,
              s: Math.max(
                score(q, it.short || it.title),
                score(q, it.title) * 0.9,
                score(q, it.crumb) * 0.6
              ),
            };
          })
          .filter(function (r) {
            return r.s > 0;
          })
          .sort(function (a, b) {
            return b.s - a.s;
          })
          .slice(0, 40)
          .map(function (r) {
            return r.it;
          });
      }

      list.textContent = "";
      rows = [];
      if (!items.length) {
        var none = el("li", "zv-cmdk-empty", "no match — try a topic keyword");
        list.appendChild(none);
        return;
      }

      items.forEach(function (it, i) {
        var li = el("li", "zv-cmdk-item");
        li.setAttribute("role", "option");
        li.setAttribute("data-active", i === 0 ? "1" : "0");
        li.setAttribute("data-path", hrefFor(siteBase(), it.path));
        li.title = it.title;
        li.appendChild(el("span", "zv-ico", it.path ? "›" : "~"));
        li.appendChild(el("span", "zv-label", it.short || it.title));
        li.appendChild(el("span", "zv-crumb", it.crumb));
        li.addEventListener("mouseenter", function () {
          setActive(i);
        });
        li.addEventListener("click", function () {
          go(it);
        });
        list.appendChild(li);
        rows.push(li);
      });
      idx = 0;
    }

    function setActive(i) {
      if (!rows.length) return;
      idx = (i + rows.length) % rows.length;
      rows.forEach(function (r, j) {
        r.setAttribute("data-active", j === idx ? "1" : "0");
      });
      if (rows[idx] && rows[idx].scrollIntoView) {
        rows[idx].scrollIntoView({ block: "nearest" });
      }
    }

    function go(it) {
      if (it.action === "focus") return toggleFocus();
      if (it.action === "next") return step(1);
      if (it.action === "outline") return Outline.toggle();
      if (it.action === "keys") return KeySheet.toggle();
      var base = siteBase();
      window.location.href = hrefFor(base, it.path);
    }

    function onKey(e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive(idx + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive(idx - 1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (rows[idx]) rows[idx].click();
      } else if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
      e.stopPropagation();
    }

    function open() {
      if (!NAV) return;
      if (!box) build();
      box.setAttribute("data-open", "1");
      input.value = "";
      render();
      input.focus();
    }

    function close() {
      if (box) box.setAttribute("data-open", "0");
    }

    return {
      open: open,
      close: close,
      isOpen: function () {
        return !!(box && box.getAttribute("data-open") === "1");
      },
    };
  })();

  /* ------------------------------------------------------ topic sequencing */

  function flatTopics() {
    if (!NAV) return [];
    var out = [];
    NAV.subjects.forEach(function (s) {
      s.extra.forEach(function (p) {
        out.push(p);
      });
      s.units.forEach(function (u) {
        u.pages.forEach(function (p) {
          if (p.kind === "topic") out.push(p);
        });
      });
    });
    return out;
  }

  function step(dir) {
    var base = siteBase();
    var here = currentPath(base);
    var seq = flatTopics();
    var i = seq.findIndex(function (p) {
      return p.path === here;
    });
    if (i === -1) return;
    var j = i + dir;
    if (j < 0 || j >= seq.length) return;
    window.location.href = hrefFor(base, seq[j].path);
  }

  /* ------------------------------------------------------------- comments */

  function mountComments() {
    var host = el("details", "zv-comments");
    var sum = el("summary");
    sum.appendChild(document.createTextNode("Comments & corrections"));
    sum.appendChild(el("span", "zv-count", "0"));
    host.appendChild(sum);
    var body = el("div", "zv-comments-body");
    host.appendChild(body);
    document.body.appendChild(host);

    var g = CFG.giscus || {};
    var configured = g.repo && g.repoId && !/^YOUR_/.test(g.repo);

    if (!configured) {
      var p = el("p", "zv-comments-note");
      p.appendChild(
        document.createTextNode(
          "Comments are not wired up yet. Set " +
            "repo / repoId in web/assets/config.js to enable them (see " +
            "web/README.md § Giscus)."
        )
      );
      body.appendChild(p);
      return;
    }

    var s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.crossOrigin = "anonymous";
    s.setAttribute("data-repo", g.repo);
    s.setAttribute("data-repo-id", g.repoId);
    s.setAttribute("data-category", g.category || "Announcements");
    s.setAttribute("data-category-id", g.categoryId || "");
    s.setAttribute("data-mapping", g.mapping || "pathname");
    s.setAttribute("data-strict", g.strict === false ? "0" : "1");
    s.setAttribute("data-reactions-enabled", g.reactions === false ? "0" : "1");
    s.setAttribute("data-emit-metadata", "0");
    s.setAttribute("data-input-position", "top");
    s.setAttribute("data-theme", "dark_dimmed");
    s.setAttribute("data-lang", "en");
    s.setAttribute("data-loading", "lazy");
    body.appendChild(s);
  }

  /* ------------------------------------------------------------ home page
     tools/sync-web.py bakes the real numbers, the subject cards and the
     file listing into index.html at build time, so the landing page works
     with JS off and link previews see real content. What follows is the
     fallback for opening web/index.html straight out of the repo, before a
     sync has run — it fills the same values client-side. */

  /* Replace {{token}} in text nodes only.

     This must never go through innerHTML. The note pages carry live
     <script> elements for their tab and quiz engines; re-parsing the body to
     swap a couple of numbers would silently recreate those as inert copies
     that never run. A TreeWalker touches text nodes and nothing else. */
  function fillTokens(tokens) {
    if (!document.createTreeWalker || !document.body) return;
    var re = /\{\{[a-z_]+\}\}/;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node;
    var edits = [];

    while ((node = walker.nextNode())) {
      if (re.test(node.nodeValue)) edits.push(node);
    }

    edits.forEach(function (n) {
      n.nodeValue = n.nodeValue.replace(/\{\{([a-z_]+)\}\}/g, function (whole, key) {
        return Object.prototype.hasOwnProperty.call(tokens, key)
          ? String(tokens[key])
          : whole;
      });
    });
  }

  function lsRow(path, name, meta) {
    var a = el("a", "zv-ls-row");
    a.href = hrefFor(siteBase(), path);
    var n = el("span", "zv-name");
    n.appendChild(el("b", null, /^\d{2}-/.test(name) ? "\u203a" : "\u00b7"));
    n.appendChild(document.createTextNode(name));
    a.appendChild(n);
    a.appendChild(el("span", "zv-meta", meta || "html"));
    return a;
  }

  function renderHome() {
    var paletteBtn = document.querySelector("[data-open-palette]");
    if (paletteBtn) {
      paletteBtn.addEventListener("click", function () {
        Palette.open();
      });
    }

    if (!NAV) return;
    var base = siteBase();

    fillTokens({
      n_subjects: NAV.stats.subjects,
      n_units: NAV.stats.units,
      n_topics: NAV.stats.topics,
      n_sheets: NAV.stats.sheets,
      n_quizzes: NAV.stats.quizzes,
      n_pages: NAV.stats.pages,
      generated: NAV.generated,
    });

    var cards = document.querySelector("[data-subject-cards]");
    if (cards && !cards.querySelector(".zv-card")) {
      NAV.subjects.forEach(function (sub) {
        var topics = 0;
        var quizzes = 0;
        sub.units.forEach(function (u) {
          u.pages.forEach(function (p) {
            if (p.kind === "topic") {
              topics++;
              quizzes += p.quizzes || 0;
            }
          });
        });
        var card = el("a", "zv-card");
        card.href = hrefFor(base, sub.units.length ? sub.units[0].path : "");
        var head = el("div", "zv-card-head");
        head.appendChild(el("span", "zv-card-code", sub.code));
        head.appendChild(el("h3", null, sub.title));
        card.appendChild(head);
        card.appendChild(el("p", null, sub.blurb));
        var foot = el("div", "zv-card-foot");
        foot.appendChild(el("span", null, plural(sub.units.length, "unit")));
        foot.appendChild(el("span", null, plural(topics, "topic")));
        foot.appendChild(el("span", null, plural(quizzes, "MCQ")));
        card.appendChild(foot);
        cards.appendChild(card);
      });
    }

    var list = document.querySelector("[data-listing]");
    if (list && !list.querySelector(".zv-ls-row")) {
      var hrow = el("div", "zv-ls-row zv-ls-head");
      hrow.appendChild(el("span", "zv-name", "name"));
      hrow.appendChild(el("span", "zv-meta", "size / contents"));
      list.appendChild(hrow);

      NAV.subjects.forEach(function (sub) {
        var dir = el("div", "zv-ls-row zv-ls-head");
        dir.appendChild(el("span", "zv-name", sub.code + "/ " + sub.title));
        dir.appendChild(el("span", "zv-meta", plural(sub.units.length, "unit")));
        list.appendChild(dir);

        sub.extra.forEach(function (p) {
          list.appendChild(lsRow(p.path, p.path.split("/").pop(), "predicted paper"));
        });
        sub.units.forEach(function (u) {
          list.appendChild(lsRow(u.path, u.dir.split("/").pop() + "/", "hub"));
          u.pages.forEach(function (p) {
            if (p.path === u.path) return;
            list.appendChild(
              lsRow(
                p.path,
                p.path.split("/").pop(),
                p.kind === "sheet"
                  ? "formula sheet"
                  : (p.quizzes || 0) + " mcq"
              )
            );
          });
        });
      });
    }
  }


  /* ------------------------------------------------------ section outline
     Built from the page's own headings at runtime, so it cannot drift from
     the content the way a hand-maintained table of contents would. */

  var Outline = (function () {
    var root;

    function build() {
      root = el("nav", "zv-outline");
      root.setAttribute("aria-label", "Sections on this page");
      root.setAttribute("data-open", "0");
      root.appendChild(el("div", "zv-outline-label", "on this page"));

      var heads = [].slice
        .call(document.querySelectorAll("main h2, main h3"))
        .filter(function (h) {
          // skip headings that belong to the chrome or the comments box
          return !h.closest(".zv-comments, .zevu-footer, .zv-side");
        });

      if (!heads.length) {
        root.appendChild(el("p", "zv-none", "This page has no sections to list."));
        return;
      }

      heads.forEach(function (h, i) {
        if (!h.id) h.id = "s" + (i + 1);
        var a = el("a", null, h.textContent.trim());
        a.href = "#" + h.id;
        a.setAttribute("data-depth", h.tagName === "H3" ? "3" : "2");
        var mark = el("span", "zv-anchor", "#");
        mark.setAttribute("aria-hidden", "true");
        h.appendChild(mark);
        root.appendChild(a);
      });

      document.body.appendChild(root);

      // highlight the section currently in view
      var links = [].slice.call(root.querySelectorAll("a"));
      var onScroll = function () {
        var best = null;
        heads.forEach(function (h) {
          if (h.getBoundingClientRect().top < 120) best = h;
        });
        links.forEach(function (a) {
          a.setAttribute(
            "aria-current",
            best && a.getAttribute("href") === "#" + best.id ? "true" : "false"
          );
        });
      };
      var tick = false;
      window.addEventListener(
        "scroll",
        function () {
          if (!tick) {
            tick = true;
            window.requestAnimationFrame(function () {
              onScroll();
              tick = false;
            });
          }
        },
        { passive: true }
      );
      onScroll();
    }

    return {
      toggle: function () {
        if (!NAV) return;
        if (!root) build();
        var open = root.getAttribute("data-open") !== "1";
        root.setAttribute("data-open", open ? "1" : "0");
        // let the stylesheet push the lesson column instead of covering it
        document.body.classList.toggle("zv-outline-open", open);
      },
    };
  })();

  /* ------------------------------------------------------------- copy to
     A study figure is only useful if you can paste it into your answer
     sheet, so every pre gets a copy button that copies the DECODED text.
     Copying the HTML would paste markup into a Word doc. */

  function wireCopy() {
    [].slice
      .call(document.querySelectorAll("main pre"))
      .forEach(function (pre, i) {
        if (pre.closest(".zv-copy")) return;
        var wrap = el("div", "zv-copy");
        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(pre);

        var btn = el("button", "zv-copy-btn", "copy");
        btn.type = "button";
        btn.setAttribute("aria-label", "Copy this block as plain text");
        btn.addEventListener("click", function () {
          var text = decodeText(pre.textContent || "");
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(ok, bad);
          } else {
            fallbackCopy(text, ok, bad);
          }
          function ok() {
            btn.textContent = "copied";
            btn.setAttribute("data-done", "1");
            window.setTimeout(function () {
              btn.textContent = "copy";
              btn.removeAttribute("data-done");
            }, 1400);
          }
          function bad() {
            btn.textContent = "press ctrl-c";
            window.setTimeout(function () {
              btn.textContent = "copy";
            }, 1800);
          }
        });
        wrap.appendChild(btn);
      });
  }

  function decodeText(s) {
    var ta = document.createElement("textarea");
    ta.innerHTML = s;
    return ta.value.replace(/\u00a0/g, " ");
  }

  function fallbackCopy(text, ok, bad) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:-1000px";
    document.body.appendChild(ta);
    ta.select();
    var done = false;
    try {
      done = document.execCommand("copy");
    } catch (e) {
      done = false;
    }
    document.body.removeChild(ta);
    done ? ok() : bad();
  }

  /* ------------------------------------------------------------ focus mode */

  function toggleFocus() {
    var on = !document.body.classList.contains("zv-focus");
    document.body.classList.toggle("zv-focus", on);
    try {
      localStorage.setItem("zv-focus", on ? "1" : "0");
    } catch (e) {}
  }

  function restoreFocus() {
    try {
      if (localStorage.getItem("zv-focus") === "1") {
        document.body.classList.add("zv-focus");
      }
    } catch (e) {}
  }


  /* ---------------------------------------------------------- hover peek
     Obsidian's signature: hovering an internal link shows the target before
     you commit to leaving the page. Needs fetch(), so it is disabled on
     file:// rather than silently doing nothing. */

  var Peek = (function () {
    var card, timer, hideTimer, cache = {}, lastPath = null;

    function canPeek() {
      if (!NAV) return false;
      // needs fetch(), so it cannot work from a folder
      if (window.location.protocol === "file:") return false;
      if (typeof fetch !== "function") return false;
      // a tap fires mouseover, so on touch the card would flash open and then
      // the tap would navigate anyway. Peeking is a pointer affordance.
      if (window.matchMedia && window.matchMedia("(hover: none)").matches) {
        return false;
      }
      return true;
    }

    function ensure() {
      if (card) return card;
      card = el("div", "zv-peek");
      card.setAttribute("role", "tooltip");
      document.body.appendChild(card);
      return card;
    }

    function fill(data) {
      card.textContent = "";
      card.appendChild(el("div", "zv-peek-kicker", data.kicker || "note"));
      card.appendChild(el("div", "zv-peek-title", data.title || "untitled"));
      if (data.body) card.appendChild(el("div", "zv-peek-body", data.body));
      var foot = el("div", "zv-peek-foot");
      foot.appendChild(el("span", null, data.foot || ""));
      foot.appendChild(el("span", null, "click to open"));
      card.appendChild(foot);
    }

    function scrape(html, path) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var h1 = doc.querySelector("main h1, h1");
      var paras = [].slice.call(doc.querySelectorAll("main p, p"));
      var text = "";
      for (var i = 0; i < paras.length && text.length < 420; i++) {
        var t = (paras[i].textContent || "").replace(/\s+/g, " ").trim();
        if (t.length > 60) text += (text ? " " : "") + t;
      }
      var kicker = doc.querySelector(".kicker");
      return {
        title: h1 ? h1.textContent.replace(/\s+/g, " ").trim() : path,
        body: text.slice(0, 420),
        kicker: kicker ? kicker.textContent.replace(/\s+/g, " ").trim() : "note",
        foot: path.split("/").pop(),
      };
    }

    function place(anchor) {
      var r = anchor.getBoundingClientRect();
      var w = card.offsetWidth;
      var left = Math.min(
        Math.max(8, r.left),
        window.innerWidth - w - 8
      );
      var top = r.bottom + 8;
      // flip above when there is no room below
      if (top + card.offsetHeight > window.innerHeight - 8) {
        top = Math.max(8, r.top - card.offsetHeight - 8);
      }
      card.style.left = left + "px";
      card.style.top = top + "px";
    }

    function show(anchor, path) {
      if (!canPeek()) return;
      if (path === lastPath) return;
      lastPath = path;
      var c = ensure();
      c.setAttribute("data-open", "1");
      if (cache[path]) {
        fill(cache[path]);
        place(anchor);
        return;
      }
      c.textContent = "";
      c.appendChild(el("div", "zv-peek-loading", "loading…"));
      place(anchor);
      fetch(path, { credentials: "same-origin" })
        .then(function (r) {
          return r.ok ? r.text() : null;
        })
        .then(function (html) {
          if (!html) throw new Error("no body");
          var data = scrape(html, path);
          cache[path] = data;
          if (lastPath === path) {
            fill(data);
            place(anchor);
          }
        })
        .catch(function () {
          if (lastPath === path) {
            c.textContent = "";
            c.appendChild(el("div", "zv-peek-title", "Could not load preview"));
          }
        });
    }

    function hide() {
      lastPath = null;
      if (card) card.setAttribute("data-open", "0");
    }

    function wire() {
      if (!canPeek()) return;
      // hrefFor() emits ABSOLUTE urls (that is what keeps the site working
      // from file:// and from a subpath), so a "/^https?:/" guard would throw
      // away every internal link. Decide on the ORIGIN instead.
      function internal(a) {
        var u;
        try {
          u = new URL(a.getAttribute("href"), window.location.href);
        } catch (e) {
          return null;
        }
        if (u.origin !== window.location.origin) return null;
        if (u.protocol !== "http:" && u.protocol !== "https:") return null;
        var base = siteBase();
        var path =
          base && u.href.indexOf(base) === 0
            ? u.href.slice(base.length)
            : u.pathname;
        if (path.indexOf("/notes/") !== 0 && path !== "/" && path !== "") {
          return null;
        }
        return path;
      }

      document.addEventListener("mouseover", function (e) {
        var a = e.target.closest && e.target.closest("a[href]");
        if (!a) return;
        var path = internal(a);
        if (!path) return;
        window.clearTimeout(hideTimer);
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          show(a, path);
        }, 260);
      });
      document.addEventListener("mouseout", function (e) {
        var a = e.target.closest && e.target.closest("a[href]");
        if (!a || !internal(a)) return;
        window.clearTimeout(timer);
        hideTimer = window.setTimeout(hide, 180);
      });
      document.addEventListener("scroll", hide, { passive: true });
    }

    return { wire: wire, hide: hide };
  })();

  /* -------------------------------------------------------- block handles
     Notion puts one gutter affordance on every block. This is a read-only
     site, so the handle does the action that is actually useful here: copy a
     link to this block, which is how you cite a section to a friend. */

  function wireHandles() {
    if (!NAV) return;
    if (window.matchMedia("(hover: none)").matches) return;

    // Content is nested inside .tab-panel wrappers, not a direct child of
    // <main>, so this must be a descendant query. Chrome is excluded: a drag
    // handle on the site's own tab bar or the comments box is nonsense.
    var targets = [].slice
      .call(
        document.querySelectorAll(
          "main h2, main h3, main p, main blockquote, main pre, main table, main li"
        )
      )
      .filter(function (n) {
        return !n.closest(
          ".zevu-header, .zevu-footer, .tab-bar, .zv-comments, .zv-meta, .zv-backlinks, .zv-related"
        );
      });

    targets.forEach(function (el2, i) {
      if (el2.querySelector(":scope > .zv-handle")) return;
      if (!el2.textContent.trim()) return;

      var id = el2.id;
      if (!id) {
        var slug = (el2.textContent || "block")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 40);
        id = (slug || "block") + "-" + (i + 1);
        el2.id = id;
      }

      el2.classList.add("zv-has-handle");
      var b = el("button", "zv-handle", "\u22ee");
      b.type = "button";
      b.title = "Copy link to this block";
      b.setAttribute("aria-label", "Copy link to block: " + el2.textContent.trim().slice(0, 40));
      b.addEventListener("click", function () {
        var url = location.origin + location.pathname + "#" + id;
        navigator.clipboard
          ? navigator.clipboard.writeText(url).then(mark, mark)
          : mark();
        function mark() {
          b.textContent = "✓";
          b.setAttribute("data-done", "1");
          window.setTimeout(function () {
            b.textContent = "⋮";
            b.removeAttribute("data-done");
          }, 1400);
        }
      });
      el2.insertBefore(b, el2.firstChild);
    });
  }

  /* ------------------------------------------------ properties + tags
     A Notion-style properties row, built from data already in nav.js so it
     cannot disagree with the sidebar. */

  function wordCount() {
    var main = document.querySelector("main");
    if (!main) return 0;
    return (main.textContent || "").trim().split(/\s+/).length;
  }

  function metaRow() {
    if (!NAV) return;
    var base = siteBase();
    var here = currentPath(base);
    var subject = null;
    var unit = null;
    NAV.subjects.forEach(function (s) {
      s.units.forEach(function (u) {
        var inUnit = u.pages.some(function (p) {
          return p.path === here;
        });
        if (inUnit) {
          subject = s;
          unit = u;
        }
      });
      s.extra.forEach(function (p) {
        if (p.path === here) subject = s;
      });
    });
    if (!subject) return;

    var h1 = document.querySelector("main h1");
    if (!h1) return;

    var page = null;
    if (unit) {
      unit.pages.forEach(function (p) {
        if (p.path === here) page = p;
      });
    }

    var words = wordCount();
    var mins = Math.max(1, Math.round(words / 220));

    var row = el("dl", "zv-meta");

    function add(k, v) {
      if (v == null || v === "") return;
      var wrap = el("div");
      wrap.appendChild(el("dt", null, k));
      wrap.appendChild(el("dd", null, v));
      row.appendChild(wrap);
    }

    add("subject", subject.code + " " + subject.title);
    if (unit) add("unit", unit.title);
    if (page && page.quizzes) add("practice", plural(page.quizzes, "MCQ"));
    add("read", mins + " min");
    add("words", words.toLocaleString());

    // Tag pills live in the SAME row. They were a second .zv-meta, which drew
    // a second pair of hairlines directly under the first and turned one
    // properties block into two stacked boxes.
    var tags = el("div");
    tags.appendChild(el("dt", null, "tags"));
    var dd = el("dd");
    var mk = function (label, href) {
      var a = el("a", "zv-tag", label);
      if (href) a.href = href;
      dd.appendChild(a);
      dd.appendChild(document.createTextNode(" "));
    };
    mk(subject.code.toLowerCase());
    if (unit) mk(unit.title.toLowerCase().replace(/\s+/g, "-"));
    mk(page && page.quizzes ? "mcqs" : "theory");
    tags.appendChild(dd);
    row.appendChild(tags);

    h1.insertAdjacentElement("afterend", row);
  }

  /* ---------------------------------------------------------- backlinks
     Obsidian's "linked mentions": which other pages point here. Computed by
     scanning the nav's pages, so it stays correct as content is added. */

  function backlinkIndex() {
    var idx = {};
    if (!NAV) return idx;
    NAV.subjects.forEach(function (s) {
      var hub = s.units[0] && s.units[0].path;
      s.units.forEach(function (u) {
        u.pages.forEach(function (p) {
          if (p.path === hub) return; // the hub lists everything; not a mention
          (idx[p.path] = idx[p.path] || []).push(s.code + " hub");
        });
      });
    });
    return idx;
  }

  function wireBacklinks() {
    if (!NAV) return;
    var base = siteBase();
    var here = currentPath(base);
    var idx = backlinkIndex();
    var refs = idx[here];
    if (!refs || !refs.length) return;

    var h1 = document.querySelector("main h1");
    if (!h1) return;

    // Notion shows backlinks as a row of page chips, not a collapsed panel.
    // A bordered box that reads "(1)" when closed looks like an error.
    var wrap = el("div", "zv-backlinks");
    var lab = el("span", "zv-backlinks-label", "linked");
    wrap.appendChild(lab);
    refs.forEach(function (label) {
      var a = el("a", "zv-mention", label);
      a.href = base + "/";
      wrap.appendChild(a);
    });
    h1.insertAdjacentElement("afterend", wrap);
  }

  /* -------------------------------------------------------- prev / next */

  function wireRelated() {
    if (!NAV) return;
    var base = siteBase();
    var here = currentPath(base);
    var seq = flatTopics();
    var i = seq.findIndex(function (p) {
      return p.path === here;
    });
    if (i === -1) return;

    var main = document.querySelector("main");
    if (!main) return;
    var row = el("nav", "zv-related");
    row.setAttribute("aria-label", "Adjacent topics");

    function card(item, dir) {
      if (!item) return;
      var a = el("a");
      a.href = hrefFor(base, item.path);
      a.appendChild(el("span", "zv-dir", dir));
      a.appendChild(
        document.createTextNode(item.short || item.title)
      );
      row.appendChild(a);
    }
    card(seq[i - 1], "\u2190 previous");
    card(seq[i + 1], "next \u2192");
    if (!row.children.length) return;
    main.appendChild(row);
  }

  /* -------------------------------------------------- keyboard help sheet */

  var KeySheet = (function () {
    var box;
    var GROUPS = [
      ["Navigate", [
        ["Ctrl / Cmd + K", "command palette"],
        ["[", "notes index"],
        ["o", "sections on this page"],
        ["]  /  Alt + \u2192", "next topic"],
        ["Alt + \u2190", "previous topic"],
        ["t", "back to top"],
        ["?", "this sheet"],
      ]],
      ["Read", [
        ["f", "focus mode (chrome off)"],
        ["Esc", "close / leave focus mode"],
        ["hover a link", "preview the target page"],
        ["hover a figure", "copy button"],
        ["hover a block", "copy link to block"],
      ]],
      ["Practice", [
        ["click a quiz option", "mark it and show why"],
        ["hub checkboxes", "progress, saved in this browser"],
        ["?", "how progress is stored"],
      ]],
    ];

    function build() {
      box = el("div", "zv-keys");
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.setAttribute("aria-label", "Keyboard shortcuts");
      box.setAttribute("data-open", "0");
      box.addEventListener("mousedown", function (e) {
        if (e.target === box) close();
      });

      var inner = el("div", "zv-keys-box");
      inner.appendChild(el("h2", null, "Keyboard"));
      GROUPS.forEach(function (g) {
        var wrap = el("div", "zv-keys-group");
        wrap.appendChild(el("h3", null, g[0]));
        g[1].forEach(function (row) {
          var r = el("div", "zv-keys-row");
          r.appendChild(el("span", null, row[1]));
          r.appendChild(el("kbd", null, row[0]));
          wrap.appendChild(r);
        });
        inner.appendChild(wrap);
      });
      var close = el("div", "zv-keys-row");
      close.appendChild(el("span", null, "press esc to close"));
      close.appendChild(el("kbd", null, "esc"));
      inner.appendChild(close);
      box.appendChild(inner);
      document.body.appendChild(box);
    }

    function toggle() {
      if (!box) build();
      box.setAttribute("data-open", box.getAttribute("data-open") === "1" ? "0" : "1");
    }
    function close() {
      if (box) box.setAttribute("data-open", "0");
    }
    return { toggle: toggle, close: close, isOpen: function () {
      return !!(box && box.getAttribute("data-open") === "1");
    } };
  })();

  /* ------------------------------------------------------------------ boot */

  // Exposed so hand-written pages (404, any future one-off) can drive the
  // shared UI without re-dispatching fake keyboard events.
  window.ZV = {
    search: function () {
      Palette.open();
    },
    index: function () {
      Sidebar.toggle();
    },
    close: function () {
      Palette.close();
      Sidebar.close();
    },
    outline: function () {
      Outline.toggle();
    },
    focus: function () {
      toggleFocus();
    },
    keys: function () {
      KeySheet.toggle();
    },
  };

  function init() {
    progressBar();
    renderHome();

    if (NAV) {
      var base = siteBase();
      var here = currentPath(base);
      Visited.add(here);
    }

    buildFab();
    wireCopy();
    wireHandles();
    metaRow();
    wireBacklinks();
    wireRelated();
    Peek.wire();
    if (NAV) mountComments();

    document.addEventListener("keydown", function (e) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(
        (e.target.tagName || "").toUpperCase()
      );
      if (typing || e.metaKey || e.ctrlKey || e.altKey) {
        if ((e.metaKey || e.ctrlKey) && (e.key || "").toLowerCase() === "k") {
          e.preventDefault();
          Palette.open();
        }
        return;
      }
      if (Palette.isOpen()) {
        if (e.key === "Escape") Palette.close();
        return;
      }
      if (KeySheet.isOpen() && e.key === "Escape") {
        KeySheet.close();
        return;
      }
      if (e.key === "Escape" && document.body.classList.contains("zv-focus")) {
        toggleFocus();
        return;
      }
      switch (e.key) {
        case "Escape":
          Sidebar.close();
          break;
        case "[":
          e.preventDefault();
          Sidebar.toggle(e.shiftKey ? false : undefined);
          break;
        case "]":
          e.preventDefault();
          step(1);
          break;
        case "t":
          window.scrollTo({ top: 0, behavior: "smooth" });
          break;
        case "o":
          Outline.toggle();
          break;
        case "f":
          toggleFocus();
          break;
        case "?":
          KeySheet.toggle();
          break;
      }
    });

    document.addEventListener("keydown", function (e) {
      if (!e.altKey) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

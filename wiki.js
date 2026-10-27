(function () {
  var wiki = window.WIKI || [];
  var toc = document.getElementById("toc");
  var page = document.getElementById("page");
  var q = document.getElementById("q");
  var menu = document.getElementById("menu");

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Клавиши пишутся в тексте как [R] или [Shift+ПКМ] и рисуются кнопками.
  function rich(parent, text, needle) {
    text.split(/(\[[^\]]+\])/).forEach(function (part) {
      if (/^\[[^\]]+\]$/.test(part)) {
        parent.appendChild(el("kbd", null, part.slice(1, -1)));
      } else if (part) {
        mark(parent, part, needle);
      }
    });
  }

  function mark(parent, text, needle) {
    if (!needle) { parent.appendChild(document.createTextNode(text)); return; }
    var low = text.toLowerCase(), i = 0, at;
    while ((at = low.indexOf(needle, i)) !== -1) {
      parent.appendChild(document.createTextNode(text.slice(i, at)));
      parent.appendChild(el("mark", null, text.slice(at, at + needle.length)));
      i = at + needle.length;
    }
    parent.appendChild(document.createTextNode(text.slice(i)));
  }

  function entryText(e) {
    return [e.title, e.lead].concat(e.body || [], e.keys || []).join(" ").toLowerCase().replace(/[\[\]]/g, "");
  }

  function renderEntry(e, needle) {
    var box = el("article", "entry");
    box.id = e.id;
    var h = el("h2");
    var a = el("a");
    a.href = "#" + e.id;
    mark(a, e.title, needle);
    h.appendChild(a);
    box.appendChild(h);
    if (e.lead) { var p = el("p", "lead"); rich(p, e.lead, needle); box.appendChild(p); }
    if (e.body && e.body.length) {
      var ul = el("ul");
      e.body.forEach(function (line) { var li = el("li"); rich(li, line, needle); ul.appendChild(li); });
      box.appendChild(ul);
    }
    if (e.keys && e.keys.length) {
      var k = el("div", "keys");
      k.appendChild(el("b", null, "Как: "));
      e.keys.forEach(function (line, i) {
        if (i) k.appendChild(document.createTextNode(" · "));
        rich(k, line, needle);
      });
      box.appendChild(k);
    }
    return box;
  }

  function buildToc() {
    wiki.forEach(function (s) {
      var li = el("li");
      var a = el("a");
      a.href = "#" + s.id;
      a.dataset.id = s.id;
      a.appendChild(document.createTextNode(s.title));
      a.appendChild(el("span", "n", String(s.entries.length)));
      li.appendChild(a);
      toc.appendChild(li);
    });
  }

  function findSection(id) {
    for (var i = 0; i < wiki.length; i++) {
      if (wiki[i].id === id) return { s: wiki[i] };
      for (var j = 0; j < wiki[i].entries.length; j++) {
        if (wiki[i].entries[j].id === id) return { s: wiki[i], entry: id };
      }
    }
    return { s: wiki[0] };
  }

  function showSection(id) {
    var hit = findSection(id);
    var s = hit.s;
    page.textContent = "";
    page.appendChild(el("h1", null, s.title));
    if (s.intro) page.appendChild(el("p", "intro", s.intro));
    s.entries.forEach(function (e) { page.appendChild(renderEntry(e)); });
    toc.querySelectorAll("a").forEach(function (a) { a.classList.toggle("on", a.dataset.id === s.id); });
    document.title = s.title + " · Вики Темнопустоши";
    if (hit.entry) {
      var target = document.getElementById(hit.entry);
      if (target) target.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }

  function showSearch(needle) {
    page.textContent = "";
    var found = 0;
    page.appendChild(el("h1", null, "Поиск"));
    var intro = el("p", "intro");
    page.appendChild(intro);
    wiki.forEach(function (s) {
      s.entries.forEach(function (e) {
        if (entryText(e).indexOf(needle) === -1 && s.title.toLowerCase().indexOf(needle) === -1) return;
        found++;
        var box = renderEntry(e, needle);
        var from = el("p", "intro", s.title);
        from.style.margin = "0 0 6px";
        box.insertBefore(from, box.firstChild);
        page.appendChild(box);
      });
    });
    intro.textContent = found ? "Нашлось записей: " + found : "";
    if (!found) page.appendChild(el("p", "empty", "Ничего не нашлось. Попробуй другое слово, например «бинт» или «машина»."));
    toc.querySelectorAll("a").forEach(function (a) { a.classList.remove("on"); });
  }

  function route() {
    var id = decodeURIComponent(location.hash.slice(1));
    showSection(id);
  }

  buildToc();
  q.addEventListener("input", function () {
    var needle = q.value.trim().toLowerCase();
    if (needle.length >= 2) showSearch(needle); else route();
  });
  toc.addEventListener("click", function () {
    q.value = "";
    toc.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  });
  menu.addEventListener("click", function () {
    var open = toc.classList.toggle("open");
    menu.setAttribute("aria-expanded", open ? "true" : "false");
  });
  window.addEventListener("hashchange", function () { q.value = ""; route(); });
  route();
})();

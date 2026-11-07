(function () {
  var wiki = window.WIKI || [];
  var toc = document.getElementById("toc");
  var page = document.getElementById("page");
  var q = document.getElementById("q");
  var menu = document.getElementById("menu");
  var status = document.getElementById("search-status");

  function link(id, title, cls) {
    var a = el("a", cls, title);
    a.href = "#" + id;
    return a;
  }

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

  function normalize(text) {
    return text.toLowerCase().replace(/ё/g, "е").replace(/[\[\]]/g, "");
  }

  function entryText(e, section) {
    return normalize([section, e.title, e.lead].concat(e.body || [], e.keys || [], e.tags || []).join(" "));
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
      var ul = el(e.steps ? "ol" : "ul");
      e.body.forEach(function (line) { var li = el("li"); rich(li, line, needle); ul.appendChild(li); });
      box.appendChild(ul);
    }
    if (e.image) {
      var figure = el("figure", "entry-media");
      var imageLink = el("a");
      var img = el("img");
      imageLink.href = e.image.src;
      img.src = e.image.src;
      img.alt = e.image.alt;
      img.width = e.image.width;
      img.height = e.image.height;
      img.loading = "lazy";
      imageLink.appendChild(img);
      figure.appendChild(imageLink);
      figure.appendChild(el("figcaption", null, e.image.caption));
      box.appendChild(figure);
    }
    if (e.keys && e.keys.length) {
      var k = el("div", "keys");
      e.keys.forEach(function (line) {
        var row = el("div");
        rich(row, line, needle);
        k.appendChild(row);
      });
      box.appendChild(k);
    }
    if (e.links) {
      var related = el("nav", "entry-links");
      related.setAttribute("aria-label", "По теме");
      e.links.forEach(function (item) { related.appendChild(link(item[0], item[1])); });
      box.appendChild(related);
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

  function renderHome() {
    var hero = el("section", "wiki-hero");
    var picture = el("img");
    picture.src = "media/hero.jpg";
    picture.alt = "";
    hero.appendChild(picture);
    hero.appendChild(el("p", "eyebrow", "Справочник игрока"));
    hero.appendChild(el("h1", null, "Вики Темнопустоши"));
    hero.appendChild(el("p", null, "От первого выхода из Порога до своей каморки. Здесь собраны гайды по игре."));
    page.appendChild(hero);
    var quick = el("nav", "chapter");
    quick.setAttribute("aria-label", "Быстрый доступ");
    quick.appendChild(link("setup", "Как зайти"));
    quick.appendChild(link("keys", "Управление"));
    quick.appendChild(link("roleplay", "Ролевая игра"));
    page.appendChild(quick);
    page.appendChild(el("h2", "wiki-heading", "С чего начать"));
    var cards = el("nav", "card-grid");
    cards.setAttribute("aria-label", "С чего начать");
    [
      ["first-route", "Первые шаги", "Порог и первая вылазка.", "field-camp.png"],
      ["crafting", "Ремесло", "Верстаки, чертежи и материалы.", "vesti7-stations.png"],
      ["artifacts", "Диковины", "Что можно принести из вылазки.", "vesti7-artifacts.png"],
      ["territory", "Каморки", "Где хранить добычу и обустроить жильё.", "field-room.png"],
      ["armor", "Броня", "Снаряжение для вылазок.", "vesti7-plitnik.png"],
      ["cars", "Транспорт", "Мотоцикл, машины и горючее.", "wiki-motorcycle.webp"]
    ].forEach(function (item) {
      var card = link(item[0], null, "wiki-card");
      var image = el("img");
      image.src = item[3];
      image.alt = "";
      card.appendChild(image);
      card.appendChild(el("strong", null, item[1]));
      card.appendChild(el("span", null, item[2]));
      cards.appendChild(card);
    });
    page.appendChild(cards);
    var index = el("section", "guide-index");
    index.id = "guide-index";
    index.appendChild(el("h2", "wiki-heading", "Все разделы"));
    var groups = el("div", "guide-routes");
    wiki.forEach(function (section) {
      var a = link(section.id === "start" ? "setup" : section.id, section.title, "guide-route");
      a.appendChild(el("span", null, section.intro));
      groups.appendChild(a);
    });
    index.appendChild(groups);
    page.appendChild(index);
  }

  function renderReader(section, entryId) {
    var path = el("nav", "breadcrumb");
    path.setAttribute("aria-label", "Путь к статье");
    path.appendChild(link("start", "Вики"));
    path.appendChild(document.createTextNode(" / " + section.title));
    page.appendChild(path);
    page.appendChild(el("h1", null, section.title));
    if (section.intro) page.appendChild(el("p", "intro", section.intro));
    var grid = el("div", "reader-grid");
    var content = el("div");
    var chapter = el("nav", "chapter");
    chapter.setAttribute("aria-label", "В этом разделе");
    section.entries.forEach(function (entry) {
      chapter.appendChild(link(entry.id, entry.title));
      if (!entryId || entry.id === entryId) content.appendChild(renderEntry(entry));
    });
    grid.appendChild(content);
    grid.appendChild(chapter);
    page.appendChild(grid);
  }

  function showSection(id) {
    var hit = findSection(id);
    var section = hit.s;
    var home = section.id === "start" && !hit.entry;
    page.textContent = "";
    if (home) renderHome();
    else renderReader(section, hit.entry);
    toc.querySelectorAll("a").forEach(function (a) {
      var active = a.dataset.id === section.id;
      a.classList.toggle("on", active);
      if (active) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
    document.title = (home ? "Вики" : section.title) + " · Темнопустошь";
    if (id === "guide-index") document.getElementById(id).scrollIntoView();
    else window.scrollTo(0, 0);
  }


  function showSearch(query) {
    var needle = normalize(query);
    var terms = needle.split(/\s+/);
    page.textContent = "";
    var found = 0;
    page.appendChild(el("h1", null, "Поиск"));
    var intro = el("p", "intro");
    page.appendChild(intro);
    wiki.forEach(function (s) {
      s.entries.forEach(function (e) {
        var haystack = entryText(e, s.title);
        if (!terms.every(function (term) {
          if (term.length > 1) return haystack.includes(term);
          return haystack.split(/[^\p{L}\p{N}]+/u).includes(term);
        })) return;
        found++;
        var box = renderEntry(e, needle);
        var from = el("p", "intro", s.title);
        from.style.margin = "0 0 6px";
        box.insertBefore(from, box.firstChild);
        page.appendChild(box);
      });
    });
    intro.textContent = found ? "Нашлось записей: " + found : "";
    status.textContent = found ? intro.textContent : "Ничего не нашлось";
    if (!found) page.appendChild(el("p", "empty", "Ничего не нашлось. Попробуй другое слово, например «бинт» или «машина»."));
    toc.querySelectorAll("a").forEach(function (a) { a.classList.remove("on"); a.removeAttribute("aria-current"); });
  }

  function route() {
    var id = location.hash.slice(1);
    try { id = decodeURIComponent(id); } catch (_) { id = ""; }
    status.textContent = "";
    showSection(id);
  }

  buildToc();
  q.addEventListener("input", function () {
    var query = q.value.trim();
    if (query) showSearch(query); else route();
  });
  function closeMenu() {
    q.value = "";
    toc.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  }
  document.addEventListener("click", function (event) {
    var a = event.target.closest("a[href^='#']");
    if (!a || !(page.contains(a) || toc.contains(a)) || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    closeMenu();
    if (a.hash === location.hash) route();
    page.focus({ preventScroll: true });
  });
  menu.addEventListener("click", function () {
    var open = toc.classList.toggle("open");
    menu.setAttribute("aria-expanded", open ? "true" : "false");
  });
  window.addEventListener("hashchange", function () { closeMenu(); route(); });
  route();
})();

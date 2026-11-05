(function () {
  var app = document.getElementById("app");
  var COURSES = window.COURSES || [];
  var SITE = window.SITE || {};
  var manifest = {}; // { folder: [ {name, path, size, group} ] }

  var ICONS = {
    home: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
    cap: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>',
    chevron: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    download: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/></svg>',
    eye: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function initial(doctor) {
    var parts = doctor.replace(/^(Asst\.\s*Prof\.|Assoc\.\s*Prof\.|Prof\.|Dr\.)\s*/i, "").trim();
    return (parts[0] || "?").toUpperCase();
  }

  function fileType(name) {
    var ext = (name.split(".").pop() || "").toLowerCase();
    if (ext === "pdf") return { cls: "pdf", label: "PDF", ext: ext };
    if (ext === "ppt" || ext === "pptx") return { cls: "ppt", label: "PPT", ext: ext };
    if (ext === "doc" || ext === "docx") return { cls: "doc", label: "DOC", ext: ext };
    return { cls: "other", label: ext.toUpperCase().slice(0, 4) || "FILE", ext: ext };
  }

  function prettyName(name) {
    return name.replace(/\.[^.]+$/, "").replace(/[_]+/g, " ");
  }

  function formatSize(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function fileCount(folder) {
    return (manifest[folder] || []).length;
  }

  /* ---------- Home ---------- */
  function renderHome() {
    document.title = SITE.title || "Study Courses";
    app.innerHTML =
      '<nav class="crumbs">' + ICONS.home + '<span class="current">Home</span></nav>' +
      '<div class="page-head">' +
        '<div>' +
          '<div class="title-row"><div class="title-icon">' + ICONS.cap + '</div>' +
          '<h1>' + esc(SITE.title || "Study Courses") + '</h1></div>' +
          '<p class="subtitle">' + esc(SITE.subtitle || "") + '</p>' +
        '</div>' +
        '<div class="search">' + ICONS.search +
          '<input id="q" type="search" placeholder="Search for a course or instructor..." autocomplete="off">' +
        '</div>' +
      '</div>' +
      '<div class="grid" id="grid"></div>';

    var grid = document.getElementById("grid");
    var input = document.getElementById("q");

    function draw() {
      var q = input.value.trim().toLowerCase();
      var list = COURSES.filter(function (c) {
        return !q || c.name.toLowerCase().indexOf(q) > -1 || c.doctor.toLowerCase().indexOf(q) > -1;
      });
      if (!list.length) {
        grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><strong>No courses found</strong>Try a different name.</div>';
        return;
      }
      grid.innerHTML = list.map(function (c) {
        var n = fileCount(c.folder);
        return '<a class="card" href="#/course/' + encodeURIComponent(c.folder) + '">' +
          '<h2>' + esc(c.name) + '</h2>' +
          '<div class="doctor"><span class="avatar">' + esc(initial(c.doctor)) + '</span><span>' + esc(c.doctor) + '</span></div>' +
          '<div class="card-foot"><span class="go">View course ' + ICONS.arrow + '</span>' +
          '<span class="count">' + n + (n === 1 ? ' file' : ' files') + '</span></div>' +
        '</a>';
      }).join("");
    }

    input.addEventListener("input", draw);
    draw();
  }

  /* ---------- Course page ---------- */
  function renderCourse(folder) {
    var course = COURSES.filter(function (c) { return c.folder === folder; })[0];
    if (!course) { location.hash = "#/"; return; }
    document.title = course.name + " | " + (SITE.title || "Study Courses");

    var files = manifest[folder] || [];

    app.innerHTML =
      '<nav class="crumbs"><a href="#/">' + ICONS.home + ' Home</a>' + ICONS.chevron +
        '<a href="#/">Courses</a>' + ICONS.chevron + '<span class="current">' + esc(course.name) + '</span></nav>' +
      '<div class="page-head">' +
        '<div>' +
          '<div class="title-row"><div class="title-icon">' + ICONS.cap + '</div><h1>' + esc(course.name) + '</h1></div>' +
          '<div class="course-meta"><span class="avatar">' + esc(initial(course.doctor)) + '</span>' + esc(course.doctor) + '</div>' +
        '</div>' +
        '<div class="search">' + ICONS.search +
          '<input id="q" type="search" placeholder="Search files..." autocomplete="off"></div>' +
      '</div>' +
      '<div id="list"></div>';

    var list = document.getElementById("list");
    var input = document.getElementById("q");

    function draw() {
      var q = input.value.trim().toLowerCase();
      var shown = files.filter(function (f) { return !q || f.name.toLowerCase().indexOf(q) > -1; });

      if (!files.length) {
        list.innerHTML = '<div class="empty"><strong>No files yet</strong>Summaries for this course will appear here soon.</div>';
        return;
      }
      if (!shown.length) {
        list.innerHTML = '<div class="empty"><strong>No files found</strong>Try a different search.</div>';
        return;
      }

      var groups = {};
      var order = [];
      shown.forEach(function (f) {
        var g = f.group || "Summaries";
        if (!groups[g]) { groups[g] = []; order.push(g); }
        groups[g].push(f);
      });

      list.innerHTML = order.map(function (g) {
        return '<section class="group"><h3>' + esc(g) + '</h3><div class="files">' +
          groups[g].map(fileRow).join("") + '</div></section>';
      }).join("");
    }

    input.addEventListener("input", draw);
    draw();
  }

  function fileRow(f) {
    var t = fileType(f.name);
    var url = encodeURI(f.path);
    var viewUrl = url;
    if (t.ext === "ppt" || t.ext === "pptx" || t.ext === "doc" || t.ext === "docx") {
      // Microsoft's free online viewer (works once the site is public on GitHub Pages)
      var abs = new URL(f.path, location.href.split("#")[0]).href;
      viewUrl = "https://view.officeapps.live.com/op/view.aspx?src=" + encodeURIComponent(abs);
    }
    return '<div class="file">' +
      '<div class="badge ' + t.cls + '">' + esc(t.label) + '</div>' +
      '<div class="file-info"><div class="file-name" title="' + esc(f.name) + '">' + esc(prettyName(f.name)) + '</div>' +
      '<div class="file-size">' + esc(formatSize(f.size)) + '</div></div>' +
      '<div class="actions">' +
        '<a class="btn primary" href="' + viewUrl + '" target="_blank" rel="noopener">' + ICONS.eye + ' View</a>' +
        '<a class="btn" href="' + url + '" download>' + ICONS.download + ' Download</a>' +
      '</div>' +
    '</div>';
  }

  /* ---------- Router ---------- */
  function route() {
    var h = location.hash || "#/";
    var m = h.match(/^#\/course\/(.+)$/);
    if (m) renderCourse(decodeURIComponent(m[1]));
    else renderHome();
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", route);

  fetch("files.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : {}; })
    .catch(function () { return {}; })
    .then(function (data) {
      manifest = data || {};
      route();
    });
})();


(() => {
  const PAGE_SIZE = 40;
  let chunks = [];
  let filtered = [];
  let visibleCount = PAGE_SIZE;
  let activeId = null;
  let applyingUrlState = false;
  let language = "en";

  // Canonical metadata indexes. WCAG titles/section labels repeat across many chunks,
  // and machine translation can occasionally produce inconsistent copies.
  // We choose one stable value per criterion/section instead of trusting the first chunk.
  const canonicalTitles = { en: new Map(), et: new Map() };
  const canonicalSections = { en: new Map(), et: new Map() };

  // Deliberately session-only: nothing here is written to localStorage or kb.json.
  // Refreshing the page clears both edits and attached images.
  const sessionTextEdits = new Map();
  const sessionImages = new Map();

  const $ = id => document.getElementById(id);
  const els = {
    search: $("search"),
    criterion: $("criterionFilter"),
    type: $("typeFilter"),
    reference: $("referenceFilter"),
    section: $("sectionFilter"),
    clear: $("clearFilters"),
    sort: $("sortMode"),
    results: $("results"),
    loadMore: $("loadMore"),
    chunkCount: $("chunkCount"),
    resultCount: $("resultCount"),
    subtitle: $("resultsSubtitle"),
    emptyReader: $("emptyReader"),
    readerContent: $("readerContent"),
    permalink: $("permalink"),
    langEn: $("langEn"),
    langEt: $("langEt"),
    imageInput: $("imageInput"),
    imageDropZone: $("imageDropZone"),
    imageGallery: $("imageGallery"),
  };

  const UI = {
    en: {
      eyebrow: "Prototype knowledge viewer",
      title: "WCAG 2.2 Explorer",
      intro: "Browse the corpus by criterion, supporting document, and section.",
      searchLabel: "Search material",
      searchPlaceholder: "e.g. aria-label, keyboard focus, 1.1.1, G94",
      criterion: "WCAG criterion",
      allCriteria: "All criteria",
      type: "Document type",
      allTypes: "All document types",
      reference: "Reference",
      allReferences: "All references",
      section: "Section",
      allSections: "All sections",
      clear: "Clear filters",
      structure: "Corpus structure",
      material: "Material",
      browse: "Browse W3C source sections",
      textSearch: q => `Text search for “${q}”`,
      shown: n => `${n.toLocaleString()} shown`,
      chunks: n => `${n.toLocaleString()} chunks`,
      select: "Select a section",
      empty: "The original W3C text, metadata, and source link will appear here.",
      provenance: "Provenance",
      document: "Document",
      related: "Related criteria",
      source: "Open original W3C source ↗",
      permalink: "Permalink to this section",
      successCriterion: "WCAG success criterion",
      referencePrefix: "Reference",
      level: x => `Level ${x}`,
      showMore: "Show more",
      sortRelevance: "Sort: relevance",
      sortWcag: "Sort: WCAG",
      sortType: "Sort: document type",
      missingTranslation: "Estonian translation is not available for this section yet. Showing the English source text.",
      editHelp: "Estonian text is editable for this browser session. Refreshing restores kb.json.",
      editSaved: "Session edit saved",
      imagesTitle: "Session images",
      imagesHelp: "Add screenshots or examples to this section. They stay while this page is open and disappear after refresh.",
      addImages: "+ Add images",
      dropImages: "Drop images here, paste from clipboard, or use Add images.",
      removeImage: "Remove",
      imageCount: n => `${n} image${n === 1 ? "" : "s"}`,
      types: {
        criterion: "criterion",
        understanding: "understanding",
        technique: "technique",
        failure: "failure",
      }
    },
    et: {
      eyebrow: "Teadmuskorpuse prototüüp",
      title: "WCAG 2.2 sirvija",
      intro: "Sirvi materjali edukriteeriumi, tugidokumendi ja jaotise järgi.",
      searchLabel: "Otsi materjalist",
      searchPlaceholder: "nt aria-label, klaviatuur, 1.1.1, G94",
      criterion: "WCAG edukriteerium",
      allCriteria: "Kõik kriteeriumid",
      type: "Dokumendi tüüp",
      allTypes: "Kõik dokumenditüübid",
      reference: "Viide",
      allReferences: "Kõik viited",
      section: "Jaotis",
      allSections: "Kõik jaotised",
      clear: "Tühjenda filtrid",
      structure: "Korpuse struktuur",
      material: "Materjal",
      browse: "Sirvi W3C lähtematerjali jaotisi",
      textSearch: q => `Tekstiotsing: „${q}”`,
      shown: n => `${n.toLocaleString("et-EE")} tulemust`,
      chunks: n => `${n.toLocaleString("et-EE")} lõiku`,
      select: "Vali jaotis",
      empty: "Siin kuvatakse W3C tekst, metaandmed ja algallika link.",
      provenance: "Päritolu",
      document: "Dokument",
      related: "Seotud kriteeriumid",
      source: "Ava W3C algallikas ↗",
      permalink: "Püsilink sellele jaotisele",
      successCriterion: "WCAG edukriteerium",
      referencePrefix: "Viide",
      level: x => `Tase ${x}`,
      showMore: "Näita rohkem",
      sortRelevance: "Järjesta: asjakohasus",
      sortWcag: "Järjesta: WCAG",
      sortType: "Järjesta: dokumenditüüp",
      missingTranslation: "Selle jaotise eestikeelne tõlge puudub veel. Kuvatakse ingliskeelne lähtetekst.",
      editHelp: "Eestikeelset teksti saab selle brauseriseansi jooksul muuta. Lehe värskendamine taastab kb.json sisu.",
      editSaved: "Muudatus salvestatud seansiks",
      imagesTitle: "Seansi pildid",
      imagesHelp: "Lisa sellele jaotisele ekraanipilte või näiteid. Need säilivad lehel liikumise ajal ja kaovad pärast värskendamist.",
      addImages: "+ Lisa pilte",
      dropImages: "Lohista pildid siia, kleebi lõikelaualt või kasuta nuppu Lisa pilte.",
      removeImage: "Eemalda",
      imageCount: n => `${n} ${n === 1 ? "pilt" : "pilti"}`,
      types: {
        criterion: "edukriteerium",
        understanding: "selgitus",
        technique: "tehnika",
        failure: "mittevastavuse näide",
      }
    }
  };

  function t() { return UI[language]; }

  function mostCommon(values) {
    const counts = new Map();
    for (const raw of values) {
      const value = String(raw || "").trim();
      if (!value) continue;
      counts.set(value, (counts.get(value) || 0) + 1);
    }
    let best = "";
    let bestCount = -1;
    for (const [value, count] of counts) {
      if (count > bestCount) {
        best = value;
        bestCount = count;
      }
    }
    return best;
  }

  function buildCanonicalMetadata() {
    canonicalTitles.en.clear();
    canonicalTitles.et.clear();
    canonicalSections.en.clear();
    canonicalSections.et.clear();

    const byCriterion = new Map();
    for (const c of chunks) {
      if (!byCriterion.has(c.wcag_id)) byCriterion.set(c.wcag_id, []);
      byCriterion.get(c.wcag_id).push(c);
    }

    for (const [wcagId, group] of byCriterion) {
      const criterionChunks = group.filter(c => c.document_type === "criterion");
      const preferred = criterionChunks.length ? criterionChunks : group;

      const en = mostCommon(preferred.map(c => c.wcag_title_en || c.wcag_title));
      const et = mostCommon(preferred.map(c => c.wcag_title_et));
      canonicalTitles.en.set(wcagId, en || mostCommon(group.map(c => c.wcag_title_en || c.wcag_title)));
      canonicalTitles.et.set(wcagId, et || mostCommon(group.map(c => c.wcag_title_et)));
    }

    const bySection = new Map();
    for (const c of chunks) {
      const canonical = c.section_en || c.section || c.section_et;
      if (!canonical) continue;
      if (!bySection.has(canonical)) bySection.set(canonical, []);
      bySection.get(canonical).push(c);
    }

    for (const [canonical, group] of bySection) {
      canonicalSections.en.set(canonical, mostCommon(group.map(c => c.section_en || c.section)) || canonical);
      canonicalSections.et.set(canonical, mostCommon(group.map(c => c.section_et)) || canonical);
    }
  }

  function titleFor(c) {
    if (!c) return "";
    if (language === "et") return c.wcag_title_et || c.wcag_title_en || c.wcag_title || "";
    return c.wcag_title_en || c.wcag_title || c.wcag_title_et || "";
  }

  function sectionFor(c) {
    if (!c) return "";
    if (language === "et") return c.section_et || c.section_en || c.section || "";
    return c.section_en || c.section || c.section_et || "";
  }

  function textFor(c) {
    if (language === "et") {
      if (sessionTextEdits.has(c.chunk_id)) return sessionTextEdits.get(c.chunk_id);
      return c.text_et || c.text_en || "";
    }
    return c.text_en || c.text_et || "";
  }

  function hasTranslation(c) {
    return !!(c.text_et && c.text_et.trim());
  }

  function norm(s) {
    return (s || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  }

  function tokenize(q) {
    return norm(q).split(/[^\p{L}\p{N}.:-]+/u).filter(Boolean);
  }

  function scoreChunk(c, query) {
    if (!query.trim()) return 1;
    const tokens = tokenize(query);
    const id = norm(c.wcag_id);
    const ref = norm(c.reference_id);
    const title = norm(titleFor(c));
    const section = norm(sectionFor(c));
    const text = norm(textFor(c));
    const phrase = norm(query).trim();
    let score = 0;

    if (id === phrase) score += 60;
    if (ref === phrase) score += 60;
    if (title.includes(phrase)) score += 25;
    if (section.includes(phrase)) score += 20;
    if (text.includes(phrase)) score += 15;

    for (const tok of tokens) {
      let matched = false;
      if (id === tok) { score += 22; matched = true; }
      if (ref === tok) { score += 22; matched = true; }
      if (title.includes(tok)) { score += 9; matched = true; }
      if (section.includes(tok)) { score += 8; matched = true; }
      if (text.includes(tok)) { score += 3; matched = true; }
      if (!matched) return 0;
    }
    return score;
  }

  function compareWcag(a, b) {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const d = (pa[i] || 0) - (pb[i] || 0);
      if (d) return d;
    }
    return 0;
  }

  function setSelect(select, placeholder, values, labelFn = x => x) {
    const current = select.value;
    select.innerHTML = "";
    const first = document.createElement("option");
    first.value = "";
    first.textContent = placeholder;
    select.appendChild(first);
    for (const value of values) {
      const o = document.createElement("option");
      o.value = value;
      o.textContent = labelFn(value);
      select.appendChild(o);
    }
    if ([...select.options].some(o => o.value === current)) select.value = current;
  }

  function initFilters() {
    const criteria = [...new Set(chunks.map(c => c.wcag_id))].sort(compareWcag);
    setSelect(els.criterion, t().allCriteria, criteria, id => {
      const c = chunks.find(x => x.wcag_id === id);
      return `${id} — ${titleFor(c || {})}`;
    });

    setSelect(
      els.type, t().allTypes,
      [...new Set(chunks.map(c => c.document_type).filter(Boolean))].sort(),
      type => t().types[type] || type
    );

    updateDynamicFilters();
  }

  function updateDynamicFilters() {
    const oldRef = els.reference.value;
    const oldSection = els.section.value;

    const base = chunks.filter(c =>
      (!els.criterion.value || c.wcag_id === els.criterion.value) &&
      (!els.type.value || c.document_type === els.type.value)
    );

    const refs = [...new Set(base.map(c => c.reference_id).filter(Boolean))]
      .sort((a,b) => a.localeCompare(b, undefined, {numeric:true}));
    setSelect(els.reference, t().allReferences, refs);

    if ([...els.reference.options].some(o => o.value === oldRef)) els.reference.value = oldRef;

    const secBase = base.filter(c => !els.reference.value || c.reference_id === els.reference.value);
    const sectionMap = new Map();
    for (const c of secBase) {
      const canonical = c.section_en || c.section || c.section_et;
      if (canonical && !sectionMap.has(canonical)) sectionMap.set(canonical, sectionFor(c));
    }

    const canonicalSections = [...sectionMap.keys()].sort((a,b) =>
      sectionMap.get(a).localeCompare(sectionMap.get(b), language === "et" ? "et" : "en")
    );
    setSelect(els.section, t().allSections, canonicalSections, x => sectionMap.get(x) || x);

    if ([...els.section.options].some(o => o.value === oldSection)) els.section.value = oldSection;
  }

  function escapeHtml(s) {
    return String(s || "").replaceAll("&","&amp;").replaceAll("<","&lt;")
      .replaceAll(">","&gt;").replaceAll('"',"&quot;");
  }

  function highlight(s, query) {
    let html = escapeHtml(s);
    for (const tok of tokenize(query).filter(x => x.length >= 2).slice(0,8)) {
      const safe = tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      html = html.replace(new RegExp(`(${safe})`, "ig"), "<mark>$1</mark>");
    }
    return html;
  }

  function typeClass(type) {
    return `type-${(type || "").toLowerCase().replace(/[^a-z]/g,"")}`;
  }

  function renderUiChrome() {
    document.documentElement.lang = language;
    $("uiEyebrow").textContent = t().eyebrow;
    $("uiTitle").textContent = t().title;
    $("uiIntro").textContent = t().intro;
    $("uiSearchLabel").textContent = t().searchLabel;
    els.search.placeholder = t().searchPlaceholder;
    $("uiCriterionLabel").textContent = t().criterion;
    $("uiTypeLabel").textContent = t().type;
    $("uiReferenceLabel").textContent = t().reference;
    $("uiSectionLabel").textContent = t().section;
    $("uiClear").textContent = t().clear;
    $("uiStructureTitle").textContent = t().structure;
    $("resultsTitle").textContent = t().material;
    $("uiSelectSection").textContent = t().select;
    $("uiEmptyText").textContent = t().empty;
    $("uiProvenanceTitle").textContent = t().provenance;
    $("uiProvDoc").textContent = t().document;
    $("uiProvSection").textContent = t().section;
    $("uiProvRelated").textContent = t().related;
    $("uiSourceLink").textContent = t().source;
    $("uiPermalink").textContent = t().permalink;
    $("uiImagesTitle").textContent = t().imagesTitle;
    $("uiImagesHelp").textContent = t().imagesHelp;
    $("uiAddImages").textContent = t().addImages;
    $("uiDropImages").textContent = t().dropImages;
    els.loadMore.textContent = t().showMore;
    els.sort.options[0].textContent = t().sortRelevance;
    els.sort.options[1].textContent = t().sortWcag;
    els.sort.options[2].textContent = t().sortType;
    els.langEn.classList.toggle("active", language === "en");
    els.langEt.classList.toggle("active", language === "et");
    els.langEn.setAttribute("aria-pressed", String(language === "en"));
    els.langEt.setAttribute("aria-pressed", String(language === "et"));
  }

  function applyFilters({syncUrl = true} = {}) {
    updateDynamicFilters();
    const q = els.search.value.trim();

    filtered = chunks
      .filter(c => !els.criterion.value || c.wcag_id === els.criterion.value)
      .filter(c => !els.type.value || c.document_type === els.type.value)
      .filter(c => !els.reference.value || c.reference_id === els.reference.value)
      .filter(c => !els.section.value || (c.section_en || c.section || c.section_et) === els.section.value)
      .map(c => ({...c, _score: scoreChunk(c, q)}))
      .filter(c => c._score > 0);

    if (els.sort.value === "relevance") {
      filtered.sort((a,b) => b._score - a._score || compareWcag(a.wcag_id,b.wcag_id));
    } else if (els.sort.value === "wcag") {
      filtered.sort((a,b) => compareWcag(a.wcag_id,b.wcag_id) ||
        (a.reference_id || "").localeCompare(b.reference_id || "", undefined, {numeric:true}));
    } else {
      filtered.sort((a,b) => (a.document_type || "").localeCompare(b.document_type || "") ||
        compareWcag(a.wcag_id,b.wcag_id));
    }

    visibleCount = PAGE_SIZE;

    // Keep the reader synchronized with the current result set.
    // If the previously-opened chunk is no longer visible after a filter change,
    // open the first matching result instead of leaving stale content on the right.
    const activeStillVisible = activeId && filtered.some(c => c.chunk_id === activeId);
    if (!activeStillVisible && filtered.length) {
      activeId = filtered[0].chunk_id;
    }

    renderResults();

    if (!activeStillVisible && filtered.length) {
      openChunk(activeId, {syncUrl:false, scroll:false});
    } else if (!filtered.length) {
      activeId = null;
      els.readerContent.hidden = true;
      els.emptyReader.hidden = false;
    }

    if (syncUrl) updateUrl({replace:true});
  }

  function renderResults() {
    const shown = filtered.slice(0, visibleCount);
    els.resultCount.textContent = t().shown(filtered.length);
    els.chunkCount.textContent = t().chunks(chunks.length);
    els.subtitle.textContent = els.search.value.trim() ? t().textSearch(els.search.value.trim()) : t().browse;

    els.results.innerHTML = shown.map(c => `
      <button type="button" class="result-card ${c.chunk_id === activeId ? "active" : ""}" data-id="${escapeHtml(c.chunk_id)}">
        <div class="card-top">
          <span class="pill ${typeClass(c.document_type)}">${escapeHtml(t().types[c.document_type] || c.document_type)}</span>
          <span class="pill muted-pill">${escapeHtml(c.wcag_id)}</span>
          ${c.reference_id && c.reference_id !== c.wcag_id ? `<span class="pill muted-pill">${escapeHtml(c.reference_id)}</span>` : ""}
        </div>
        <div class="result-title">${highlight(sectionFor(c), els.search.value)}</div>
        <div class="result-subtitle">${escapeHtml(titleFor(c))}</div>
        <div class="result-snippet">${highlight(textFor(c), els.search.value)}</div>
      </button>
    `).join("");

    els.results.querySelectorAll(".result-card").forEach(btn =>
      btn.addEventListener("click", () => openChunk(btn.dataset.id))
    );
    els.loadMore.hidden = visibleCount >= filtered.length;
  }

  function openChunk(id, {syncUrl = true, scroll = true} = {}) {
    const c = chunks.find(x => x.chunk_id === id);
    if (!c) return;
    activeId = id;

    $("readerType").textContent = t().types[c.document_type] || c.document_type;
    $("readerType").className = `pill ${typeClass(c.document_type)}`;
    $("readerLevel").textContent = c.level ? t().level(c.level) : "WCAG 2.2";
    $("readerTitle").textContent = `${c.wcag_id} ${titleFor(c)}`;
    $("readerReference").textContent =
      c.reference_id && c.reference_id !== c.wcag_id
        ? `${t().referencePrefix}: ${c.reference_id}`
        : t().successCriterion;
    $("readerSection").textContent = sectionFor(c);

    const warning = language === "et" && !hasTranslation(c)
      ? `<div class="translation-missing">${escapeHtml(t().missingTranslation)}</div>` : "";

    if (language === "et") {
      $("readerText").innerHTML = warning + `
        <textarea id="readerTextEdit" class="reader-textarea" aria-label="${escapeHtml(sectionFor(c))}">${escapeHtml(textFor(c))}</textarea>
        <p class="edit-note"><span>${escapeHtml(t().editHelp)}</span> · <strong id="editStatus"></strong></p>
      `;
      const editor = $("readerTextEdit");
      const status = $("editStatus");
      editor.addEventListener("input", () => {
        sessionTextEdits.set(c.chunk_id, editor.value);
        status.textContent = t().editSaved;
      });
    } else {
      $("readerText").innerHTML = `<p>${escapeHtml(textFor(c))}</p>`;
    }

    renderImages(c.chunk_id);

    $("provWcag").textContent = `${c.wcag_id} ${titleFor(c)}`;
    $("provDoc").textContent = [t().types[c.document_type] || c.document_type, c.reference_id].filter(Boolean).join(" · ");
    $("provSection").textContent = sectionFor(c);
    $("provRelated").textContent = (c.related_wcag_ids || [c.wcag_id]).join(", ");
    $("sourceLink").href = c.source_url;

    els.emptyReader.hidden = true;
    els.readerContent.hidden = false;
    renderResults();

    if (syncUrl) updateUrl();
    else updatePermalink();

    if (scroll && window.innerWidth < 1100) {
      $("reader").scrollIntoView({behavior:"smooth", block:"start"});
    }
  }

  function renderImages(chunkId) {
    const images = sessionImages.get(chunkId) || [];
    els.imageGallery.innerHTML = images.map((img, index) => `
      <figure class="image-card">
        <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.name || `Image ${index + 1}`)}">
        <figcaption class="image-card-footer">
          <span class="image-name" title="${escapeHtml(img.name)}">${escapeHtml(img.name)}</span>
          <button type="button" class="image-remove" data-image-id="${escapeHtml(img.id)}">${escapeHtml(t().removeImage)}</button>
        </figcaption>
      </figure>
    `).join("");

    if (images.length) {
      const count = document.createElement("div");
      count.className = "image-count-badge";
      count.textContent = t().imageCount(images.length);
      els.imageGallery.prepend(count);
    }

    els.imageGallery.querySelectorAll(".image-remove").forEach(btn => {
      btn.addEventListener("click", () => removeSessionImage(chunkId, btn.dataset.imageId));
    });
  }

  function addSessionImages(files) {
    if (!activeId) return;
    const imageFiles = [...files].filter(file => file.type && file.type.startsWith("image/"));
    if (!imageFiles.length) return;

    const existing = sessionImages.get(activeId) || [];
    for (const file of imageFiles) {
      existing.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name || "pasted-image.png",
        url: URL.createObjectURL(file),
      });
    }
    sessionImages.set(activeId, existing);
    renderImages(activeId);
  }

  function removeSessionImage(chunkId, imageId) {
    const existing = sessionImages.get(chunkId) || [];
    const target = existing.find(img => img.id === imageId);
    if (target) URL.revokeObjectURL(target.url);
    const remaining = existing.filter(img => img.id !== imageId);
    if (remaining.length) sessionImages.set(chunkId, remaining);
    else sessionImages.delete(chunkId);
    renderImages(chunkId);
  }

  function paramsForState() {
    const p = new URLSearchParams();
    p.set("lang", language);
    if (els.criterion.value) p.set("wcag", els.criterion.value);
    if (els.type.value) p.set("type", els.type.value);
    if (els.reference.value) p.set("ref", els.reference.value);
    if (els.section.value) p.set("section", els.section.value);
    if (els.search.value.trim()) p.set("q", els.search.value.trim());
    if (els.sort.value !== "relevance") p.set("sort", els.sort.value);
    if (activeId) p.set("id", activeId);
    return p;
  }

  function updateUrl({replace=false} = {}) {
    if (applyingUrlState) return;
    const p = paramsForState();
    history[replace ? "replaceState" : "pushState"]({}, "", `${location.pathname}?${p.toString()}`);
    updatePermalink();
  }

  function updatePermalink() {
    if (!activeId) return;
    const c = chunks.find(x => x.chunk_id === activeId);
    if (!c) return;
    const p = new URLSearchParams();
    p.set("lang", language);
    p.set("wcag", c.wcag_id);
    if (c.document_type) p.set("type", c.document_type);
    if (c.reference_id) p.set("ref", c.reference_id);
    if (c.section_en || c.section) p.set("section", c.section_en || c.section);
    p.set("id", c.chunk_id);
    els.permalink.href = `${location.pathname}?${p.toString()}`;
  }

  function applyUrlState() {
    applyingUrlState = true;
    const p = new URLSearchParams(location.search);
    language = p.get("lang") === "et" ? "et" : "en";
    renderUiChrome();
    initFilters();

    const wcag = p.get("wcag") || "";
    const type = p.get("type") || "";
    const ref = p.get("ref") || "";
    const section = p.get("section") || "";
    els.search.value = p.get("q") || "";
    els.sort.value = p.get("sort") || "relevance";

    if ([...els.criterion.options].some(o => o.value === wcag)) els.criterion.value = wcag;
    if ([...els.type.options].some(o => o.value === type)) els.type.value = type;
    updateDynamicFilters();
    if ([...els.reference.options].some(o => o.value === ref)) els.reference.value = ref;
    updateDynamicFilters();
    if ([...els.section.options].some(o => o.value === section)) els.section.value = section;

    applyFilters({syncUrl:false});

    const id = p.get("id");
    let target = id ? chunks.find(c => c.chunk_id === id) : null;
    if (!target && filtered.length) target = filtered[0];
    if (target) openChunk(target.chunk_id, {syncUrl:false, scroll:false});

    applyingUrlState = false;
    updatePermalink();
  }

  function switchLanguage(lang) {
    if (lang === language) return;
    language = lang;
    renderUiChrome();
    initFilters();
    applyFilters({syncUrl:false});
    if (activeId) openChunk(activeId, {syncUrl:false, scroll:false});
    updateUrl();
  }

  function clearFilters() {
    els.search.value = "";
    els.criterion.value = "";
    els.type.value = "";
    els.reference.value = "";
    els.section.value = "";
    els.sort.value = "relevance";
    activeId = null;
    applyFilters({syncUrl:false});
    history.pushState({}, "", `${location.pathname}?lang=${language}`);
  }

  async function init() {
    try {
      const res = await fetch(`kb.json?v=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      chunks = data.chunks || [];
      console.info("WCAG viewer KB loaded", { chunks: chunks.length, text_et: chunks.filter(c => c.text_et && c.text_et.trim()).length, title_et: chunks.filter(c => c.wcag_title_et && c.wcag_title_et.trim()).length, section_et: chunks.filter(c => c.section_et && c.section_et.trim()).length });
      renderUiChrome();
      initFilters();

      if (location.search) applyUrlState();
      else {
        applyFilters({syncUrl:false});
        const first = chunks.find(c => c.document_type === "criterion") || chunks[0];
        if (first) openChunk(first.chunk_id, {syncUrl:false, scroll:false});
        history.replaceState({}, "", `${location.pathname}?lang=${language}`);
      }
    } catch (err) {
      els.results.innerHTML = `<div class="result-card"><strong>Could not load kb.json</strong><div class="result-snippet">${escapeHtml(err.message)}</div></div>`;
    }
  }

  let searchTimer = null;
  els.search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => applyFilters(), 150);
  });

  [els.criterion, els.type, els.reference, els.section, els.sort]
    .forEach(el => el.addEventListener("change", () => applyFilters()));

  els.clear.addEventListener("click", clearFilters);
  els.loadMore.addEventListener("click", () => { visibleCount += PAGE_SIZE; renderResults(); });
  els.langEn.addEventListener("click", () => switchLanguage("en"));
  els.langEt.addEventListener("click", () => switchLanguage("et"));
  window.addEventListener("popstate", () => { if (chunks.length) applyUrlState(); });

  els.imageInput.addEventListener("change", () => {
    addSessionImages(els.imageInput.files);
    els.imageInput.value = "";
  });

  ["dragenter", "dragover"].forEach(eventName => {
    els.imageDropZone.addEventListener(eventName, event => {
      event.preventDefault();
      els.imageDropZone.classList.add("dragover");
    });
  });
  ["dragleave", "drop"].forEach(eventName => {
    els.imageDropZone.addEventListener(eventName, event => {
      event.preventDefault();
      els.imageDropZone.classList.remove("dragover");
    });
  });
  els.imageDropZone.addEventListener("drop", event => addSessionImages(event.dataTransfer.files));
  els.imageDropZone.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      els.imageInput.click();
    }
  });
  document.addEventListener("paste", event => {
    if (!activeId || !event.clipboardData) return;
    const files = [...event.clipboardData.files].filter(file => file.type.startsWith("image/"));
    if (files.length) {
      event.preventDefault();
      addSessionImages(files);
    }
  });

  init();
})();

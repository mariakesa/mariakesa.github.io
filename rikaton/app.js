import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0";

env.allowLocalModels = false;

const MODEL_ID = "Xenova/multilingual-e5-small";
const KB_VERSION = "9fe9056dd8eb";
const CACHE_KEY = `accessibility-e5-vectors-${MODEL_ID}-${KB_VERSION}`;
const TOP_K = 5;

const form = document.querySelector("#search-form");
const queryInput = document.querySelector("#query");
const searchButton = document.querySelector("#search-button");
const status = document.querySelector("#status");
const resultsEl = document.querySelector("#results");
const mvOnly = document.querySelector("#mv-only");
const exampleButtons = document.querySelectorAll(".example");

let kb = [];
let extractor = null;
let documentVectors = null;
let lastQuery = "";

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function setStatus(message) {
  status.textContent = message;
}

function dot(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

function tensorRows(tensor) {
  const dims = tensor.dims;
  const data = Array.from(tensor.data);
  if (dims.length === 1) return [data];
  const rowSize = dims[dims.length - 1];
  const rows = [];
  for (let i = 0; i < data.length; i += rowSize) rows.push(data.slice(i, i + rowSize));
  return rows;
}

async function loadKB() {
  const response = await fetch("./kb.json");
  if (!response.ok) throw new Error(`KB laadimine ebaõnnestus (${response.status})`);
  kb = await response.json();
}

async function loadExtractor() {
  if (extractor) return extractor;
  const preferredDevice = navigator.gpu ? "webgpu" : "wasm";
  setStatus(`Laadin ${MODEL_ID} mudelit (${preferredDevice})…`);

  try {
    extractor = await pipeline("feature-extraction", MODEL_ID, {
      device: preferredDevice,
      progress_callback: (info) => {
        if (info?.status === "progress" && Number.isFinite(info.progress)) {
          setStatus(`Laadin mudelit… ${Math.round(info.progress)}%`);
        }
      }
    });
  } catch (error) {
    if (preferredDevice === "webgpu") {
      console.warn("WebGPU failed; retrying with WASM.", error);
      setStatus("WebGPU ei käivitunud. Proovin CPU/WASM režiimi…");
      extractor = await pipeline("feature-extraction", MODEL_ID, { device: "wasm" });
    } else {
      throw error;
    }
  }
  return extractor;
}

function restoreVectors() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== kb.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveVectors(vectors) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(vectors));
  } catch (error) {
    console.warn("Could not cache KB vectors:", error);
  }
}

async function ensureDocumentVectors() {
  if (documentVectors) return documentVectors;

  const cached = restoreVectors();
  if (cached) {
    documentVectors = cached;
    setStatus("Mudel valmis. Teadmistebaasi vektorid leiti brauseri vahemälust.");
    return documentVectors;
  }

  const pipe = await loadExtractor();
  setStatus(`Esimene käivitus: kodeerin ${kb.length} teadmistebaasi kirjet…`);

  const all = [];
  const batchSize = 8;
  for (let start = 0; start < kb.length; start += batchSize) {
    const batch = kb.slice(start, start + batchSize);
    const output = await pipe(
      batch.map(x => x.embedding_text),
      { pooling: "mean", normalize: true }
    );
    all.push(...tensorRows(output));
    const done = Math.min(start + batch.length, kb.length);
    setStatus(`Esimene käivitus: kodeerin teadmistebaasi… ${done}/${kb.length}`);
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  documentVectors = all;
  saveVectors(all);
  setStatus("Teadmistebaas kodeeritud ja brauserisse salvestatud. Järgmised korrad on kiiremad.");
  return documentVectors;
}

function findingHTML(item) {
  const failures = (item.page_results || []).filter(x => x.status === "MV");
  if (!failures.length) return `<p>Auditis ei ole selle nõude juures testitud lehtedel MV tulemust.</p>`;
  return `<ul class="findings">${failures.map(f =>
    `<li><strong>${esc(f.page)}:</strong> ${esc(f.explanation || "")}</li>`
  ).join("")}</ul>`;
}

function renderResults(scored) {
  if (!scored.length) {
    resultsEl.innerHTML = `<p class="empty">Sobivaid tulemusi ei leitud.</p>`;
    return;
  }

  resultsEl.innerHTML = scored.map(({ item, score }, index) => `
    <article class="result">
      <div class="result-top">
        <div>
          <div class="meta">#${index + 1} · ${esc(item.standard_reference)}</div>
          <h3>${esc(item.requirement_name)}</h3>
          <span class="badge ${item.has_noncompliance ? "mv" : ""}">
            ${item.has_noncompliance ? "Auditis leitud MV" : "MV-d ei leitud"}
          </span>
        </div>
        <div class="score" title="Cosine similarity">sarnasus ${score.toFixed(3)}</div>
      </div>

      <section class="block">
        <h4>Lihtsas keeles <span class="ai-note">AI loodud</span></h4>
        <p>${esc(item.plain_language)}</p>
      </section>

      ${item.has_noncompliance ? `
        <section class="block">
          <h4>Mida audit leidis <span class="source-note">allikas</span></h4>
          ${findingHTML(item)}
        </section>
        <section class="block">
          <h4>Võimalik vastus pöördujale <span class="ai-note">AI loodud</span></h4>
          <p>${esc(item.support_answer)}</p>
        </section>
      ` : ""}

      <details>
        <summary>Vaata rohkem</summary>
        <section class="block">
          <h4>Testimisjuhis <span class="source-note">allikas</span></h4>
          <p>${esc(item.testing_instruction)}</p>
        </section>
        <section class="block">
          <h4>Mõju kasutajale <span class="ai-note">AI loodud</span></h4>
          <p>${esc(item.user_impact)}</p>
        </section>
        <section class="block">
          <h4>Parandamise suund <span class="ai-note">AI loodud</span></h4>
          <p>${esc(item.remediation_direction)}</p>
        </section>
      </details>
    </article>
  `).join("");
}

async function search(query) {
  const normalized = query.trim();
  if (!normalized) return;
  lastQuery = normalized;
  searchButton.disabled = true;

  try {
    const pipe = await loadExtractor();
    const vectors = await ensureDocumentVectors();

    setStatus("Kodeerin küsimuse ja arvutan sarnasused…");
    const q = await pipe(`query: ${normalized}`, { pooling: "mean", normalize: true });
    const queryVector = tensorRows(q)[0];

    const scored = kb.map((item, i) => ({ item, score: dot(queryVector, vectors[i]) }))
      .filter(x => !mvOnly.checked || x.item.has_noncompliance)
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K);

    renderResults(scored);
    setStatus(`Valmis. Näitan ${scored.length} kõige semantiliselt sarnasemat tulemust.`);
  } catch (error) {
    console.error(error);
    setStatus(`Viga: ${error.message || error}`);
    resultsEl.innerHTML = `<p class="empty">Mudeli käivitamine ebaõnnestus. Ava brauseri arendajakonsool ja kontrolli, kas Hugging Face'i mudelifailide laadimine on lubatud.</p>`;
  } finally {
    searchButton.disabled = false;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  search(queryInput.value);
});

exampleButtons.forEach(button => {
  button.addEventListener("click", () => {
    queryInput.value = button.textContent.trim();
    search(queryInput.value);
  });
});

mvOnly.addEventListener("change", () => {
  if (lastQuery) search(lastQuery);
});

await loadKB();
setStatus(`Teadmistebaas laaditud: ${kb.length} nõuet. Mudel käivitub esimesel otsingul.`);

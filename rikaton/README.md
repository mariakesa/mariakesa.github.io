# Accessibility semantic search prototype

A static GitHub Pages prototype for semantic search over the enriched accessibility audit KB.

## Upload these files

```text
semantic-search/
  index.html
  styles.css
  app.js
  kb.json
```

`README.md` is optional.

## How it works

The page uses Transformers.js directly in the browser with `Xenova/multilingual-e5-small`.

On the first search:
1. the browser downloads the quantized model from Hugging Face;
2. all 87 KB records are embedded locally;
3. their normalized 384-dimensional vectors are cached in `localStorage`;
4. the user's query is embedded as `query: ...`;
5. KB records are embedded as `passage: ...`;
6. normalized dot product (= cosine similarity) ranks the records.

No OpenAI API key and no backend are required.

## GitHub Pages deployment

Put the four runtime files in a folder such as:

```text
accessibility-search/
```

in `mariakesa.github.io`.

Then open:

```text
https://mariakesa.github.io/accessibility-search/
```

## Prototype caveat

The first search can be noticeably slower because the browser computes all document vectors.
For the next version, precompute those vectors once and commit a static `kb-vectors.json`.
Then the browser only embeds each new query.

## Provenance

The UI distinguishes audit-source material (`allikas`) from AI-authored explanatory text (`AI loodud`).

## Versions

- Transformers.js: `4.2.0`
- model: `Xenova/multilingual-e5-small`
- KB cache version: `9fe9056dd8eb`

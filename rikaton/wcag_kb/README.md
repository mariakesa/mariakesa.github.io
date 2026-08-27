# WCAG 2.2 bilingual prototype viewer

Static GitHub Pages compatible viewer for the WCAG semantic chunk corpus.

## Run locally

```powershell
python -m http.server 8000
```

Open:

`http://localhost:8000/?lang=et`

## Bilingual fields

The viewer reads:

- `wcag_title_et`, `section_et`, `text_et` for Estonian
- `wcag_title_en` / `wcag_title`, `section_en` / `section`, `text_en` for English

Replace the included `kb.json` with your merged bilingual `kb.json` before deployment.

## Session editing

In Estonian mode, body text is editable directly in the reader. Edits are stored only in JavaScript memory and are keyed by `chunk_id`.

- navigate/search/switch sections: edits remain
- refresh/close page: edits disappear
- `kb.json` is never modified
- no localStorage, IndexedDB, cookies, or backend are used

## Session images

Each WCAG chunk can receive one or more temporary images. Add them with:

- **+ Add images** file picker
- drag and drop onto the image area
- paste an image from the clipboard

Images are kept as browser object URLs in memory and keyed by `chunk_id`.

- navigate/search/switch language: images remain attached to the chunk
- remove individual images with **Remove / Eemalda**
- refresh/close page: images disappear
- images are never uploaded or written to GitHub Pages

This is intentional for the hackathon prototype.

## Deep links

State is encoded in query parameters, for example:

`/?lang=et&wcag=1.1.1&type=technique&ref=G94&section=Description`

The canonical `section=` parameter remains based on the English/internal section value so URLs stay stable if translations change.

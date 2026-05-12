# BayMaxHome PDF Tools

Free browser-based PDF tools for everyday document tasks:

https://liaopengdong.github.io/pdf-tools/

BayMaxHome PDF Tools is a static GitHub Pages website for merging, splitting, organizing, converting, and editing PDF files directly in the browser. The project is designed for simple public use cases where users need quick PDF utilities without installing desktop software.

## Available PDF Tools

### Organize PDF

| Tool | What it does |
| --- | --- |
| [Merge PDF](https://liaopengdong.github.io/pdf-tools/merge-pdf/) | Combine multiple PDF files into one document. |
| [Split PDF](https://liaopengdong.github.io/pdf-tools/split-pdf/) | Split a PDF into separate page files. |
| [Extract Pages](https://liaopengdong.github.io/pdf-tools/extract-pages/) | Save selected pages from a PDF as a new file. |
| [Delete Pages](https://liaopengdong.github.io/pdf-tools/delete-pages/) | Remove unwanted pages from a PDF. |
| [Rotate PDF](https://liaopengdong.github.io/pdf-tools/rotate-pdf/) | Rotate PDF pages by 90, 180, or 270 degrees. |
| [Reverse PDF Pages](https://liaopengdong.github.io/pdf-tools/reverse-pdf/) | Reverse the page order of a PDF file. |
| [Duplicate Pages](https://liaopengdong.github.io/pdf-tools/duplicate-pages/) | Duplicate selected pages directly after the original pages. |
| [Add Blank Page](https://liaopengdong.github.io/pdf-tools/add-blank-page/) | Append one or more blank pages to a PDF. |

### Convert PDF

| Tool | What it does |
| --- | --- |
| [PDF to JPG](https://liaopengdong.github.io/pdf-tools/pdf-to-jpg/) | Convert PDF pages into JPG images and download them as a ZIP file. |
| [PDF to PNG](https://liaopengdong.github.io/pdf-tools/pdf-to-png/) | Convert PDF pages into PNG images and download them as a ZIP file. |
| [JPG to PDF](https://liaopengdong.github.io/pdf-tools/jpg-to-pdf/) | Convert JPG or PNG images into a PDF document. |
| [PNG to PDF](https://liaopengdong.github.io/pdf-tools/png-to-pdf/) | Convert PNG images into a PDF document. |
| [PDF to Text](https://liaopengdong.github.io/pdf-tools/pdf-to-text/) | Extract readable text from a PDF file when text data is available. |
| [PDF Page Count](https://liaopengdong.github.io/pdf-tools/pdf-page-count/) | Count pages in a PDF and download a simple report. |
| [PDF Page Size](https://liaopengdong.github.io/pdf-tools/pdf-page-size/) | Check page dimensions and download a simple report. |

### Edit PDF

| Tool | What it does |
| --- | --- |
| [Add Watermark](https://liaopengdong.github.io/pdf-tools/watermark-pdf/) | Add a text watermark to each PDF page. |
| [Add Page Numbers](https://liaopengdong.github.io/pdf-tools/add-page-numbers/) | Add page numbers to PDF pages. |
| [Edit PDF Metadata](https://liaopengdong.github.io/pdf-tools/edit-pdf-metadata/) | Update title, author, subject, and keyword metadata. |
| [Compress PDF](https://liaopengdong.github.io/pdf-tools/compress-pdf/) | Rewrite a PDF with object streams enabled; size reduction depends on the source file. |
| [Flatten PDF](https://liaopengdong.github.io/pdf-tools/flatten-pdf/) | Flatten supported fillable form fields into page content. |
| [Optimize PDF](https://liaopengdong.github.io/pdf-tools/optimize-pdf/) | Re-save a PDF with object streams enabled. |
| [Repair PDF](https://liaopengdong.github.io/pdf-tools/repair-pdf/) | Try to re-save a readable PDF to fix minor structure issues. |

The homepage also includes additional browser-side utilities such as flattening PDF forms, rewriting PDF files for basic optimization, and repairing simple PDF structure issues.

## Why This Project Exists

Many PDF tasks are small and repetitive: merging receipts, splitting a scanned document, turning PDF pages into images, or adding page numbers before sending a file. This project focuses on lightweight tools that work from a static website and do not require a server-side upload pipeline.

## Privacy Model

This is a static front-end project. PDF processing is handled in the browser using JavaScript libraries such as PDF.js, pdf-lib, and JSZip. There is no custom backend in this repository for receiving uploaded files.

Users should still avoid processing highly sensitive documents on any public website unless they fully understand the tool and their browser environment.

## Technology

- Static HTML, CSS, and JavaScript
- GitHub Pages hosting
- PDF.js for PDF rendering and text extraction
- pdf-lib for PDF creation and modification
- JSZip for packaging converted image files
- Local vendor assets instead of external CDN dependencies

## Project Structure

```text
.
├── index.html
├── assets/
│   ├── pdf-tools.js
│   ├── styles.css
│   └── vendor/
├── merge-pdf/
├── split-pdf/
├── pdf-to-jpg/
├── pdf-to-png/
├── jpg-to-pdf/
├── png-to-pdf/
├── rotate-pdf/
├── watermark-pdf/
├── extract-pages/
├── delete-pages/
├── reverse-pdf/
├── duplicate-pages/
├── add-blank-page/
├── pdf-to-text/
├── pdf-page-count/
├── pdf-page-size/
├── add-page-numbers/
├── edit-pdf-metadata/
├── compress-pdf/
├── flatten-pdf/
├── optimize-pdf/
├── repair-pdf/
├── organize-pdf/
├── convert-pdf/
├── edit-pdf/
└── blog/
```

## Local Preview

Run a local static server from the repository root:

```bash
python -m http.server 8080
```

Then open:

```text
http://127.0.0.1:8080/
```

If you want to simulate the GitHub Pages project path, serve the parent directory and open the project folder path.

## SEO Pages

The site includes standalone pages for core tools, category pages, and educational blog articles. The sitemap is configured for:

```text
https://liaopengdong.github.io/pdf-tools/sitemap.xml
```

## Limitations

Some advanced PDF workflows require a backend service or native software. Features such as OCR, PDF to Word, Word to PDF, PDF to Excel, and high-quality compression are not exposed as core static tools because reliable conversion usually requires server-side processing.

## Contributing

Suggestions and improvements are welcome. Good contribution areas include:

- Better browser compatibility
- More standalone tool pages
- Accessibility improvements
- Clearer help text and examples
- Safer handling of unusual or damaged PDF files

## License

This repository currently does not define a separate open-source license. If you want to reuse the code, check the repository status first or open an issue.

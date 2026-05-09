const toolConfig = {
  merge: {
    category: "Organize",
    title: "Merge PDF",
    summary: "Combine multiple PDF files into one PDF in the order shown.",
    accept: "application/pdf",
    multiple: true,
    options: [],
  },
  split: {
    category: "Organize",
    title: "Split PDF",
    summary: "Export every page of a PDF as a separate PDF inside a ZIP file.",
    accept: "application/pdf",
    multiple: false,
    options: [],
  },
  extract: {
    category: "Organize",
    title: "Extract pages",
    summary: "Create a new PDF from selected page ranges.",
    accept: "application/pdf",
    multiple: false,
    options: ["range"],
  },
  delete: {
    category: "Organize",
    title: "Delete pages",
    summary: "Remove selected pages and export the remaining PDF.",
    accept: "application/pdf",
    multiple: false,
    options: ["range"],
  },
  rotate: {
    category: "Organize",
    title: "Rotate PDF",
    summary: "Rotate all pages or selected page ranges by 90, 180, or 270 degrees.",
    accept: "application/pdf",
    multiple: false,
    options: ["range", "rotation"],
  },
  reverse: {
    category: "Organize",
    title: "Reverse pages",
    summary: "Reverse the page order of a PDF file.",
    accept: "application/pdf",
    multiple: false,
    options: [],
  },
  "pdf-to-jpg": {
    category: "Convert",
    title: "PDF to JPG",
    summary: "Render PDF pages as JPG images and download them in a ZIP file.",
    accept: "application/pdf",
    multiple: false,
    options: ["jpeg-quality"],
  },
  "image-to-pdf": {
    category: "Convert",
    title: "JPG/PNG to PDF",
    summary: "Convert JPG and PNG images into a single PDF file.",
    accept: "image/jpeg,image/png",
    multiple: true,
    options: [],
  },
  "extract-text": {
    category: "Convert",
    title: "PDF to text",
    summary: "Extract selectable text from a PDF into a plain text file.",
    accept: "application/pdf",
    multiple: false,
    options: [],
  },
  watermark: {
    category: "Edit",
    title: "Add watermark",
    summary: "Add a diagonal text watermark to each page of a PDF.",
    accept: "application/pdf",
    multiple: false,
    options: ["watermark", "text-size"],
  },
  "page-numbers": {
    category: "Edit",
    title: "Add page numbers",
    summary: "Add centered page numbers to the bottom of each page.",
    accept: "application/pdf",
    multiple: false,
    options: ["text-size"],
  },
  metadata: {
    category: "Edit",
    title: "Edit metadata",
    summary: "Set PDF title, author, and subject metadata.",
    accept: "application/pdf",
    multiple: false,
    options: ["metadata"],
  },
  flatten: {
    category: "Edit",
    title: "Flatten forms",
    summary: "Flatten fillable form fields into regular PDF page content.",
    accept: "application/pdf",
    multiple: false,
    options: [],
  },
  optimize: {
    category: "Edit",
    title: "Optimize PDF",
    summary: "Rewrite a PDF with object streams enabled. File size reduction depends on the source file.",
    accept: "application/pdf",
    multiple: false,
    options: [],
  },
  repair: {
    category: "Edit",
    title: "Repair PDF",
    summary: "Try to load and re-save a readable PDF to fix minor structure issues.",
    accept: "application/pdf",
    multiple: false,
    options: [],
  },
};

let activeTool = "merge";
let selectedFiles = [];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function setStatus(message, isError = false) {
  const node = $("#statusLine");
  node.textContent = message;
  node.classList.toggle("is-error", isError);
}

function setResults(items) {
  const list = $("#resultList");
  list.innerHTML = "";
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "result-item";
    const label = document.createElement("div");
    label.innerHTML = `<strong>${item.name}</strong><span>${item.detail}</span>`;
    const link = document.createElement("a");
    link.href = item.url;
    link.download = item.name;
    link.textContent = "Download";
    row.append(label, link);
    list.append(row);
  });
}

function bytesLabel(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function safeName(name, suffix) {
  const base = name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "");
  return `${base || "document"}${suffix}`;
}

function downloadItem(blob, name) {
  return {
    name,
    detail: bytesLabel(blob.size),
    url: URL.createObjectURL(blob),
  };
}

function renderFileList() {
  const list = $("#fileList");
  list.innerHTML = "";
  selectedFiles.forEach((file, index) => {
    const row = document.createElement("div");
    row.className = "file-item";
    row.innerHTML = `<strong>${index + 1}. ${file.name}</strong><span>${bytesLabel(file.size)}</span>`;
    list.append(row);
  });
}

function parseRanges(input, pageCount) {
  const value = input.trim();
  if (!value) return Array.from({ length: pageCount }, (_, index) => index);

  const result = new Set();
  value.split(",").forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;
    const [startRaw, endRaw] = trimmed.split("-").map((item) => Number(item.trim()));
    const start = Math.max((startRaw || 1) - 1, 0);
    const end = Math.min((endRaw || startRaw || 1) - 1, pageCount - 1);
    for (let index = Math.min(start, end); index <= Math.max(start, end); index += 1) {
      result.add(index);
    }
  });

  return Array.from(result).filter((index) => index >= 0 && index < pageCount);
}

async function loadPdf(file) {
  const bytes = await file.arrayBuffer();
  return PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
}

async function savePdf(doc) {
  const bytes = await doc.save({ useObjectStreams: true });
  return new Blob([bytes], { type: "application/pdf" });
}

async function mergePdf(files) {
  const output = await PDFLib.PDFDocument.create();
  for (const file of files) {
    const source = await loadPdf(file);
    const pages = await output.copyPages(source, source.getPageIndices());
    pages.forEach((page) => output.addPage(page));
  }
  return [downloadItem(await savePdf(output), "merged.pdf")];
}

async function splitPdf(file) {
  const source = await loadPdf(file);
  const zip = new JSZip();
  for (let index = 0; index < source.getPageCount(); index += 1) {
    const output = await PDFLib.PDFDocument.create();
    const [page] = await output.copyPages(source, [index]);
    output.addPage(page);
    const bytes = await output.save({ useObjectStreams: true });
    zip.file(`page-${String(index + 1).padStart(3, "0")}.pdf`, bytes);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  return [downloadItem(blob, safeName(file.name, "-split-pages.zip"))];
}

async function extractPages(file) {
  const source = await loadPdf(file);
  const pages = parseRanges($("#pageRange").value, source.getPageCount());
  if (!pages.length) throw new Error("No valid pages were selected.");
  const output = await PDFLib.PDFDocument.create();
  const copied = await output.copyPages(source, pages);
  copied.forEach((page) => output.addPage(page));
  return [downloadItem(await savePdf(output), safeName(file.name, "-extracted.pdf"))];
}

async function deletePages(file) {
  const source = await loadPdf(file);
  const remove = new Set(parseRanges($("#pageRange").value, source.getPageCount()));
  const keep = source.getPageIndices().filter((index) => !remove.has(index));
  if (!keep.length) throw new Error("The selected range removes every page.");
  const output = await PDFLib.PDFDocument.create();
  const copied = await output.copyPages(source, keep);
  copied.forEach((page) => output.addPage(page));
  return [downloadItem(await savePdf(output), safeName(file.name, "-pages-removed.pdf"))];
}

async function rotatePdf(file) {
  const doc = await loadPdf(file);
  const degrees = Number($("#rotationDegrees").value || 90);
  const pages = parseRanges($("#pageRange").value, doc.getPageCount());
  const selected = new Set(pages);
  doc.getPages().forEach((page, index) => {
    if (!selected.has(index)) return;
    const current = page.getRotation().angle || 0;
    page.setRotation(PDFLib.degrees((current + degrees) % 360));
  });
  return [downloadItem(await savePdf(doc), safeName(file.name, "-rotated.pdf"))];
}

async function reversePdf(file) {
  const source = await loadPdf(file);
  const output = await PDFLib.PDFDocument.create();
  const pages = source.getPageIndices().reverse();
  const copied = await output.copyPages(source, pages);
  copied.forEach((page) => output.addPage(page));
  return [downloadItem(await savePdf(output), safeName(file.name, "-reversed.pdf"))];
}

async function pdfToJpg(file) {
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const zip = new JSZip();
  const quality = Number($("#jpegQuality").value || 0.9);

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d", { alpha: false });
    await page.render({ canvasContext: context, viewport }).promise;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    zip.file(`page-${String(pageNumber).padStart(3, "0")}.jpg`, blob);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  return [downloadItem(blob, safeName(file.name, "-jpg.zip"))];
}

async function imageToPdf(files) {
  const doc = await PDFLib.PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const image = file.type === "image/png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  return [downloadItem(await savePdf(doc), "images-to-pdf.pdf")];
}

async function extractText(file) {
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const chunks = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    chunks.push(`Page ${pageNumber}`);
    chunks.push(content.items.map((item) => item.str).join(" "));
    chunks.push("");
  }

  const blob = new Blob([chunks.join("\n")], { type: "text/plain;charset=utf-8" });
  return [downloadItem(blob, safeName(file.name, ".txt"))];
}

async function addWatermark(file) {
  const doc = await loadPdf(file);
  const font = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
  const text = $("#watermarkText").value || "CONFIDENTIAL";
  const size = Number($("#textSize").value || 42);

  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width * 0.16,
      y: height * 0.48,
      size,
      font,
      color: PDFLib.rgb(0.72, 0.12, 0.08),
      opacity: 0.22,
      rotate: PDFLib.degrees(35),
    });
  });

  return [downloadItem(await savePdf(doc), safeName(file.name, "-watermarked.pdf"))];
}

async function addPageNumbers(file) {
  const doc = await loadPdf(file);
  const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
  const size = Number($("#textSize").value || 12);
  const total = doc.getPageCount();

  doc.getPages().forEach((page, index) => {
    const { width } = page.getSize();
    const text = `${index + 1} / ${total}`;
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: 24,
      size,
      font,
      color: PDFLib.rgb(0.22, 0.26, 0.3),
    });
  });

  return [downloadItem(await savePdf(doc), safeName(file.name, "-numbered.pdf"))];
}

async function editMetadata(file) {
  const doc = await loadPdf(file);
  const title = $("#metaTitle").value.trim();
  const author = $("#metaAuthor").value.trim();
  const subject = $("#metaSubject").value.trim();
  if (title) doc.setTitle(title);
  if (author) doc.setAuthor(author);
  if (subject) doc.setSubject(subject);
  doc.setModificationDate(new Date());
  return [downloadItem(await savePdf(doc), safeName(file.name, "-metadata.pdf"))];
}

async function flattenForms(file) {
  const doc = await loadPdf(file);
  try {
    doc.getForm().flatten();
  } catch (error) {
    throw new Error("No fillable form fields were found, or the form cannot be flattened in the browser.");
  }
  return [downloadItem(await savePdf(doc), safeName(file.name, "-flattened.pdf"))];
}

async function rewritePdf(file, suffix) {
  const doc = await loadPdf(file);
  return [downloadItem(await savePdf(doc), safeName(file.name, suffix))];
}

const runners = {
  merge: () => mergePdf(selectedFiles),
  split: () => splitPdf(selectedFiles[0]),
  extract: () => extractPages(selectedFiles[0]),
  delete: () => deletePages(selectedFiles[0]),
  rotate: () => rotatePdf(selectedFiles[0]),
  reverse: () => reversePdf(selectedFiles[0]),
  "pdf-to-jpg": () => pdfToJpg(selectedFiles[0]),
  "image-to-pdf": () => imageToPdf(selectedFiles),
  "extract-text": () => extractText(selectedFiles[0]),
  watermark: () => addWatermark(selectedFiles[0]),
  "page-numbers": () => addPageNumbers(selectedFiles[0]),
  metadata: () => editMetadata(selectedFiles[0]),
  flatten: () => flattenForms(selectedFiles[0]),
  optimize: () => rewritePdf(selectedFiles[0], "-optimized.pdf"),
  repair: () => rewritePdf(selectedFiles[0], "-repaired.pdf"),
};

function configureTool(toolId) {
  activeTool = toolId;
  const config = toolConfig[toolId];
  $("#toolCategory").textContent = config.category;
  $("#toolTitle").textContent = config.title;
  $("#toolSummary").textContent = config.summary;
  $("#dropTitle").textContent = config.multiple ? "Choose files" : "Choose a file";
  $("#dropSubtitle").textContent = config.accept.includes("image") ? "JPG or PNG images" : "PDF files only";

  const input = $("#fileInput");
  input.accept = config.accept;
  input.multiple = config.multiple;
  input.value = "";
  selectedFiles = [];
  renderFileList();
  setResults([]);
  setStatus("Ready.");

  $$(".tool-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tool === toolId);
  });

  $$(".option-field").forEach((field) => {
    field.classList.toggle("is-visible", config.options.includes(field.dataset.option));
  });
}

function setFiles(files) {
  const config = toolConfig[activeTool];
  selectedFiles = Array.from(files || []);
  if (!config.multiple) selectedFiles = selectedFiles.slice(0, 1);
  renderFileList();
  setResults([]);
  setStatus(selectedFiles.length ? `${selectedFiles.length} file selected.` : "Ready.");
}

async function runActiveTool() {
  if (!selectedFiles.length) {
    setStatus("Choose at least one file first.", true);
    return;
  }

  try {
    $("#runButton").disabled = true;
    setResults([]);
    setStatus("Processing...");
    const results = await runners[activeTool]();
    setResults(results);
    setStatus("Finished.");
  } catch (error) {
    setStatus(error.message || "The file could not be processed.", true);
  } finally {
    $("#runButton").disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  if (!$("#workspace")) return;

  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }

  $$(".tool-tab").forEach((button) => {
    button.addEventListener("click", () => configureTool(button.dataset.tool));
  });

  $("#fileInput").addEventListener("change", (event) => setFiles(event.target.files));
  $("#runButton").addEventListener("click", runActiveTool);
  $("#clearButton").addEventListener("click", () => configureTool(activeTool));

  const dropZone = $("#dropZone");
  ["dragenter", "dragover"].forEach((type) => {
    dropZone.addEventListener(type, (event) => {
      event.preventDefault();
      dropZone.classList.add("is-dragging");
    });
  });
  ["dragleave", "drop"].forEach((type) => {
    dropZone.addEventListener(type, (event) => {
      event.preventDefault();
      dropZone.classList.remove("is-dragging");
    });
  });
  dropZone.addEventListener("drop", (event) => setFiles(event.dataTransfer.files));

  activeTool = document.body.dataset.defaultTool || activeTool;
  configureTool(activeTool);
});

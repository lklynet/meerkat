const VIEW_CYCLE = ["split", "edit", "preview"];
const VIEW_LABELS = { split: "Split", edit: "Edit", preview: "Preview" };

let editor;
let viewMode = "split";
const currentNoteId = window.location.pathname.substring(1);

async function fetchAPI(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    ...options.headers,
  };

  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const menuButton = document.getElementById("menu-button");
  const dropdownMenu = document.getElementById("dropdown-menu");

  menuButton.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) {
      dropdownMenu.classList.add("hidden");
    }
  });

  setupSplitter();

  const textArea = document.getElementById("editor");
  editor = CodeMirror.fromTextArea(textArea, {
    mode: "markdown",
    theme: "one-dark",
    lineNumbers: true,
    lineWrapping: true,
    autofocus: true,
    tabSize: 2,
    indentWithTabs: false,
    viewportMargin: Infinity
  });

  document.querySelectorAll(".light-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const on = btn.classList.toggle("on");
      const panel = btn.dataset.panel;
      toggleLight(btn, panel, on);
    });
  });

  setupEventListeners();
  const noteId = window.location.pathname.substring(1);

  try {
    if (noteId) {
      const response = await fetchAPI(`/${noteId}`);
      const data = await response.json();
      if (data.content) {
        editor.setValue(data.content);
        const mode = data.save_state || "split";
        setMode(mode);
      } else {
        throw new Error("No content received");
      }
    } else {
      const response = await fetchAPI("/");
      const data = await response.json();
      if (data.noteId) {
        window.location.href = `/${data.noteId}`;
        return;
      }
      throw new Error("No noteId received");
    }
  } catch (error) {
    console.error("Failed to initialize note:", error);
    editor.setValue(`Error: ${error.message}`);
    editor.setOption("readOnly", true);
  }
});

function setupEventListeners() {
  const viewButton = document.getElementById("view-button");

  editor.on("change", () => {
    saveNoteContent();
    if (viewMode === "split") renderPreviewContent();
  });

  viewButton.addEventListener("click", () => {
    const idx = VIEW_CYCLE.indexOf(viewMode);
    const next = VIEW_CYCLE[(idx + 1) % 3];
    setMode(next);
    saveModeToDatabase(next);
  });

  document.getElementById("copy-link").addEventListener("click", copyLink);
  document.getElementById("delete-note").addEventListener("click", deleteNote);
  document.getElementById("new-note").addEventListener("click", newNote);
  document.getElementById("clone-note").addEventListener("click", cloneNote);
  document.getElementById("export-note").addEventListener("click", exportNote);
  document.getElementById("show-guide").addEventListener("click", showGuide);

  const guideModal = document.getElementById("guide-modal");
  document.getElementById("close-guide").addEventListener("click", () => guideModal.style.display = "none");
  guideModal.querySelector(".modal-backdrop").addEventListener("click", () => guideModal.style.display = "none");
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") guideModal.style.display = "none";
  });

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      saveNoteContent();
    } else if (event.ctrlKey && event.key === "n") {
      event.preventDefault();
      newNote();
    } else if (event.ctrlKey && event.key === "p") {
      event.preventDefault();
      const idx = VIEW_CYCLE.indexOf(viewMode);
      const next = VIEW_CYCLE[(idx + 1) % 3];
      setMode(next);
      saveModeToDatabase(next);
    }
  });
}

let splitRatio = 0.5;

function toggleLight(btn, panel, on) {
  if (panel === "editor") {
    document.getElementById("editor-container").classList.toggle("light", on);
    editor.setOption("theme", on ? "default" : "one-dark");
  } else {
    document.getElementById("preview-container").classList.toggle("light", on);
  }
  btn.querySelector("i").className = on ? "fas fa-lightbulb" : "far fa-lightbulb";
}

function setupSplitter() {
  const splitter = document.getElementById("splitter");
  const editorContainer = document.getElementById("editor-container");
  const mainContainer = document.getElementById("main-container");
  let dragging = false;

  splitter.addEventListener("mousedown", () => { dragging = true; });
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const rect = mainContainer.getBoundingClientRect();
    splitRatio = (e.clientX - rect.left) / rect.width;
    editorContainer.style.flex = `0 0 ${splitRatio * 100}%`;
  });
  document.addEventListener("mouseup", () => {
    if (dragging) editor.refresh();
    dragging = false;
  });
}

function setMode(mode) {
  viewMode = mode;
  applyView();
  localStorage.setItem("editorMode", mode);
}

function applyView() {
  const mainContainer = document.getElementById("main-container");
  const editorContainer = document.getElementById("editor-container");
  const previewContainer = document.getElementById("preview-container");
  const viewButton = document.getElementById("view-button");

  if (viewMode === "split") {
    mainContainer.classList.add("split");
    editorContainer.style.display = "";
    editorContainer.style.flex = `0 0 ${splitRatio * 100}%`;
    previewContainer.style.display = "";
    renderPreviewContent();
  } else if (viewMode === "edit") {
    mainContainer.classList.remove("split");
    editorContainer.style.display = "";
    editorContainer.style.flex = "1";
    previewContainer.style.display = "none";
  } else {
    mainContainer.classList.remove("split");
    editorContainer.style.flex = "1";
    editorContainer.style.display = "none";
    previewContainer.style.display = "";
    renderPreviewContent();
  }

  viewButton.textContent = VIEW_LABELS[viewMode];
  editor.refresh();
}

function renderPreviewContent() {
  const preview = document.getElementById("preview");
  const rawHTML = marked.parse(editor.getValue());
  const cleanHTML = DOMPurify.sanitize(rawHTML);
  preview.innerHTML = cleanHTML;
}

async function saveModeToDatabase(mode) {
  if (!currentNoteId) return;
  try {
    await fetchAPI(`/${currentNoteId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ save_state: mode }),
    });
  } catch (error) {
    console.error("Failed to save note mode:", error);
  }
}

async function saveNoteContent() {
  if (!currentNoteId) return;
  const content = editor.getValue();
  try {
    await fetchAPI(`/${currentNoteId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ content }),
    });
  } catch (error) {
    console.error("Failed to save note content:", error);
    throw error;
  }
}

function showGuide() {
  document.getElementById("guide-modal").style.display = "flex";
}

function copyLink() {
  if (!currentNoteId) {
    alert("No note to share. Please create or clone a note first.");
    return;
  }
  const url = new URL(window.location);
  const shareableLink = url.toString();
  navigator.clipboard
    .writeText(shareableLink)
    .then(() => {
      alert("Link copied to clipboard!");
    })
    .catch(() => {
      alert("Failed to copy link.");
    });
}

async function deleteNote() {
  if (!currentNoteId) {
    alert("No note to delete.");
    return;
  }
  if (confirm("Are you sure you want to delete this note?")) {
    try {
      await fetchAPI(`/${currentNoteId}`, {
        method: "DELETE",
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("Failed to delete note. Please try again.");
    }
  }
}

function newNote() {
  window.location.href = "/";
}

async function cloneNote() {
  if (!currentNoteId) {
    alert("No note to clone.");
    return;
  }
  const content = editor.getValue();
  const newNoteId = [...Array(8)]
    .map(() => Math.random().toString(36)[2])
    .join("");
  try {
    await fetchAPI(`/${newNoteId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ content }),
    });
    window.location.href = "/" + newNoteId;
  } catch (error) {
    console.error("Failed to clone note:", error);
    alert("Failed to clone note. Please try again.");
  }
}

function exportNote() {
  if (!currentNoteId) {
    alert("No note to export. Please create or open a note first.");
    return;
  }
  const content = editor.getValue();
  const blob = new Blob([content], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = currentNoteId + ".md";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

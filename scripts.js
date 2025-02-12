// Debug initialization
console.log("Script initialization started");
console.log("window.ENV available:", !!window.ENV);
console.log("window.ENV contents:", window.ENV);

const API_URL = "https://notes-api.leefamous.workers.dev";
const API_KEY = window.ENV?.API_KEY || "";

// Log API key status
console.log("API_KEY initialized:", !!API_KEY);
console.log("API_KEY length:", API_KEY.length);
console.log("API_KEY is placeholder:", API_KEY === "__API_KEY__");

// Initialize CodeMirror
let editor;

// Helper function for API calls
async function fetchAPI(endpoint, options = {}) {
  const headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/x-www-form-urlencoded",
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
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
  // Initialize sidebar state
  const sidebar = document.getElementById("sidebar");
  const toggleButton = document.getElementById("toggle-sidebar");
  const toggleIcon = toggleButton.querySelector("i");
  let isSidebarOpen = localStorage.getItem("sidebarOpen") !== "false";

  // Apply initial sidebar state
  if (!isSidebarOpen) {
    sidebar.style.transform = "translateX(-100%)";
    toggleButton.style.left = "0px";
    toggleIcon.className = "fas fa-chevron-right";
    const mainContent = document.querySelector(".main-content");
    mainContent.style.marginLeft = "-270px";
    mainContent.style.width = "calc(100% + 270px)";
    const previewContainer = document.getElementById("preview-container");
    if (previewContainer) {
      previewContainer.style.marginLeft = mainContent.style.marginLeft;
      previewContainer.style.width = mainContent.style.width;
    }
  }

  // Toggle sidebar function
  toggleButton.addEventListener("click", () => {
    isSidebarOpen = !isSidebarOpen;
    localStorage.setItem("sidebarOpen", isSidebarOpen);
    sidebar.style.transform = isSidebarOpen ? "translateX(0)" : "translateX(-100%)";
    toggleButton.style.left = isSidebarOpen ? "270px" : "0px";
    toggleIcon.className = isSidebarOpen ? "fas fa-chevron-left" : "fas fa-chevron-right";
    
    // Update main content area width
    const mainContent = document.querySelector(".main-content");
    mainContent.style.marginLeft = isSidebarOpen ? "0px" : "-270px";
    mainContent.style.width = isSidebarOpen ? "100%" : "calc(100% + 270px)";
    editor.refresh(); // Refresh CodeMirror to adjust to new width
    
    // Update preview container width and margin to match editor container
    const previewContainer = document.getElementById("preview-container");
    if (previewContainer) {
      previewContainer.style.marginLeft = mainContent.style.marginLeft;
      previewContainer.style.width = mainContent.style.width;
      previewContainer.style.transition = "width 0.3s ease-in-out, margin-left 0.3s ease-in-out";
    }
  });
  // Initialize CodeMirror
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

  setupEventListeners();
  const urlParams = new URLSearchParams(window.location.search);
  // Prioritize server-saved state over localStorage and URL parameters
  const mode = "edit";
  const noteId = window.location.pathname.substring(1);

  try {
    if (noteId) {
      // Load existing note
      const response = await fetchAPI(`/${noteId}`);
      const data = await response.json();
      if (data.content) {
        editor.setValue(data.content);
        // Apply server-saved mode state, fallback to localStorage if not available
        const mode = data.save_state || localStorage.getItem("editorMode") || "edit";
        setMode(mode);
        renderPreview(); // Explicitly render preview after content is set
      } else {
        throw new Error("No content received");
      }
    } else {
      // Create new note
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
    document.getElementById("save-status").style.backgroundColor = "#FF4500";
  }
});

let isEditing = true;
let debounceTimer;
const currentNoteId = window.location.pathname.substring(1);

function setupEventListeners() {
  const previewButton = document.getElementById("preview-button");
  const editButton = document.getElementById("edit-button");
  const saveStatus = document.getElementById("save-status");

  editor.on("change", debounce(() => {
    saveStatus.style.backgroundColor = "#FFD700"; // Yellow while saving
    saveNoteContent()
      .then(() => {
        saveStatus.style.backgroundColor = "#32CD32"; // Green on success
      })
      .catch(() => {
        saveStatus.style.backgroundColor = "#FF4500"; // Red on error
      });
  }, 500));

  // Preview button
  previewButton.addEventListener("click", () => {
    setMode("preview");
    saveModeToDatabase("preview");
  });

  // Edit button
  editButton.addEventListener("click", () => {
    setMode("edit");
    saveModeToDatabase("edit");
  });

  // Sidebar actions
  document.getElementById("copy-link").addEventListener("click", copyLink);
  document.getElementById("delete-note").addEventListener("click", deleteNote);
  document.getElementById("new-note").addEventListener("click", newNote);
  document.getElementById("clone-note").addEventListener("click", cloneNote);
  document.getElementById("export-note").addEventListener("click", exportNote);

  // Keyboard shortcuts
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      saveNoteContent();
    } else if (event.ctrlKey && event.key === "n") {
      event.preventDefault();
      newNote();
    } else if (event.ctrlKey && event.key === "p") {
      event.preventDefault();
      setMode(isEditing ? "preview" : "edit");
      saveModeToDatabase(isEditing ? "preview" : "edit");
    }
  });
}

function setMode(mode) {
  isEditing = mode === "edit";
  renderPreview();
  localStorage.setItem("editorMode", mode);
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

function renderPreview() {
  const editorContainer = document.getElementById("editor-container");
  const previewContainer = document.getElementById("preview-container");
  const editButton = document.getElementById("edit-button");
  const previewButton = document.getElementById("preview-button");

  if (isEditing) {
    editorContainer.style.display = "block";
    previewContainer.style.display = "none";
    editButton.style.display = "none";
    previewButton.style.display = "inline-block";
    editor.refresh(); // Refresh CodeMirror when switching to edit mode
  } else {
    const preview = document.getElementById("preview");
    const rawHTML = marked.parse(editor.getValue());
    const cleanHTML = DOMPurify.sanitize(rawHTML);
    preview.innerHTML = cleanHTML;

    editorContainer.style.display = "none";
    previewContainer.style.display = "block";
    editButton.style.display = "inline-block";
    previewButton.style.display = "none";
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

function debounce(func, delay) {
  return function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(this, arguments), delay);
  };
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

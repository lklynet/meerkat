document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  renderPreview();
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode") || "edit";
  const noteId = window.location.pathname.substring(1);
  setMode(mode);

  if (noteId) {
    // Load existing note
    fetch(`https://notes-api.leefamous.workers.dev/${noteId}`, {
      headers: {
        "X-API-Key": API_KEY,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("editor").value = data.content;
      });
  } else {
    // Create new note
    fetch("https://notes-api.leefamous.workers.dev/", {
      redirect: "follow",
      headers: {
        "X-API-Key": API_KEY,
      },
    }).then((response) => {
      if (response.redirected) {
        const noteId = response.url.split("/").pop();
        window.location.href = "/" + noteId;
      }
    });
  }
});

let isEditing = true;
let debounceTimer;
const currentNoteId = window.location.pathname.substring(1);

function setupEventListeners() {
  const editor = document.getElementById("editor");
  const previewButton = document.getElementById("preview-button");
  const editButton = document.getElementById("edit-button");
  const saveStatus = document.getElementById("save-status");

  editor.addEventListener(
    "input",
    debounce(() => {
      // Indicate unsaved changes (yellow)
      saveStatus.style.backgroundColor = "#FFD700";
      saveNoteContent()
        .then(() => {
          // Successfully saved (green)
          saveStatus.style.backgroundColor = "#32CD32";
        })
        .catch(() => {
          // Error saving (red)
          saveStatus.style.backgroundColor = "#FF4500";
        });
    }, 500)
  );

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
    // CTRL+S => Save
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      saveNoteContent();
    }
    // CTRL+N => New Note
    else if (event.ctrlKey && event.key === "n") {
      event.preventDefault();
      newNote();
    }
    // CTRL+P => Toggle Preview/Edit
    else if (event.ctrlKey && event.key === "p") {
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
  await fetch(`https://notes-api.leefamous.workers.dev/${currentNoteId}`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
    },
    body: new URLSearchParams({ save_state: mode }),
  }).catch((error) => {
    console.error("Failed to save note mode:", error);
  });
}

function renderPreview() {
  const editorContainer = document.getElementById("editor-container");
  const previewContainer = document.getElementById("preview-container");
  const editButton = document.getElementById("edit-button");
  const previewButton = document.getElementById("preview-button");

  if (isEditing) {
    // Show editor
    editorContainer.style.display = "block";
    previewContainer.style.display = "none";
    editButton.style.display = "none";
    previewButton.style.display = "inline-block";
  } else {
    // Show preview
    const editor = document.getElementById("editor");
    const preview = document.getElementById("preview");
    const rawHTML = marked.parse(editor.value);
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
  const content = document.getElementById("editor").value;
  await fetch(`https://notes-api.leefamous.workers.dev/${currentNoteId}`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
    },
    body: new URLSearchParams({ content }),
  }).catch((error) => {
    console.error("Failed to save note content:", error);
  });
}

function debounce(func, delay) {
  return function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay);
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
      await fetch(`https://notes-api.leefamous.workers.dev/${currentNoteId}`, {
        method: "DELETE",
        headers: {
          "X-API-Key": API_KEY,
        },
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to delete note:", error);
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
  const content = document.getElementById("editor").value;
  const newNoteId = [...Array(8)]
    .map(() => Math.random().toString(36)[2])
    .join("");
  try {
    await fetch(`https://notes-api.leefamous.workers.dev/${newNoteId}`, {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
      },
      body: new URLSearchParams({ content }),
    });
    window.location.href = "/" + newNoteId;
  } catch (error) {
    console.error("Failed to clone note:", error);
  }
}

function exportNote() {
  if (!currentNoteId) {
    alert("No note to export. Please create or open a note first.");
    return;
  }
  const content = document.getElementById("editor").value;
  const blob = new Blob([content], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = currentNoteId + ".md";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

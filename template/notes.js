/**
 * Main Worker Export
 */
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
};

/**
 * Primary Request Handler
 */
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Root path: create a new note and redirect to its URL
  if (path === "/" || path === "") {
    const noteId = generateNoteId();
    const defaultContent = getDefaultNoteContent();
    const timestamp = Math.floor(Date.now() / 1000);

    await env.NOTES_DB.prepare(
      "INSERT INTO notes (id, content, created_at, save_state) VALUES (?, ?, ?, ?)"
    )
      .bind(noteId, defaultContent, timestamp, "edit")
      .run();

    return Response.redirect(`${url.origin}/${noteId}`, 302);
  }

  // For all other paths, treat as note ID
  const noteId = path.substring(1);
  if (request.method === "GET") {
    // Retrieve an existing note
    const { results } = await env.NOTES_DB.prepare(
      "SELECT content, save_state FROM notes WHERE id = ?"
    )
      .bind(noteId)
      .all();

    if (results.length > 0) {
      const noteContent = results[0].content;
      const saveState = results[0].save_state || "edit";

      return new Response(renderHTML(noteContent, noteId, saveState), {
        headers: { "Content-Type": "text/html" },
      });
    } else {
      return new Response("Note not found", { status: 404 });
    }
  } else if (request.method === "POST") {
    // Create/update a note
    const formData = await request.formData();
    const content = formData.get("content") || null;
    const saveState = formData.get("save_state") || null;

    const { results } = await env.NOTES_DB.prepare(
      "SELECT id FROM notes WHERE id = ?"
    )
      .bind(noteId)
      .all();

    if (results.length > 0) {
      // Update existing note
      if (content !== null && saveState !== null) {
        await env.NOTES_DB.prepare(
          "UPDATE notes SET content = ?, save_state = ? WHERE id = ?"
        )
          .bind(content, saveState, noteId)
          .run();
      } else if (content !== null) {
        await env.NOTES_DB.prepare("UPDATE notes SET content = ? WHERE id = ?")
          .bind(content, noteId)
          .run();
      } else if (saveState !== null) {
        await env.NOTES_DB.prepare(
          "UPDATE notes SET save_state = ? WHERE id = ?"
        )
          .bind(saveState, noteId)
          .run();
      }
    } else {
      // Insert new note
      const timestamp = Math.floor(Date.now() / 1000);
      await env.NOTES_DB.prepare(
        "INSERT INTO notes (id, content, created_at, save_state) VALUES (?, ?, ?, ?)"
      )
        .bind(
          noteId,
          content || getDefaultNoteContent(),
          timestamp,
          saveState || "edit"
        )
        .run();
    }
    return new Response("Note updated", { status: 200 });
  } else if (request.method === "DELETE") {
    // Delete a note
    await env.NOTES_DB.prepare("DELETE FROM notes WHERE id = ?")
      .bind(noteId)
      .run();
    return Response.redirect(`${url.origin}/`, 302);
  } else {
    return new Response("Method not allowed", { status: 405 });
  }
}

/**
 * Generate a random 8-character ID
 */
function generateNoteId() {
  return [...Array(8)].map(() => Math.random().toString(36)[2]).join("");
}

/**
 * Default content for new notes
 */
function getDefaultNoteContent() {
  return `# Hello World
  
  This is a sample note:
  
  - Item 1
  - Item 2
  - Item 3
  
  **Bold**, *Italic*, [Link](https://example.com)
  
  \`\`\`js
  console.log("Code block example");
  \`\`\`
  `;
}

/**
 * Renders the complete HTML page, including Tailwind setup and main scripts
 */
function renderHTML(noteContent, noteId = "", mode = "edit") {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <title>Markdown Notepad</title>
  
    <!-- TailwindCSS + Typography Plugin -->
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dompurify@2.2.8/dist/purify.min.js"></script>
  
    <!-- Font Awesome & Additional Fonts -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"/>
    <link rel="stylesheet" href="https://use.typekit.net/bop8ekr.css"/>
  
    <!-- Optional analytics or extra scripts -->
    <script src="https://post.lkly.net/inject.js"></script>
  
    <!-- Custom Markdown Styling & Layout Tweaks -->
    <style>
    /* ==============================
       Custom Markdown Styling
       ============================== */
  
    /* Headings */
    #preview h1 {
      @apply text-4xl font-bold mt-0 mb-2;
    }
    #preview h2 {
      @apply text-3xl font-bold mt-0 mb-2;
    }
    #preview h3 {
      @apply text-2xl font-bold mt-0 mb-2;
    }
    #preview h4 {
      @apply text-xl font-bold mt-0 mb-2;
    }
    #preview h5 {
      @apply text-lg font-bold mt-0 mb-2;
    }
    #preview h6 {
      @apply text-base font-bold mt-0 mb-2;
    }
  
    /* Text and Emphasis */
    #preview p {
      @apply my-4;
    }
    #preview strong {
      @apply font-semibold;
    }
    #preview em {
      @apply italic;
    }
  
    /* Links */
    #preview a {
      @apply text-blue-400 underline;
    }
    #preview a:hover {
      @apply text-blue-300 no-underline;
    }
  
    /* Blockquotes */
    #preview blockquote {
      @apply border-l-4 border-neutral-600 pl-4 italic my-4;
    }
  
    /* Inline Code */
    #preview code {
      @apply bg-neutral-800 text-neutral-100 px-1 py-0.5 rounded text-sm;
    }
  
    /* Code Blocks */
    #preview pre {
      @apply bg-neutral-800 text-neutral-100 p-4 rounded text-sm overflow-x-auto my-4;
    }
  
    /* Horizontal Rule */
    #preview hr {
      @apply border-b border-neutral-700 my-8;
    }
  
    /* Lists */
    #preview ul {
      @apply list-disc list-inside my-4;
    }
    #preview ol {
      @apply list-decimal list-inside my-4;
    }
    /* Slightly indent nested lists for clarity */
    #preview ul ul, 
    #preview ol ul,
    #preview ul ol,
    #preview ol ol {
      @apply ml-6;
    }
  
    /* Tables */
    #preview table {
      @apply w-full border-collapse my-4;
    }
    #preview thead th {
      @apply border-b border-neutral-600 font-semibold px-4 py-2;
    }
    #preview tr {
      @apply border-b border-neutral-700;
    }
    #preview th, #preview td {
      @apply px-4 py-2 align-top;
    }
    #preview tr:nth-child(even) {
      @apply bg-neutral-800;
    }
  
    /* Images */
    #preview img {
      @apply max-w-full my-4;
    }
  
    /* Footnotes (if your Markdown supports them) */
    #preview sup a {
      @apply text-xs;
    }
  </style>
  </head>
  
  <body class="flex flex-col md:flex-row h-screen overflow-hidden font-mono rounded bg-neutral-900 text-neutral-200 text-sm">
  
    <!-- Sidebar -->
    <div
      id="sidebar"
      class="md:w-72 w-full md:max-w-sm bg-neutral-800 flex flex-col overflow-hidden resize-x p-2 box-border"
    >
      <!-- Header -->
      <div class="flex items-center p-2 bg-neutral-800 box-border">
        <div
          class="flex-grow text-center text-md font-bold cursor-pointer"
          onclick="window.location.href='https://lkly.net';"
        >
          [>_ ] lkly/notes
        </div>
      </div>
  
      <!-- Markdown Guide -->
      <div id="markdown-guide-container" class="flex-grow overflow-y-auto bg-neutral-800">
        <div id="markdown-guide" class="p-2 bg-neutral-900 text-neutral-200 rounded leading-relaxed break-words">
          ${markdownGuideContent()}
        </div>
      </div>
  
      <!-- Sidebar Buttons -->
      <div class="sidebar-buttons flex flex-wrap gap-2 p-2 bg-neutral-800 sticky bottom-0">
        <button
          id="new-note"
          class="flex-1 basis-[calc(50%-0.5rem)] p-2 cursor-pointer bg-neutral-700 text-neutral-100
                 rounded text-center transition-colors duration-300 text-xs font-bold hover:bg-red-500"
        >
          <i class="fas fa-plus-square"></i> New
        </button>
        <button
          id="copy-link"
          class="flex-1 basis-[calc(50%-0.5rem)] p-2 cursor-pointer bg-neutral-700 text-neutral-100
                 rounded text-center transition-colors duration-300 text-xs font-bold hover:bg-red-500"
        >
          <i class="fas fa-link"></i> Copy Link
        </button>
        <button
          id="clone-note"
          class="flex-1 basis-[calc(50%-0.5rem)] p-2 cursor-pointer bg-neutral-700 text-neutral-100
                 rounded text-center transition-colors duration-300 text-xs font-bold hover:bg-red-500"
        >
          <i class="fas fa-clone"></i> Clone
        </button>
        <button
          id="delete-note"
          class="flex-1 basis-[calc(50%-0.5rem)] p-2 cursor-pointer bg-neutral-700 text-neutral-100
                 rounded text-center transition-colors duration-300 text-xs font-bold hover:bg-red-500"
        >
          <i class="fas fa-trash"></i> Delete
        </button>
        <button
          id="export-note"
          class="flex-1 basis-[calc(50%-0.5rem)] p-2 cursor-pointer bg-neutral-700 text-neutral-100
                 rounded text-center transition-colors duration-300 text-xs font-bold hover:bg-red-500"
        >
          <i class="fas fa-download"></i> Export
        </button>
  
        <!-- 'Buy me a coffee' link (inline) -->
        <button
          class="flex-1 basis-[calc(50%-0.5rem)] p-2 cursor-pointer bg-neutral-700 text-neutral-100
                 rounded text-center transition-colors duration-300 text-xs font-bold hover:bg-red-500"
        >
          <a href="https://buymeacoffee.com/lkly" target="_blank">Buy me a coffee! ☕</a>
          &nbsp;|&nbsp;
          <a href="https://x.com/itslkly" target="_blank">@itslkly</a>
        </button>
      </div>
    </div>
  
    <!-- Main Container -->
    <div id="main-container" class="flex-grow flex flex-col transition-width duration-300 ease-in-out">
      <!-- Top Bar -->
      <div class="top-bar flex justify-end items-center p-2 bg-neutral-800 relative">
        <span
          id="save-status"
          class="w-2 h-2 rounded-full bg-green-500 mr-2"
        ></span>
        <button
          id="edit-button"
          class="bg-neutral-700 text-neutral-200 border border-neutral-600 rounded px-2 py-1 ml-2 cursor-pointer text-xs hover:bg-neutral-600"
          style="display: none;"
        >
          Edit
        </button>
        <button
          id="preview-button"
          class="bg-neutral-700 text-neutral-200 border border-neutral-600 rounded px-2 py-1 ml-2 cursor-pointer text-xs hover:bg-neutral-600"
        >
          Preview
        </button>
      </div>
  
      <!-- Editor -->
      <div
        id="editor-container"
        class="w-full h-[calc(100vh-50px)]"
      >
        <textarea
          id="editor"
          class="w-full h-full bg-neutral-900 text-neutral-100 p-4 box-border text-sm rounded font-mono resize-none border-none"
        >${noteContent}</textarea>
      </div>
  
      <!-- Preview -->
      <div
        id="preview-container"
        class="p-4 h-[calc(100vh-50px)] overflow-y-auto text-sm"
        style="display: none;"
      >
        <!-- Use Tailwind Typography for Markdown rendering -->
        <div id="preview" class="prose prose-invert max-w-none"></div>
      </div>
    </div>
  
    <!-- Main Script -->
    <script>
      ${mainScript(mode, noteId)}
    </script>
  </body>
  </html>
  `;
}

/**
 * Basic Markdown Guide content
 */
function markdownGuideContent() {
  return `
      <h2 class="text-lg font-bold mb-2">Markdown Guide</h2>
      <h3 class="font-semibold mt-4 mb-1">Headers</h3>
      <p>Use <code>#</code> for headers:</p>
      <pre><code># H1 Header
  ## H2 Header
  ### H3 Header</code></pre>
  
      <h3 class="font-semibold mt-4 mb-1">Emphasis</h3>
      <pre><code>*Italic text*
  **Bold text**
  ***Bold and italic***</code></pre>
  
      <h3 class="font-semibold mt-4 mb-1">Lists</h3>
      <pre><code>- Unordered item
    - Nested item
  - Another item
  
  1. Ordered item
  2. Second item
     1. Nested ordered item</code></pre>
  
      <h3 class="font-semibold mt-4 mb-1">Links and Images</h3>
      <pre><code>[Link text](https://example.com)
  ![Alt text](image_url)</code></pre>
  
      <h3 class="font-semibold mt-4 mb-1">Code</h3>
      <p>Inline code and code blocks:</p>
      <pre><code>\`Inline code\`
  
  \`\`\`language
  // Code block
  console.log('Hello, world!');
  \`\`\`</code></pre>
  
      <h3 class="font-semibold mt-4 mb-1">Blockquotes</h3>
      <p>Create blockquotes:</p>
      <pre><code>> This is a blockquote.</code></pre>
  
      <h3 class="font-semibold mt-4 mb-1">Horizontal Rule</h3>
      <p>Add a horizontal rule:</p>
      <pre><code>---</code></pre>
  
      <h3 class="font-semibold mt-4 mb-1">Tables</h3>
      <p>Create tables:</p>
      <pre><code>| Column 1 | Column 2 |
  | -------- | -------- |
  | Row 1    | Data     |
  | Row 2    | Data     |</code></pre>
    `;
}

/**
 * Main client-side script:
 * Handles editor/preview toggle, saving content, keyboard shortcuts, etc.
 */
function mainScript(mode, noteId) {
  return `
      document.addEventListener('DOMContentLoaded', () => {
        setupEventListeners();
        renderPreview();
        setMode('${mode}');
      });
  
      let isEditing = '${mode}' === 'edit';
      let debounceTimer;
      const currentNoteId = '${noteId}';
  
      function setupEventListeners() {
        const editor = document.getElementById('editor');
        const previewButton = document.getElementById('preview-button');
        const editButton = document.getElementById('edit-button');
        const saveStatus = document.getElementById('save-status');
  
        editor.addEventListener('input', debounce(() => {
          // Indicate unsaved changes (yellow)
          saveStatus.style.backgroundColor = '#FFD700';
          saveNoteContent()
            .then(() => {
              // Successfully saved (green)
              saveStatus.style.backgroundColor = '#32CD32';
            })
            .catch(() => {
              // Error saving (red)
              saveStatus.style.backgroundColor = '#FF4500';
            });
        }, 500));
  
        // Preview button
        previewButton.addEventListener('click', () => {
          setMode('preview');
          saveModeToDatabase('preview');
        });
  
        // Edit button
        editButton.addEventListener('click', () => {
          setMode('edit');
          saveModeToDatabase('edit');
        });
  
        // Sidebar actions
        document.getElementById('copy-link').addEventListener('click', copyLink);
        document.getElementById('delete-note').addEventListener('click', deleteNote);
        document.getElementById('new-note').addEventListener('click', newNote);
        document.getElementById('clone-note').addEventListener('click', cloneNote);
        document.getElementById('export-note').addEventListener('click', exportNote);
  
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
          // CTRL+S => Save
          if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            saveNoteContent();
          }
          // CTRL+N => New Note
          else if (event.ctrlKey && event.key === 'n') {
            event.preventDefault();
            newNote();
          }
          // CTRL+P => Toggle Preview/Edit
          else if (event.ctrlKey && event.key === 'p') {
            event.preventDefault();
            setMode(isEditing ? 'preview' : 'edit');
            saveModeToDatabase(isEditing ? 'preview' : 'edit');
          }
        });
      }
  
      function setMode(mode) {
        isEditing = mode === 'edit';
        renderPreview();
        localStorage.setItem('editorMode', mode);
      }
  
      async function saveModeToDatabase(mode) {
        if (!currentNoteId) return;
        await fetch('/' + currentNoteId, {
          method: 'POST',
          body: new URLSearchParams({ save_state: mode }),
        }).catch((error) => {
          console.error('Failed to save note mode:', error);
        });
      }
  
      function renderPreview() {
        const editorContainer = document.getElementById('editor-container');
        const previewContainer = document.getElementById('preview-container');
        const editButton = document.getElementById('edit-button');
        const previewButton = document.getElementById('preview-button');
  
        if (isEditing) {
          // Show editor
          editorContainer.style.display = 'block';
          previewContainer.style.display = 'none';
          editButton.style.display = 'none';
          previewButton.style.display = 'inline-block';
        } else {
          // Show preview
          const editor = document.getElementById('editor');
          const preview = document.getElementById('preview');
          const rawHTML = marked.parse(editor.value);
          const cleanHTML = DOMPurify.sanitize(rawHTML);
          preview.innerHTML = cleanHTML;
  
          editorContainer.style.display = 'none';
          previewContainer.style.display = 'block';
          editButton.style.display = 'inline-block';
          previewButton.style.display = 'none';
        }
      }
  
      async function saveNoteContent() {
        if (!currentNoteId) return; // Avoid saving if no noteId
        const content = document.getElementById('editor').value;
        await fetch('/' + currentNoteId, {
          method: 'POST',
          body: new URLSearchParams({ content }),
        }).catch((error) => {
          console.error('Failed to save note content:', error);
        });
      }
  
      function debounce(func, delay) {
        return function() {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(func, delay);
        };
      }
  
      function copyLink() {
        if (!currentNoteId) {
          alert('No note to share. Please create or clone a note first.');
          return;
        }
        const url = new URL(window.location);
        const shareableLink = url.toString();
        navigator.clipboard.writeText(shareableLink)
          .then(() => {
            alert('Link copied to clipboard!');
          })
          .catch(() => {
            alert('Failed to copy link.');
          });
      }
  
      async function deleteNote() {
        if (!currentNoteId) {
          alert('No note to delete.');
          return;
        }
        if (confirm('Are you sure you want to delete this note?')) {
          try {
            await fetch('/' + currentNoteId, { method: 'DELETE' });
            window.location.href = '/';
          } catch (error) {
            console.error('Failed to delete note:', error);
          }
        }
      }
  
      function newNote() {
        window.location.href = '/';
      }
  
      async function cloneNote() {
        if (!currentNoteId) {
          alert('No note to clone.');
          return;
        }
        const content = document.getElementById('editor').value;
        // Create a new note ID
        const newNoteId = [...Array(8)].map(() => Math.random().toString(36)[2]).join('');
        try {
          // Save the current content to the new note
          await fetch('/' + newNoteId, {
            method: 'POST',
            body: new URLSearchParams({ content }),
          });
          // Redirect to the new note
          window.location.href = '/' + newNoteId;
        } catch (error) {
          console.error('Failed to clone note:', error);
        }
      }
  
      function exportNote() {
        if (!currentNoteId) {
          alert('No note to export. Please create or open a note first.');
          return;
        }
        const content = document.getElementById('editor').value;
        const blob = new Blob([content], { type: 'text/markdown' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = currentNoteId + '.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    `;
}

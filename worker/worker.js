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

      return new Response(
        JSON.stringify({ content: noteContent, save_state: saveState }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, DELETE",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
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
    return new Response("Note updated", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } else if (request.method === "DELETE") {
    // Delete a note
    await env.NOTES_DB.prepare("DELETE FROM notes WHERE id = ?")
      .bind(noteId)
      .run();
    return Response.redirect(`${url.origin}/`, 302);
  } else if (request.method === "OPTIONS") {
    // Handle CORS preflight requests
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
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

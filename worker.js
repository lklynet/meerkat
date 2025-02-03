/**
 * Main Worker Export
 */
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
};

async function handleRequest(request, env) {
  // Update CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://notes2.lkly.net",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify API key
  const apiKey = request.headers.get("X-API-Key");
  if (!apiKey) {
    return new Response("Missing API key", {
      status: 401,
      headers: corsHeaders,
    });
  }

  if (apiKey !== env.API_KEY) {
    return new Response("Invalid API key", {
      status: 401,
      headers: corsHeaders,
    });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  // Add CORS headers to all responses
  const baseHeaders = {
    ...corsHeaders,
    "Content-Type": "application/json",
  };

  // Root path: create a new note
  if (path === "/" || path === "") {
    const noteId = generateNoteId();
    const defaultContent = getDefaultNoteContent();
    const timestamp = Math.floor(Date.now() / 1000);

    await env.NOTES_DB.prepare(
      "INSERT INTO notes (id, content, created_at, save_state) VALUES (?, ?, ?, ?)"
    )
      .bind(noteId, defaultContent, timestamp, "edit")
      .run();

    // Return the noteId instead of redirecting
    return new Response(JSON.stringify({ noteId }), {
      headers: baseHeaders,
      status: 200,
    });
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
      return new Response(
        JSON.stringify({
          content: results[0].content,
          save_state: results[0].save_state || "edit",
        }),
        {
          headers: baseHeaders,
          status: 200,
        }
      );
    } else {
      return new Response("Note not found", {
        status: 404,
        headers: baseHeaders,
      });
    }
  } else if (request.method === "POST") {
    const formData = await request.formData();
    const content = formData.get("content");
    const saveState = formData.get("save_state");

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
      headers: baseHeaders,
      status: 200,
    });
  } else if (request.method === "DELETE") {
    await env.NOTES_DB.prepare("DELETE FROM notes WHERE id = ?")
      .bind(noteId)
      .run();

    return new Response("Note deleted", {
      headers: baseHeaders,
      status: 200,
    });
  } else {
    return new Response("Method not allowed", {
      headers: baseHeaders,
      status: 405,
    });
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

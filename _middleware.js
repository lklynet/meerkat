export async function onRequest({ request, env, next }) {
  const response = await next();

  // Only process HTML files
  if (!response.headers.get("content-type")?.includes("text/html")) {
    return response;
  }

  let text = await response.text();

  // Create the environment variables object
  const envVars = {
    API_KEY: env.API_KEY || "",
  };

  // Replace the environment variables placeholder with actual values
  text = text.replace(
    /window\.ENV\s*=\s*{[^}]*}/,
    `window.ENV = ${JSON.stringify(envVars)}`
  );

  return new Response(text, {
    headers: response.headers,
  });
}

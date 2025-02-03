export async function onRequest({ request, env, next }) {
  // Debug environment variables
  console.log("Middleware env:", env);
  console.log("Middleware API_KEY:", env.API_KEY);

  const response = await next();

  // Only process HTML files
  const contentType = response.headers.get("content-type");
  console.log("Content-Type:", contentType);

  if (!contentType?.includes("text/html")) {
    console.log("Skipping non-HTML response");
    return response;
  }

  let text = await response.text();
  console.log(
    "Original text contains window.ENV:",
    text.includes("window.ENV")
  );

  // Create the environment variables object
  const envVars = {
    API_KEY: env.API_KEY || "",
  };

  console.log("Environment variables to inject:", envVars);

  // Replace the environment variables placeholder with actual values
  const newText = text.replace(
    /window\.ENV\s*=\s*{[^}]*}/,
    `window.ENV = ${JSON.stringify(envVars)}`
  );

  console.log("Replacement successful:", text !== newText);
  console.log("New text contains API_KEY:", newText.includes(env.API_KEY));

  return new Response(newText, {
    headers: response.headers,
  });
}

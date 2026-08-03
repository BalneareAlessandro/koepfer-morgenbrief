const allowedOrigins = new Set([
  "https://koepfer-einkauf.github.io",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);
const adminPasswordHash = "0e089d33d6d8b8239c68ccf6da1b922ab3a6e9dc3c6a02e21d5460495a02b7f6";
const encoder = new TextEncoder();

const sha256 = async (value: string) => {
  const bytes = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
};

const constantTimeEqual = (left: string, right: string) => {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
};

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "https://koepfer-einkauf.github.io",
  "Access-Control-Allow-Headers": "content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

const json = (body: unknown, status: number, origin: string | null) => new Response(JSON.stringify(body), {
  status,
  headers: {...corsHeaders(origin), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store"},
});

const secretKey = () => {
  const explicit = Deno.env.get("SUPABASE_SECRET_KEY");
  if (explicit) return explicit;
  const defaults = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
  return defaults.default;
};

Deno.serve(async request => {
  const origin = request.headers.get("Origin");
  if (request.method === "OPTIONS") return new Response(null, {status: 204, headers: corsHeaders(origin)});
  if (request.method !== "POST") return json({error: "Method not allowed"}, 405, origin);
  if (origin && !allowedOrigins.has(origin)) return json({error: "Origin not allowed"}, 403, origin);

  const suppliedPassword = request.headers.get("x-admin-password");
  const suppliedHash = suppliedPassword ? await sha256(suppliedPassword) : "";
  if (!constantTimeEqual(suppliedHash, adminPasswordHash)) {
    return json({error: "Anmeldung fehlgeschlagen"}, 401, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const key = secretKey();
  if (!supabaseUrl || !key) return json({error: "Server configuration missing"}, 500, origin);

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({error: "Invalid JSON"}, 400, origin); }
  const action = body.action;
  const apiHeaders: Record<string, string> = {apikey: key};
  let url = `${supabaseUrl}/rest/v1/article_feedback`;
  let options: RequestInit = {headers: apiHeaders};

  if (action === "list") {
    url += "?select=id,article_id,edition_date,topic,vote,created_at&order=edition_date.desc,created_at.desc";
  } else if (action === "update") {
    const id = body.id;
    const topic = String(body.topic || "").trim().replace(/\s+/g, " ").slice(0, 200);
    const editionDate = String(body.edition_date || "");
    const vote = Number(body.vote);
    if ((typeof id !== "string" && typeof id !== "number") || !topic || !/^\d{4}-\d{2}-\d{2}$/.test(editionDate) || ![-1, 1].includes(vote)) return json({error: "Ungültige Eingabe"}, 400, origin);
    url += `?id=eq.${encodeURIComponent(String(id))}`;
    options = {method: "PATCH", headers: {...apiHeaders, "Content-Type": "application/json", Prefer: "return=minimal"}, body: JSON.stringify({topic, edition_date: editionDate, vote})};
  } else if (action === "delete") {
    const id = body.id;
    if (typeof id !== "string" && typeof id !== "number") return json({error: "Ungültige ID"}, 400, origin);
    url += `?id=eq.${encodeURIComponent(String(id))}`;
    options = {method: "DELETE", headers: {...apiHeaders, Prefer: "return=minimal"}};
  } else {
    return json({error: "Unknown action"}, 400, origin);
  }

  const result = await fetch(url, options);
  if (!result.ok) return json({error: `Database request failed (${result.status})`}, 502, origin);
  if (action === "list") return json(await result.json(), 200, origin);
  return new Response(null, {status: 204, headers: {...corsHeaders(origin), "Cache-Control": "no-store"}});
});

/**
 * Vercel serverless function for the reservation and newsletter forms.
 * Sends an email through Resend when RESEND_API_KEY and ORDERS_TO_EMAIL are set;
 * otherwise it validates, logs and returns a reference (safe for a concept deployment).
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: Record<string, string> = {};
  try {
    body = await request.json();
  } catch {
    return json({ errors: { form: "Invalid request." } }, 400);
  }
  if (body.website) return json({ ok: true, reference: ref() });
  if (!body.email || !EMAIL.test(body.email)) return json({ errors: { email: "Enter a valid email address." } }, 422);

  if (body.kind === "newsletter") {
    await send(`Newsletter signup: ${clean(body.email)}`, `Email: ${clean(body.email)}`);
    return json({ ok: true });
  }
  if (!body.name || body.name.trim().length < 2) return json({ errors: { name: "Tell us your name." } }, 422);
  const reference = ref();
  const text = [`Reference: ${reference}`, `Name: ${clean(body.name)}`, `Email: ${clean(body.email)}`, `Config: ${clean(body.config)}`, `Price: ${clean(body.price)}`].join("\n");
  await send(`Halden One reservation ${reference}`, text, clean(body.email));
  return json({ ok: true, reference });
}

export function GET() {
  return json({ ok: true, service: "halden-reserve" });
}

const clean = (v: unknown, max = 300) => String(v ?? "").replace(/[\r\n]+/g, " ").slice(0, max);
const ref = () => `HD-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
async function send(subject: string, text: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ORDERS_TO_EMAIL;
  if (!key || !to) {
    console.log("[reserve] email not configured; payload:\n" + text);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ from: process.env.ORDERS_FROM_EMAIL || "Halden <onboarding@resend.dev>", to: [to], subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!res.ok) console.error("[reserve] resend failed", res.status, await res.text());
}

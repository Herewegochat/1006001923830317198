import { validDiscordId } from "../lib/discord-id";
import { questions } from "../lib/questions";
export async function apply(request: Request, webhook?: string) {
  const fail = (error: string, status: number) => Response.json({error}, {status});
  if (request.method !== "POST") return fail("Use the application form to submit.", 405);
  if (request.headers.get("origin") !== new URL(request.url).origin) return fail("Reload the form and try again.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return fail("Invalid application.",415);
  const data = await request.json().catch(() => null) as {discordId?:unknown,answers?:unknown} | null;
  const valid = (v: unknown, max: number) => typeof v === "string" && v.trim() && v.length <= max;
  if (!validDiscordId(data?.discordId) || !Array.isArray(data?.answers) || data.answers.length !== 5 || !data.answers.every(a => valid(a,950))) return fail("Enter your Discord user ID and answer all five questions.",400);
  if (!webhook) return fail("Applications are temporarily unavailable.",503);
  const url = new URL(webhook);
  url.searchParams.set("wait","true");
  const answers = data.answers;
  const receipt = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
    content: `<@${data.discordId}>`,
    allowed_mentions: {parse: [], users: [data.discordId]},
    embeds: [{
      author: {name: "Oxford Response API  /  Recruitment"},
      title: "Support intern application",
      description: `**Applicant**  <@${data.discordId}>\n**Discord ID**  \`${data.discordId}\``,
      color: 0x648BFF,
      fields: questions.map((question, index) => ({
        name: String(index + 1).padStart(2, "0") + "  ·  " + question,
        value: answers[index].trim()
      })),
      footer: {text: "Support team  •  Submitted"},
      timestamp: new Date().toISOString()
    }]
  })}).catch(()=>null);
  if (!receipt?.ok) return fail("Discord could not confirm delivery. Your answers are still here. Please try again shortly.",503);
  return Response.json({ok:true});
}

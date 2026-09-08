import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  const { message, history } = await req.json()

  const systemInstruction = `You are a medical intake triage assistant for Girum Hospital in Addis Ababa, Ethiopia.
Respond in the same language the patient uses (Amharic or English).
Ask clear follow-up questions to understand their symptoms, one or two at a time.
Once you have enough information, recommend either: (1) which hospital specialty they should book with, or (2) that they should seek urgent in-person/emergency care if symptoms sound serious.
Never provide a diagnosis or medication advice. Be warm, clear, and concise.`

  const contents = [
    ...(history || []),
    { role: "user", parts: [{ text: message }] }
  ]

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents,
    config: { systemInstruction }
  })

  return Response.json({ reply: response.text })
}
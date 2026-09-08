"use client"
import { useState } from "react"

interface Message {
  role: "user" | "model"
  parts: { text: string }[]
}

export default function SymptomCheckPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: "user", parts: [{ text: input }] }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/symptom-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages }),
      })

      if (!res.ok) {
        setMessages([...newMessages, { role: "model", parts: [{ text: "Sorry, I'm having trouble responding right now. Please try again in a moment." }] }])
        setLoading(false)
        return
      }

      const data = await res.json()
      setMessages([...newMessages, { role: "model", parts: [{ text: data.reply }] }])
    } catch {
      setMessages([...newMessages, { role: "model", parts: [{ text: "Sorry, something went wrong. Please try again." }] }])
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-8 flex flex-col h-screen">
      <h1 className="text-2xl font-bold mb-4">Symptom Checker</h1>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 && (
          <p className="text-gray-500">Describe how you&apos;re feeling, in Amharic or English, and I&apos;ll help guide you.</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded max-w-[80%] ${msg.role === "user" ? "bg-blue-600 text-white ml-auto" : "bg-gray-100 text-gray-900"}`}>
            {msg.parts[0].text}
          </div>
        ))}
        {loading && <div className="bg-gray-100 p-3 rounded max-w-[80%]">Typing...</div>}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your symptoms..."
          className="flex-1 border rounded p-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  )
}
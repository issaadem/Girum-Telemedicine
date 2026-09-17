"use client"
import { useState, useRef } from "react"
import { GoogleGenAI, Modality } from "@google/genai"

interface LiveSession {
  close: () => void
  sendRealtimeInput: (input: { audio: { data: string; mimeType: string } }) => void
}

interface LiveServerMessage {
  serverContent?: {
    modelTurn?: {
      parts?: { inlineData?: { data?: string } }[]
    }
  }
}

export default function VoiceCheckPage() {
  const [status, setStatus] = useState<"idle" | "connecting" | "active" | "error">("idle")
  const [micEnabled, setMicEnabled] = useState(true)
  const sessionRef = useRef<LiveSession | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const nextPlayTimeRef = useRef<number>(0)
  const micEnabledRef = useRef(true)

  function toggleMic() {
    micEnabledRef.current = !micEnabledRef.current
    setMicEnabled(micEnabledRef.current)
  }

  async function startSession() {
    setStatus("connecting")
    try {
      const tokenRes = await fetch("/api/voice-token", { method: "POST" })
      const { token } = await tokenRes.json()

      const client = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: "v1alpha" } })

      const audioContext = new AudioContext({ sampleRate: 24000 })
      audioContextRef.current = audioContext
      nextPlayTimeRef.current = audioContext.currentTime

      const session = await client.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are a friendly medical intake assistant for Girum Hospital in Addis Ababa. Speak in the same language the patient uses (Amharic or English). Ask about their symptoms with short spoken questions, then recommend a specialty to book with, or urgent care if it sounds serious. Never diagnose or prescribe."
        },
        callbacks: {
          onmessage: (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data
            if (audioData && audioContextRef.current) {
              playAudioChunk(audioData, audioContextRef.current)
            }
          },
          onerror: (err: Event) => { console.error("LIVE ERROR:", err); setStatus("error") },
          onclose: (e: CloseEvent) => { console.warn("LIVE CLOSED:", e); setStatus("idle") },
        }
      })

      sessionRef.current = session as unknown as LiveSession

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      })
      streamRef.current = stream
      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)

      processor.onaudioprocess = (e) => {
        const assistantIsTalking = audioContext.currentTime < nextPlayTimeRef.current
        if (!micEnabledRef.current || assistantIsTalking) return

        const inputData = e.inputBuffer.getChannelData(0)
        const pcm16 = floatTo16BitPCM(inputData)
        const base64 = arrayBufferToBase64(pcm16)
        sessionRef.current?.sendRealtimeInput({ audio: { data: base64, mimeType: "audio/pcm;rate=16000" } })
      }

      source.connect(processor)
      processor.connect(audioContext.destination)

      setStatus("active")
    } catch (err) {
      console.error(err)
      setStatus("error")
    }
  }

  function stopSession() {
    sessionRef.current?.close()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioContextRef.current?.close()
    setStatus("idle")
  }

  function floatTo16BitPCM(input: Float32Array) {
    const buffer = new ArrayBuffer(input.length * 2)
    const view = new DataView(buffer)
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]))
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    }
    return buffer
  }

  function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = ""
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
    return btoa(binary)
  }

  function playAudioChunk(base64Data: string, ctx: AudioContext) {
    const binary = atob(base64Data)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

    const int16 = new Int16Array(bytes.buffer)
    const float32 = new Float32Array(int16.length)
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768

    const audioBuffer = ctx.createBuffer(1, float32.length, 24000)
    audioBuffer.copyToChannel(float32, 0)
    const source = ctx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(ctx.destination)

    const startTime = Math.max(ctx.currentTime, nextPlayTimeRef.current)
    source.start(startTime)
    nextPlayTimeRef.current = startTime + audioBuffer.duration
  }

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <h1 className="text-2xl font-bold mb-6">Voice Symptom Checker</h1>
      <p className="text-gray-600 mb-6">
        {status === "idle" && "Tap start and speak naturally, in Amharic or English. Headphones recommended."}
        {status === "connecting" && "Connecting..."}
        {status === "active" && "Listening... speak now."}
        {status === "error" && "Something went wrong. Please try again."}
      </p>
      {status === "idle" || status === "error" ? (
        <button onClick={startSession} className="bg-blue-600 text-white px-6 py-3 rounded-full">
          Start
        </button>
      ) : (
        <div className="flex gap-3 justify-center">
          <button onClick={toggleMic} className={`px-6 py-3 rounded-full ${micEnabled ? "bg-gray-600" : "bg-yellow-600"} text-white`}>
            {micEnabled ? "Mute Mic" : "Unmute Mic"}
          </button>
          <button onClick={stopSession} className="bg-red-600 text-white px-6 py-3 rounded-full">
            End Session
          </button>
        </div>
      )}
    </div>
  )
}
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X } from "lucide-react"

const initialMessages = [{ text: "Hello! How can I assist you today?", isBot: true }]

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      setMessages([...messages, { text: input, isBot: false }])
      // Simulate bot response (in a real-world scenario, this would call an API)
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: "Thank you for your message. Our team will get back to you shortly.", isBot: true },
        ])
      }, 1000)
      setInput("")
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors z-50"
      >
        <MessageCircle />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 w-80 bg-background border border-border rounded-lg shadow-xl z-50"
          >
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-semibold">Chat with us</h3>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="h-80 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.isBot ? "text-left" : "text-right"}`}>
                  <span
                    className={`inline-block p-2 rounded-lg ${message.isBot ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}`}
                  >
                    {message.text}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="border-t border-border p-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


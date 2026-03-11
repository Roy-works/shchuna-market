'use client'

import { useState, useRef } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MessageInputProps {
  onSend: (message: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async () => {
    if (!message.trim() || isSending) return

    setIsSending(true)
    try {
      await onSend(message)
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex gap-2 p-4 border-t border-gray-150">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault()
            handleSubmit()
          }
        }}
        placeholder={placeholder}
        disabled={disabled || isSending}
        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || isSending || !message.trim()}
        aria-label="Send message"
        className={cn(
          'p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:text-gray-200 disabled:cursor-not-allowed',
          isSending && 'animate-spin'
        )}
      >
        <Send size={18} />
      </button>
    </div>
  )
}

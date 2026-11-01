import { useState, useEffect } from 'react'
import { GeneratedData } from './types'

interface UseVoiceoverParams {
  generatedData: GeneratedData | null
  previewSecond: number
  isPlaying: boolean
}

export function useVoiceover({
  generatedData,
  previewSecond,
  isPlaying
}: UseVoiceoverParams) {
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const speakVoiceover = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-CO'
    const voices = window.speechSynthesis.getVoices()
    const esVoice = voices.find(
      v => v.lang.startsWith('es') || v.lang.includes('ES') || v.lang.includes('MX') || v.lang.includes('CO')
    )
    if (esVoice) utterance.voice = esVoice
    utterance.rate = 1.12
    utterance.pitch = 1.05
    window.speechSynthesis.speak(utterance)
  }

  const stopVoiceover = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  // Locución reactiva según segundo del video
  useEffect(() => {
    if (isVoiceActive && !isMuted && isPlaying && generatedData) {
      if (previewSecond === 1) {
        speakVoiceover(generatedData.hook)
      } else if (previewSecond === 4) {
        speakVoiceover(generatedData.script)
      }
    }
  }, [previewSecond, isVoiceActive, isMuted, isPlaying, generatedData])

  const toggleVoice = () => {
    const nextVoice = !isVoiceActive
    setIsVoiceActive(nextVoice)
    if (nextVoice && generatedData) {
      speakVoiceover(previewSecond <= 4 ? generatedData.hook : generatedData.script)
    } else {
      stopVoiceover()
    }
  }

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev
      if (!next) stopVoiceover()
      return next
    })
  }

  return {
    isVoiceActive,
    isMuted,
    speakVoiceover,
    stopVoiceover,
    toggleVoice,
    toggleMute
  }
}

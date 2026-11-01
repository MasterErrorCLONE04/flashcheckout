import { 
  Product, 
  Coupon, 
  GeneratedData, 
  AiAvatar, 
  AvatarLayout, 
  MusicTrack, 
  CreativeTone,
  CHORD_PROGRESSIONS,
  formatCOP
} from './types'

export interface RenderVideoParams {
  selectedProduct: Product
  generatedData: GeneratedData
  selectedAvatar: AiAvatar
  avatarLayout: AvatarLayout
  duration: '15s' | '30s'
  musicTrack: MusicTrack
  tone: CreativeTone
  selectedCoupon?: Coupon
  store: {
    name: string
    slug: string
  }
  onProgress?: (percent: number) => void
}

export interface RenderVideoResult {
  blob: Blob
  fileExt: string
  selectedMime: string
  sanitizedName: string
}

export async function renderStudioVideo(params: RenderVideoParams): Promise<RenderVideoResult> {
  const {
    selectedProduct,
    generatedData,
    selectedAvatar,
    avatarLayout,
    duration,
    musicTrack,
    tone,
    selectedCoupon,
    store,
    onProgress
  } = params

  onProgress?.(5)

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo inicializar el motor de render')

  // Pre-cargar la imagen del producto con soporte CORS y fallback seguro
  let imageLoadFailed = false
  const img = new (window as any).Image()
  img.crossOrigin = 'anonymous'

  await new Promise((resolve) => {
    if (!selectedProduct.imageUrl) {
      imageLoadFailed = true
      resolve(true)
      return
    }
    img.onload = () => resolve(true)
    img.onerror = () => {
      console.warn('[Studio IA] Imagen externa con CORS no habilitado. Usando renderizado cinemático vector.')
      imageLoadFailed = true
      resolve(true)
    }
    img.src = selectedProduct.imageUrl
  })

  // Pre-cargar la imagen del avatar seleccionado si no está en 'NONE'
  let avatarLoadFailed = false
  const avatarImg = new (window as any).Image()
  avatarImg.crossOrigin = 'anonymous'

  if (avatarLayout !== 'NONE' && selectedAvatar?.imageUrl) {
    await new Promise((resolve) => {
      avatarImg.onload = () => resolve(true)
      avatarImg.onerror = () => {
        console.warn('[Studio IA] Imagen de avatar no disponible vía CORS.')
        avatarLoadFailed = true
        resolve(true)
      }
      avatarImg.src = selectedAvatar.imageUrl
    })
  }

  onProgress?.(15)

  // Identificar formato de video soportado por el navegador
  const mimeTypes = [
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=h264',
    'video/webm;codecs=vp9',
    'video/webm'
  ]
  const selectedMime = mimeTypes.find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm'
  const isActualMp4 = selectedMime.includes('mp4')
  const fileExt = isActualMp4 ? 'mp4' : 'webm'
  const totalSeconds = duration === '15s' ? 10 : 15

  // Iniciar sintetizador de audio profesional con voz de IA y música comercial
  let audioCtx: AudioContext | null = null
  let audioDest: MediaStreamAudioDestinationNode | null = null

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume()
      }
      audioDest = audioCtx.createMediaStreamDestination()

      // 1. Obtener locución real de la IA
      try {
        const voiceRes = await fetch('/api/studio-ia/generate-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `${generatedData.hook}. ${generatedData.script}`,
            voice: tone === 'luxury' ? 'onyx' : tone === 'casual' ? 'shimmer' : 'nova'
          })
        })
        if (voiceRes.ok) {
          const arrayBuffer = await voiceRes.arrayBuffer()
          if (arrayBuffer.byteLength > 500) {
            const voiceBuffer = await audioCtx.decodeAudioData(arrayBuffer)
            const voiceSource = audioCtx.createBufferSource()
            voiceSource.buffer = voiceBuffer
            const voiceGain = audioCtx.createGain()
            voiceGain.gain.setValueAtTime(1.0, audioCtx.currentTime) // Voz al 100%
            voiceSource.connect(voiceGain)
            voiceGain.connect(audioDest)
            voiceSource.start(audioCtx.currentTime + 0.2) // Inicia a los 200ms
          }
        }
      } catch (vErr) {
        console.warn('[Studio IA Voiceover Download Error]:', vErr)
      }

      // 2. Mezclar pista musical de fondo comercial
      const musicGain = audioCtx.createGain()
      musicGain.gain.setValueAtTime(0.18, audioCtx.currentTime) // 18% para no tapar la voz
      musicGain.connect(audioDest)

      const filter = audioCtx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(musicTrack === 'lofi' ? 700 : 1300, audioCtx.currentTime)
      filter.connect(musicGain)

      const chords = CHORD_PROGRESSIONS[musicTrack] || CHORD_PROGRESSIONS.viral
      const chordDuration = 2.0
      const totalChords = Math.ceil(totalSeconds / chordDuration)

      for (let i = 0; i < totalChords; i++) {
        const chord = chords[i % chords.length]
        const startTime = audioCtx.currentTime + (i * chordDuration)

        chord.forEach((freq) => {
          if (!audioCtx) return
          const osc = audioCtx.createOscillator()
          const noteGain = audioCtx.createGain()
          osc.type = musicTrack === 'luxury' ? 'sine' : musicTrack === 'lofi' ? 'triangle' : 'sawtooth'
          osc.frequency.setValueAtTime(freq, startTime)

          noteGain.gain.setValueAtTime(0.001, startTime)
          noteGain.gain.exponentialRampToValueAtTime(0.07, startTime + 0.12)
          noteGain.gain.exponentialRampToValueAtTime(0.04, startTime + chordDuration * 0.7)
          noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + chordDuration - 0.05)

          osc.connect(noteGain)
          noteGain.connect(filter)
          osc.start(startTime)
          osc.stop(startTime + chordDuration)
        })

        // Golpe suave de bajo rítmico en cada cambio
        const bassOsc = audioCtx.createOscillator()
        const bassGain = audioCtx.createGain()
        bassOsc.type = 'sine'
        bassOsc.frequency.setValueAtTime(chord[0] / 2, startTime)
        bassGain.gain.setValueAtTime(0.14, startTime)
        bassGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.55)
        bassOsc.connect(bassGain)
        bassGain.connect(musicGain)
        bassOsc.start(startTime)
        bassOsc.stop(startTime + 0.6)
      }
    }
  } catch (audioErr) {
    console.warn('[Studio IA Audio Track]', audioErr)
  }

  const canvasStream = canvas.captureStream(30)
  let combinedStream = canvasStream
  if (audioDest && audioDest.stream.getAudioTracks().length > 0) {
    combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioDest.stream.getAudioTracks()
    ])
  }

  const recorder = new MediaRecorder(combinedStream, {
    mimeType: selectedMime,
    videoBitsPerSecond: 6000000 // 6 Mbps alta definición
  })

  const chunks: Blob[] = []
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data)
  }

  const fps = 30
  const totalFrames = totalSeconds * fps

  return new Promise((resolve, reject) => {
    recorder.start()

    let frame = 0
    const renderLoop = () => {
      if (frame >= totalFrames) {
        recorder.stop()
        return
      }

      const t = frame / fps
      const progressPercent = Math.round((frame / totalFrames) * 80) + 15
      onProgress?.(progressPercent)

      // 1. Limpiar lienzo con fondo cinemático
      ctx.fillStyle = '#0a0a0c'
      ctx.fillRect(0, 0, 1080, 1920)

      // 2. DIBUJADO SEGÚN EL MODO DE AVATAR (SPLIT_UGC | BUBBLE_PIP | NONE)
      if (avatarLayout === 'SPLIT_UGC') {
        // --- MODO PANTALLA DIVIDIDA 50/50 ---
        // MITAD SUPERIOR: AVATAR UGC (y: 0 a 860)
        if (!avatarLoadFailed && avatarImg.complete && avatarImg.naturalWidth > 0) {
          try {
            const avZoom = 1.0 + Math.sin(t * 3) * 0.02
            const avW = 1080 * avZoom
            const avH = 880 * avZoom
            const avOx = (1080 - avW) / 2
            const avOy = (860 - avH) / 2
            ctx.drawImage(avatarImg, avOx, avOy, avW, avH)
          } catch (e) {
            avatarLoadFailed = true
          }
        }
        if (avatarLoadFailed || !avatarImg.complete || avatarImg.naturalWidth === 0) {
          const avGrad = ctx.createLinearGradient(0, 0, 0, 860)
          avGrad.addColorStop(0, '#2e1065')
          avGrad.addColorStop(1, '#09090b')
          ctx.fillStyle = avGrad
          ctx.fillRect(0, 0, 1080, 860)
        }

        // Sombra en base de mitad superior
        const avShadow = ctx.createLinearGradient(0, 680, 0, 860)
        avShadow.addColorStop(0, 'transparent')
        avShadow.addColorStop(1, 'rgba(0,0,0,0.95)')
        ctx.fillStyle = avShadow
        ctx.fillRect(0, 680, 1080, 180)

        // Badge del creador UGC
        ctx.fillStyle = 'rgba(0,0,0,0.7)'
        ctx.beginPath()
        ctx.roundRect(80, 750, 480, 75, 20)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 32px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`🎙️ ${selectedAvatar.name} • Creador UGC`, 110, 800)

        // MITAD INFERIOR: PRODUCTO (y: 860 a 1920)
        if (!imageLoadFailed && img.complete && img.naturalWidth > 0) {
          try {
            const pZoom = 1.0 + (t / totalSeconds) * 0.15
            const pW = 1080 * pZoom
            const pH = 1060 * pZoom
            const pOx = (1080 - pW) / 2
            const pOy = 860 + (1060 - pH) / 2
            ctx.drawImage(img, pOx, pOy, pW, pH)
          } catch (e) {
            imageLoadFailed = true
          }
        }
        if (imageLoadFailed || !img.complete || img.naturalWidth === 0) {
          const pGrad = ctx.createLinearGradient(0, 860, 0, 1920)
          pGrad.addColorStop(0, '#1e1b4b')
          pGrad.addColorStop(1, '#09090b')
          ctx.fillStyle = pGrad
          ctx.fillRect(0, 860, 1080, 1060)
        }
      } else {
        // --- MODO PANTALLA COMPLETA DEL PRODUCTO ---
        if (!imageLoadFailed && img.complete && img.naturalWidth > 0) {
          try {
            const zoom = 1.0 + (t / totalSeconds) * 0.18
            const w = 1080 * zoom
            const h = 1920 * zoom
            const ox = (1080 - w) / 2
            const oy = (1920 - h) / 2
            ctx.drawImage(img, ox, oy, w, h)
          } catch (corsErr) {
            imageLoadFailed = true
          }
        }
        if (imageLoadFailed || !img.complete || img.naturalWidth === 0) {
          const grad = ctx.createLinearGradient(0, 0, 1080, 1920)
          grad.addColorStop(0, '#1e1b4b')
          grad.addColorStop(0.5, '#2e1065')
          grad.addColorStop(1, '#09090b')
          ctx.fillStyle = grad
          ctx.fillRect(0, 0, 1080, 1920)
        }
      }

      // Sombras superior e inferior
      const topGrad = ctx.createLinearGradient(0, 0, 0, 420)
      topGrad.addColorStop(0, 'rgba(0,0,0,0.85)')
      topGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = topGrad
      ctx.fillRect(0, 0, 1080, 420)

      const btmGrad = ctx.createLinearGradient(0, 1250, 0, 1920)
      btmGrad.addColorStop(0, 'transparent')
      btmGrad.addColorStop(1, 'rgba(0,0,0,0.92)')
      ctx.fillStyle = btmGrad
      ctx.fillRect(0, 1250, 1080, 670)

      // 3. Cabecera Tienda
      ctx.fillStyle = 'rgba(0,0,0,0.65)'
      ctx.beginPath()
      ctx.roundRect(60, 60, 520, 100, 50)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = '#7c3aed'
      ctx.beginPath()
      ctx.arc(115, 110, 36, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 34px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(store.name.charAt(0).toUpperCase(), 115, 122)

      ctx.textAlign = 'left'
      ctx.font = 'bold 34px sans-serif'
      ctx.fillText(store.name.slice(0, 18), 175, 122)

      // 4. SUBTÍTULOS ESTILO CAPCUT (KARAOKE DINÁMICO PALABRA POR PALABRA)
      const fullScript = (t <= 3.2 ? generatedData.hook : generatedData.script)
        .replace(/[*#_~`]/g, '')
        .trim()
      const allWords = fullScript.split(/\s+/).filter(Boolean)
      const scriptDuration = t <= 3.2 ? 3.2 : (totalSeconds - 3.2)
      const elapsedScript = t <= 3.2 ? t : (t - 3.2)
      const activeWordIndex = Math.min(
        Math.floor((elapsedScript / scriptDuration) * allWords.length),
        Math.max(0, allWords.length - 1)
      )

      // Ventana de 3 a 4 palabras visibles con karaoke fluido
      const windowSize = 4
      const chunkIndex = Math.floor(activeWordIndex / windowSize)
      const startIdx = chunkIndex * windowSize
      const visibleWords = allWords.slice(startIdx, startIdx + windowSize)

      const subY = avatarLayout === 'SPLIT_UGC' ? 1000 : 840

      ctx.save()
      ctx.fillStyle = 'rgba(0, 0, 0, 0.82)'
      ctx.beginPath()
      ctx.roundRect(60, subY - 80, 960, 150, 26)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.font = '900 46px system-ui, -apple-system, sans-serif'
      let phraseTotalWidth = 0
      const wordMetrics = visibleWords.map(w => {
        const m = ctx.measureText(w.toUpperCase() + ' ')
        phraseTotalWidth += m.width
        return m.width
      })

      let wordStartX = 540 - (phraseTotalWidth / 2)

      visibleWords.forEach((word, idx) => {
        const globalIdx = startIdx + idx
        const isActive = globalIdx === activeWordIndex
        const wWidth = wordMetrics[idx]
        const wordCenterX = wordStartX + (wWidth / 2)

        ctx.save()
        if (isActive) {
          ctx.font = '900 52px system-ui, -apple-system, sans-serif'
          ctx.fillStyle = '#facc15' // Amarillo CapCut brillante
          ctx.shadowColor = 'rgba(250, 204, 21, 0.85)'
          ctx.shadowBlur = 18

          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 10
          ctx.strokeText(word.toUpperCase(), wordCenterX, subY)
          ctx.fillText(word.toUpperCase(), wordCenterX, subY)
        } else {
          ctx.font = '800 44px system-ui, -apple-system, sans-serif'
          ctx.fillStyle = '#ffffff'
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)'
          ctx.lineWidth = 6
          ctx.strokeText(word.toUpperCase(), wordCenterX, subY)
          ctx.fillText(word.toUpperCase(), wordCenterX, subY)
        }
        ctx.restore()

        wordStartX += wWidth
      })
      ctx.restore()

      // 5. SI ESTÁ ACTIVO MODO BURBUJA FLOTANTE (BUBBLE_PIP)
      if (avatarLayout === 'BUBBLE_PIP') {
        const bubbleX = 180
        const bubbleY = 1380
        const bubbleRadius = 95

        // Anillo reactivo de audio (pulso suave de onda de voz)
        ctx.save()
        const ringPulse = Math.sin(t * 12) * 8
        ctx.beginPath()
        ctx.arc(bubbleX, bubbleY, bubbleRadius + 10 + ringPulse, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.75)'
        ctx.lineWidth = 6
        ctx.stroke()

        // Círculo de la foto del avatar
        ctx.beginPath()
        ctx.arc(bubbleX, bubbleY, bubbleRadius, 0, Math.PI * 2)
        ctx.clip()

        if (!avatarLoadFailed && avatarImg.complete && avatarImg.naturalWidth > 0) {
          try {
            ctx.drawImage(avatarImg, bubbleX - bubbleRadius, bubbleY - bubbleRadius, bubbleRadius * 2, bubbleRadius * 2)
          } catch (e) {
            avatarLoadFailed = true
          }
        }
        if (avatarLoadFailed || !avatarImg.complete || avatarImg.naturalWidth === 0) {
          ctx.fillStyle = '#7c3aed'
          ctx.fillRect(bubbleX - bubbleRadius, bubbleY - bubbleRadius, bubbleRadius * 2, bubbleRadius * 2)
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 44px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(selectedAvatar.name.charAt(0), bubbleX, bubbleY + 15)
        }
        ctx.restore()

        // Badge con el nombre del Avatar
        ctx.save()
        ctx.fillStyle = 'rgba(15, 15, 20, 0.85)'
        ctx.beginPath()
        ctx.roundRect(bubbleX - 110, bubbleY + bubbleRadius + 12, 220, 48, 14)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.lineWidth = 1.5
        ctx.stroke()

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 24px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`🎙️ ${selectedAvatar.name} (IA)`, bubbleX, bubbleY + bubbleRadius + 34)
        ctx.restore()
      }

      // 6. Precios y Cupón
      ctx.textAlign = 'left'
      ctx.fillStyle = '#cbd5e1'
      ctx.font = 'bold 30px sans-serif'
      ctx.fillText('PRECIO ESPECIAL', 80, 1540)

      ctx.fillStyle = '#ffffff'
      ctx.font = '900 84px sans-serif'
      ctx.fillText(formatCOP(selectedProduct.price), 80, 1630)

      if (selectedCoupon) {
        ctx.fillStyle = '#ec4899'
        ctx.beginPath()
        ctx.roundRect(600, 1550, 400, 80, 20)
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.font = '900 36px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`-${selectedCoupon.valor} OFF`, 800, 1605)
      }

      // 7. Botón CTA
      ctx.save()
      ctx.shadowColor = 'rgba(16,185,129,0.5)'
      ctx.shadowBlur = 25
      ctx.shadowOffsetY = 5

      ctx.fillStyle = '#10b981'
      ctx.beginPath()
      ctx.roundRect(80, 1680, 920, 130, 35)
      ctx.fill()

      ctx.fillStyle = '#022c22'
      ctx.font = '900 44px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`🛍️ ${generatedData.callToAction || 'COMPRAR EN 1 CLIC'}`, 540, 1762)

      ctx.restore()

      // Enlace
      ctx.fillStyle = '#94a3b8'
      ctx.font = '600 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`flashcheckout.co/tienda/${store.slug}`, 540, 1855)

      frame++
      setTimeout(renderLoop, 1000 / fps)
    }

    recorder.onstop = () => {
      if (audioCtx) {
        try { audioCtx.close() } catch (e) {}
      }
      const blob = new Blob(chunks, { type: selectedMime })
      const sanitized = selectedProduct.name.replace(/[^a-zA-Z0-9]/g, '_')
      onProgress?.(100)
      resolve({
        blob,
        fileExt,
        selectedMime,
        sanitizedName: sanitized
      })
    }

    recorder.onerror = (event: any) => {
      if (audioCtx) {
        try { audioCtx.close() } catch (e) {}
      }
      reject(event.error || new Error('Error durante la grabación de video'))
    }

    renderLoop()
  })
}

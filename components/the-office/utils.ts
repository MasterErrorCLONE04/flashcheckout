export const removeWhiteBg = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(url)
      return
    }
    const img = new Image()
    img.src = url
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(url)
        return
      }
      ctx.drawImage(img, 0, 0)
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imgData.data
        // Target pixels that are white/extremely light grey
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0 // Transparent alpha
          }
        }
        ctx.putImageData(imgData, 0, 0)
        resolve(canvas.toDataURL())
      } catch (e) {
        console.warn('[Sprite Clean] Canvas blocked: Same-origin verification required.', e)
        resolve(url)
      }
    }
    img.onerror = () => resolve(url)
  })
}

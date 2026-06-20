import { useEffect } from 'react'

/**
 * useTilt — adds 3D perspective tilt to any element with [data-tilt] attribute.
 * Call once in a layout component.
 */
export function useTilt(selector = '[data-tilt]') {
  useEffect(() => {
    const bind = () => {
      const cards = document.querySelectorAll(selector)
      cards.forEach(card => {
        const onMove = (e) => {
          const rect = card.getBoundingClientRect()
          const cx   = rect.left + rect.width  / 2
          const cy   = rect.top  + rect.height / 2
          const dx   = (e.clientX - cx) / (rect.width  / 2)
          const dy   = (e.clientY - cy) / (rect.height / 2)
          const tiltX = dy * -8
          const tiltY = dx *  8
          card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02,1.02,1.02) translateZ(10px)`
          card.style.transition = 'transform 0.1s ease-out'
          // Inner glow
          const glowX = (dx + 1) / 2 * 100
          const glowY = (dy + 1) / 2 * 100
          card.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(0,255,136,0.06), transparent 60%), rgba(255,255,255,0.04)`
        }
        const onLeave = () => {
          card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1) translateZ(0)'
          card.style.transition = 'transform 0.5s ease-out'
          card.style.background = ''
        }
        card.addEventListener('mousemove', onMove)
        card.addEventListener('mouseleave', onLeave)
        card._tiltCleanup = () => {
          card.removeEventListener('mousemove', onMove)
          card.removeEventListener('mouseleave', onLeave)
        }
      })
    }
    // Bind after DOM paint
    const t = setTimeout(bind, 400)
    return () => {
      clearTimeout(t)
      document.querySelectorAll(selector).forEach(c => c._tiltCleanup?.())
    }
  }, [selector])
}

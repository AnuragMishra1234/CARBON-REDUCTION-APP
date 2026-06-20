import { useEffect, useRef } from 'react'

/**
 * ThreeBackground – A full Three.js zero-gravity particle universe.
 * Reads window.THREE injected via CDN in index.html.
 * Features:
 *  - 4000 stars with depth
 *  - 300 glowing green/cyan/purple particles floating in 3D space
 *  - Mouse parallax moves camera subtly
 *  - Shooting star effect every 4s
 *  - Subtle fog for depth illusion
 */
export default function ThreeBackground({ className = '' }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const THREE = window.THREE
    if (!THREE || !mountRef.current) return

    const container = mountRef.current
    const W = container.clientWidth
    const H = container.clientHeight

    // ── Renderer ────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x020810, 1)
    container.appendChild(renderer.domElement)

    // ── Scene + Camera ───────────────────────────────────────
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x020810, 0.0012)
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 2000)
    camera.position.set(0, 0, 80)

    // ── Starfield ────────────────────────────────────────────
    const starGeo = new THREE.BufferGeometry()
    const starCount = 4000
    const starPos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 1800
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.6,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true
    })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    // ── Floating Particles ───────────────────────────────────
    const particleColors = [0x00ff88, 0x00d4ff, 0x7c3aed, 0xf59e0b, 0x00ff88]
    const particleGroups = []
    particleColors.forEach(color => {
      const geo = new THREE.BufferGeometry()
      const count = 60
      const pos = new Float32Array(count * 3)
      for (let i = 0; i < count * 3; i++) {
        pos[i] = (Math.random() - 0.5) * 400
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const mat = new THREE.PointsMaterial({
        color,
        size: Math.random() * 1.5 + 0.5,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
      })
      const pts = new THREE.Points(geo, mat)
      scene.add(pts)
      particleGroups.push(pts)
    })

    // ── Central Glow Sphere (Earth) ──────────────────────────
    const earthGeo = new THREE.SphereGeometry(14, 64, 64)
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x003311,
      emissive: 0x00ff44,
      emissiveIntensity: 0.12,
      transparent: true,
      opacity: 0.0 // hidden by default; visible only on landing
    })
    const earth = new THREE.Mesh(earthGeo, earthMat)
    earth.position.set(0, 0, 0)
    scene.add(earth)

    // ── Orbital Rings ────────────────────────────────────────
    const ringColors = [0x00ff88, 0x00d4ff, 0x7c3aed]
    const rings = []
    ringColors.forEach((color, i) => {
      const geo = new THREE.TorusGeometry(22 + i * 8, 0.15, 8, 100)
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15 - i * 0.04 })
      const ring = new THREE.Mesh(geo, mat)
      ring.rotation.x = Math.PI / 2 + (i * 0.3)
      ring.rotation.z = i * 0.5
      scene.add(ring)
      rings.push(ring)
    })

    // ── Ambient + Point Lights ───────────────────────────────
    const ambient = new THREE.AmbientLight(0x002211, 0.5)
    scene.add(ambient)
    const greenLight = new THREE.PointLight(0x00ff88, 1.5, 200)
    greenLight.position.set(0, 30, 50)
    scene.add(greenLight)
    const cyanLight = new THREE.PointLight(0x00d4ff, 0.8, 150)
    cyanLight.position.set(-50, -20, 30)
    scene.add(cyanLight)

    // ── Mouse parallax ───────────────────────────────────────
    const mouse = { x: 0, y: 0 }
    const handleMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouse)

    // ── Shooting stars ───────────────────────────────────────
    const shooters = []
    const spawnShooter = () => {
      const mat = new THREE.LineBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.8 })
      const pts = [
        new THREE.Vector3((Math.random() - 0.5) * 600, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 200),
        new THREE.Vector3(0, 0, 0)
      ]
      pts[1].copy(pts[0]).addScaledVector(new THREE.Vector3(1, -0.5, 0).normalize(), 30)
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      const line = new THREE.Line(geo, mat)
      scene.add(line)
      shooters.push({ line, mat, life: 1.0, decay: 0.05 })
    }
    const shootTimer = setInterval(spawnShooter, 4000)

    // ── Resize handler ───────────────────────────────────────
    const onResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // ── Animation loop ───────────────────────────────────────
    let frame = 0
    let raf
    const animate = () => {
      raf = requestAnimationFrame(animate)
      frame++

      // Rotate starfield slowly
      stars.rotation.y += 0.00015
      stars.rotation.x += 0.00008

      // Float particles
      particleGroups.forEach((p, i) => {
        p.rotation.y += 0.0003 * (i % 2 === 0 ? 1 : -1)
        p.rotation.x += 0.0001 * (i + 1)
      })

      // Spin orbital rings
      rings.forEach((r, i) => {
        r.rotation.z += 0.001 * (i % 2 === 0 ? 1 : -1)
        r.rotation.x += 0.0005 * (i + 1)
      })

      // Pulsing earth glow
      greenLight.intensity = 1.2 + Math.sin(frame * 0.02) * 0.4

      // Mouse parallax camera
      camera.position.x += (mouse.x * 12 - camera.position.x) * 0.04
      camera.position.y += (mouse.y * 8 - camera.position.y) * 0.04
      camera.lookAt(scene.position)

      // Shoot stars decay
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i]
        s.life -= s.decay
        s.mat.opacity = s.life * 0.8
        if (s.life <= 0) {
          scene.remove(s.line)
          shooters.splice(i, 1)
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    // ── Cleanup ──────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(shootTimer)
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ background: '#020810' }}
    />
  )
}

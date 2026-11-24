import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from '@/lib/gsap'
import { Cloth } from '@/lib/clothSim'
import post1 from '@/assets/images/post1.webp'
import post2 from '@/assets/images/post2.webp'
import post3 from '@/assets/images/post3.webp'
import post4 from '@/assets/images/post4.webp'
import post5 from '@/assets/images/post5.webp'
import post6 from '@/assets/images/post6.webp'
import post7 from '@/assets/images/post7.webp'
import post8 from '@/assets/images/post8.webp'
import post9 from '@/assets/images/post9.webp'
import post10 from '@/assets/images/post10.webp'

/**
 * Creates an ultra-soft radial ambient drop shadow texture
 * matching the tactile depth of domgl-cloth & A24 editorial posters.
 */
function createSoftShadowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const grad = ctx.createRadialGradient(128, 128, 36, 128, 128, 124)
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.52)')
  grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.24)')
  grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.07)')
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 256)

  const tex = new THREE.CanvasTexture(canvas)
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  return tex
}

/**
 * Custom Cloth Shader Material based on domgl-cloth:
 * - Normalized lighting relative to resting plane (lightFactor = 1.0 at rest)
 *   ensuring 100% natural, crisp, vibrant artwork colors with zero dark/blackish falloff.
 * - Dynamic fabric sheen on glancing angles.
 * - depthTest: false & depthWrite: false with sorted renderOrder completely eliminates
 *   any 3D plane intersection cutout / clipping glitch.
 */
function createClothMaterial(texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: texture },
      uLight: { value: new THREE.Vector3(0.25, 0.45, 1.0).normalize() },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform vec3 uLight;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vec4 texColor = texture2D(uMap, vUv);
        vec3 n = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // Ambient + wrap lighting relative to rest normal (0, 0, 1)
        float wrap = 0.45;
        float facing = clamp((dot(n, uLight) + wrap) / (1.0 + wrap), 0.0, 1.0);
        float lying = (dot(vec3(0.0, 0.0, 1.0), uLight) + wrap) / (1.0 + wrap);
        
        // Exact domgl-cloth formula: 1.0 at rest, subtle shadow on ripples
        float lightFactor = 0.88 + 0.12 * (facing / max(lying, 0.01));
        
        // Glancing fabric sheen
        float glance = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);
        vec3 sheen = vec3(1.0) * glance * 0.18;

        vec3 rgb = texColor.rgb * lightFactor + sheen;
        gl_FragColor = vec4(rgb, texColor.a);
        #include <colorspace_fragment>
      }
    `,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  })
}

export default function ClothCanvas({ motionProgressRef, activeProjectIndex = 0, onActiveProjectChange }) {
  const canvasRef = useRef(null)
  const lastActiveProjectRef = useRef(0)
  const targetProjectRef = useRef(activeProjectIndex)

  useEffect(() => {
    targetProjectRef.current = activeProjectIndex
  }, [activeProjectIndex])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let width = canvas.clientWidth || window.innerWidth
    let height = canvas.clientHeight || window.innerHeight

    // Three.js Scene Setup
    const scene = new THREE.Scene()

    // 1:1 Pixel Mapping Perspective Camera with Enhanced 3D Foreshortening
    const fov = 48
    const cameraZ = height / (2 * Math.tan((fov * Math.PI) / 360))
    const camera = new THREE.PerspectiveCamera(fov, width / height, 1, cameraZ * 4)
    camera.position.set(0, 0, cameraZ)
    camera.lookAt(0, 0, 0)

    // WebGL Renderer with High Precision & sRGB output
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.sortObjects = true

    // Texture Loader with sRGB color space
    const textureLoader = new THREE.TextureLoader()
    const loadTex = (src) => {
      const tex = textureLoader.load(src)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.generateMipmaps = false
      return tex
    }

    const textures = [
      loadTex(post3), // 0: SEOUL STREET
      loadTex(post1), // 1: BRUTO SPECIALTY COFFEE
      loadTex(post2), // 2: KOREAN STREET MARKET
      loadTex(post4), // 3: MADE FOR MORE
      loadTex(post5), // 4: CUKE PICKLES
      loadTex(post6), // 5: COSTRA BURGERS
      loadTex(post7), // 6: BLUEBERRY CRISP
      loadTex(post8), // 7: GASTOWN SUNDAY SET
      loadTex(post9), // 8: WILD GROVE
      loadTex(post10), // 9: LUSH HAIRCARE
    ]
    const shadowTex = createSoftShadowTexture()

    // Cloth Grid Resolution (15 x 20 particles = silky XPBD fabric physics)
    const NX = 15
    const NY = 20

    // 10 Cloth Posters Sequence along the diagonal ribbon (showcasing all 10 real projects)
    const N = 10
    const dxVw = 21 // vw spacing between card centers along diagonal
    const totalDistVw = N * dxVw // 210vw
    const minXVw = -28
    const maxXvw = minXVw + totalDistVw // 182vw
    const wrapX = gsap.utils.wrap(minXVw, maxXvw)

    // Base card dimensions (3:4 portrait aspect ratio)
    const baseW = Math.max(260, Math.min(width * 0.24, 370))
    const baseH = baseW * (4 / 3)

    const sheets = []
    const sheetMeshes = []

    for (let i = 0; i < N; i++) {
      const cloth = new Cloth(baseW, baseH, NX, NY)
      cloth.place(-baseW / 2, -baseH / 2, 0)
      cloth.wake()

      const geometry = new THREE.PlaneGeometry(baseW, baseH, NX - 1, NY - 1)
      const material = createClothMaterial(textures[i % textures.length])
      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)
      sheetMeshes.push(mesh)

      // Add ambient soft drop shadow plane behind each card
      let shadowMesh = null
      if (shadowTex) {
        const shadowGeo = new THREE.PlaneGeometry(baseW * 1.14, baseH * 1.14)
        const shadowMat = new THREE.MeshBasicMaterial({
          map: shadowTex,
          transparent: true,
          opacity: 0.35,
          depthWrite: false,
          depthTest: false,
        })
        shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
        shadowMesh.position.set(14, -20, -10)
        mesh.add(shadowMesh)
      }

      sheets.push({
        cloth,
        geometry,
        material,
        mesh,
        shadowMesh,
        w: baseW,
        h: baseH,
        index: i,
        lastX: 0,
        lastY: 0,
        lastZ: 0,
        lastBx: undefined,
        lastBy: undefined,
      })
    }

    // =========================================================================
    // Direct, Butter-Smooth Drag & Elastic Anticipation Scroll
    // =========================================================================
    const initialTargetCard = activeProjectIndex || 0
    let currentOffset = 50 - initialTargetCard * dxVw
    let targetOffset = currentOffset
    let momentumVelocity = 0
    let isDragging = false
    let lastAlong = 0
    let dragVelocity = 0
    let lastMoveTime = 0

    // Diagonal axis projection vector [cos(25°), -sin(25°)] matching the ~25°-30° diagonal trajectory
    const AXIS_X = 0.906
    const AXIS_Y = -0.423
    const along = (x, y) => x * AXIS_X + y * AXIS_Y

    // Raycaster for mouse wind ripple brush
    const raycaster = new THREE.Raycaster()
    const mouseNdc = new THREE.Vector2(-999, -999)

    const updateMousePos = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect()
      mouseNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1
      mouseNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1
    }

    const onPointerDown = (e) => {
      if (e.target.closest('button')) return
      isDragging = true
      lastAlong = along(e.clientX, e.clientY)
      dragVelocity = 0
      momentumVelocity = 0
      lastMoveTime = performance.now()
      updateMousePos(e.clientX, e.clientY)

      try {
        canvas.setPointerCapture(e.pointerId)
      } catch (_) {}
    }

    const onPointerMove = (e) => {
      const now = performance.now()
      const dt = Math.max(1, now - lastMoveTime)
      lastMoveTime = now

      updateMousePos(e.clientX, e.clientY)

      if (isDragging) {
        const curAlong = along(e.clientX, e.clientY)
        // Dragging along the diagonal towards top-right advances the sequence
        const delta = (lastAlong - curAlong) * 1.5
        lastAlong = curAlong

        targetOffset += delta * 0.08
        // Instant velocity tracking
        dragVelocity = (delta / dt) * 16
      }
    }

    const onPointerUp = (e) => {
      if (!isDragging) return
      isDragging = false

      try {
        canvas.releasePointerCapture(e.pointerId)
      } catch (_) {}

      const now = performance.now()
      if (now - lastMoveTime < 130 && Math.abs(dragVelocity) > 0.3) {
        // FLING momentum on release with smooth anticipation glide
        momentumVelocity += dragVelocity * 0.16
      }
      dragVelocity = 0
    }

    // Normalized wheel scroll with elastic momentum impulse & progressive damping
    const onWheel = (e) => {
      e.preventDefault()
      let dy = e.deltaY
      if (e.deltaMode === 1) dy *= 28
      else if (e.deltaMode === 2) dy *= 450

      // Damped progressive impulse with smooth momentum accumulation
      const speed = Math.min(Math.abs(dy), 160) * 0.026
      const impulse = Math.sign(dy) * speed

      momentumVelocity += impulse * 0.88
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })

    // Window Resize Handler
    const handleResize = () => {
      if (!canvas) return
      width = canvas.clientWidth || window.innerWidth
      height = canvas.clientHeight || window.innerHeight

      const newCameraZ = height / (2 * Math.tan((fov * Math.PI) / 360))
      camera.aspect = width / height
      camera.position.z = newCameraZ
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Physics Loop & XPBD Cloth simulation
    let lastClock = performance.now()

    const tick = () => {
      const now = performance.now()
      const dt = Math.min((now - lastClock) / 1000, 0.033)
      lastClock = now

      // Apply luxurious exponential momentum friction with fluid deceleration
      if (Math.abs(momentumVelocity) > 0.001) {
        targetOffset += momentumVelocity
        momentumVelocity *= 0.925 // Long, buttery glide
      } else {
        momentumVelocity = 0
      }

      // Programmatic centering if project changed externally (e.g. from Index/Gallery click)
      if (targetProjectRef.current !== lastActiveProjectRef.current) {
        const targetCard = targetProjectRef.current
        const desiredOffset = 50 - targetCard * dxVw
        let diff = (desiredOffset - targetOffset) % totalDistVw
        if (diff > totalDistVw / 2) diff -= totalDistVw
        if (diff < -totalDistVw / 2) diff += totalDistVw
        targetOffset += diff
        lastActiveProjectRef.current = targetProjectRef.current
      }

      // Elastic Viscosity Easing (The "delay sa anticipation" after-effect):
      const easeFactor = isDragging ? 0.16 : 0.075
      const lag = targetOffset - currentOffset
      currentOffset += lag * easeFactor

      // Subtle dynamic inertia lean based on scroll lag (anticipation tilt)
      const anticipationInertia = THREE.MathUtils.clamp(lag * 0.12, -1.5, 1.5)

      // Synchronize with background typography
      if (motionProgressRef) {
        motionProgressRef.current = currentOffset / 0.08
      }

      // Track which project card is centered
      let minCenterDist = Infinity
      let candidateCard = 0
      for (let i = 0; i < N; i++) {
        const rawX = i * dxVw + currentOffset
        const xVw = wrapX(rawX)
        const dist = Math.abs(xVw - 50)
        if (dist < minCenterDist) {
          minCenterDist = dist
          candidateCard = i
        }
      }

      const activeProject = candidateCard
      if (minCenterDist < 11 && lastActiveProjectRef.current !== activeProject) {
        lastActiveProjectRef.current = activeProject
        if (onActiveProjectChange) {
          onActiveProjectChange(activeProject)
        }
      }

      // Dynamically sort sheets back-to-front by t so the layer stacking order is 100% strictly maintained
      const sortedIndices = [...Array(N).keys()].sort((a, b) => {
        const tA = (wrapX(a * dxVw + currentOffset) - minXVw) / totalDistVw
        const tB = (wrapX(b * dxVw + currentOffset) - minXVw) / totalDistVw
        return tA - tB
      })

      sortedIndices.forEach((sheetIdx, rank) => {
        const item = sheets[sheetIdx]
        if (item.shadowMesh) {
          item.shadowMesh.renderOrder = rank * 2
        }
        item.mesh.renderOrder = rank * 2 + 1
      })

      // Raycast to find which card the mouse cursor is hovering over
      raycaster.setFromCamera(mouseNdc, camera)
      const intersects = raycaster.intersectObjects(sheetMeshes)

      // Only the frontmost (highest renderOrder) intersected card receives the mouse wind brush
      let topMesh = null
      let topHit = null
      if (intersects.length > 0) {
        intersects.sort((a, b) => b.object.renderOrder - a.object.renderOrder)
        topMesh = intersects[0].object
        topHit = intersects[0]
      }

      for (let i = 0; i < N; i++) {
        const item = sheets[i]
        const rawX = i * dxVw + currentOffset
        const xVw = wrapX(rawX)
        const t = (xVw - minXVw) / totalDistVw

        // Balanced diagonal trajectory across center viewport
        // At t = 0 (bottom-left): yVh ≈ 74vh (comfortable lower-left)
        // At t = 0.5 (center): yVh ≈ 50vh (exact screen center)
        // At t = 1.0 (top-right): yVh ≈ 26vh (upper-right, clean clearance below header)
        const yVh = 74 - t * 48

        // Elegant size progression from gentle (bottom-left) to prominent (top-right)
        const scale = 0.84 + t * 0.28

        // Refined, prestige 3D perspective orientation:
        // 1. Pitch (rotX): Tasteful backward lean (12° to 15°) creating authentic depth without distortion
        const rotX = THREE.MathUtils.degToRad(12 + Math.sin(t * Math.PI) * 3)

        // 2. Yaw (rotY): Gentle inward arc (+6° on bottom-left to -6° on top-right)
        const dynamicRotY = THREE.MathUtils.degToRad(6 - t * 12) + THREE.MathUtils.degToRad(anticipationInertia * 0.25)

        // 3. Roll (rotZ): Subtle natural diagonal alignment (-5° to -9°)
        const dynamicRotZ = THREE.MathUtils.degToRad(-5 - t * 4) - THREE.MathUtils.degToRad(anticipationInertia * 0.25)

        // Layered z-depth
        const zDepth = -50 + t * 100

        // Convert vw / vh to Three.js pixel coordinates
        const pixelX = (xVw / 100) * width - width / 2
        const pixelY = height / 2 - (yVh / 100) * height

        // Update mesh transform with true 3D perspective orientation
        item.mesh.position.set(pixelX, pixelY, zDepth)
        item.mesh.rotation.set(rotX, dynamicRotY, dynamicRotZ)
        item.mesh.scale.set(scale, scale, scale)

        // Determine mouse wind brush for this sheet (only if it is the topmost card under cursor)
        let brush = null
        if (topMesh === item.mesh && topHit) {
          const local = item.mesh.worldToLocal(topHit.point.clone())
          const bx = local.x + item.w / 2
          const by = local.y + item.h / 2

          const bvx = item.lastBx !== undefined ? (bx - item.lastBx) / dt : 0
          const bvy = item.lastBy !== undefined ? (by - item.lastBy) / dt : 0
          item.lastBx = bx
          item.lastBy = by

          item.cloth.wake()
          brush = {
            x: bx,
            y: by,
            vx: bvx,
            vy: bvy,
            reach: 0.35 * item.w,
          }
        } else {
          item.lastBx = undefined
          item.lastBy = undefined
        }

        // Calculate card movement in local space for wind/cloth flutter
        const moveDeltaX = pixelX - item.lastX
        const moveDeltaY = pixelY - item.lastY
        const moveDeltaZ = zDepth - item.lastZ
        item.lastX = pixelX
        item.lastY = pixelY
        item.lastZ = zDepth

        // Check for wrap-around jump: reset cloth smoothly without exploding
        if (Math.abs(moveDeltaX) > width * 0.3) {
          item.cloth.place(-item.w / 2, -item.h / 2, 0)
        } else {
          // Transform world delta into card's local orientation
          const localDelta = new THREE.Vector3(moveDeltaX, moveDeltaY, moveDeltaZ).applyQuaternion(
            item.mesh.quaternion.clone().invert()
          )
          const feel = 0.65
          const sx = localDelta.x * feel
          const sy = localDelta.y * feel
          const sz = localDelta.z * feel

          item.cloth.step(
            dt,
            item.cloth.x + sx,
            item.cloth.y + sy,
            item.cloth.z + sz,
            now * 0.001,
            brush
          )
        }

        // Map simulated cloth particles directly to PlaneGeometry vertices
        // Subtract pin center (cloth.x + w/2, cloth.y + h/2, cloth.z)
        // so vertices remain centered symmetrically around (0,0) in local mesh space
        const posAttr = item.geometry.attributes.position
        const normAttr = item.geometry.attributes.normal
        const cPos = item.cloth.pos
        const cNorm = item.cloth.normal

        const pinX = item.cloth.x + item.w / 2
        const pinY = item.cloth.y + item.h / 2
        const pinZ = item.cloth.z

        for (let threeRow = 0; threeRow < NY; threeRow++) {
          for (let col = 0; col < NX; col++) {
            const threeIdx = threeRow * NX + col
            const clothIdx = (NY - 1 - threeRow) * NX + col

            posAttr.setXYZ(
              threeIdx,
              cPos[clothIdx * 3] - pinX,
              cPos[clothIdx * 3 + 1] - pinY,
              cPos[clothIdx * 3 + 2] - pinZ
            )

            normAttr.setXYZ(
              threeIdx,
              cNorm[clothIdx * 3],
              cNorm[clothIdx * 3 + 1],
              cNorm[clothIdx * 3 + 2]
            )
          }
        }

        posAttr.needsUpdate = true
        normAttr.needsUpdate = true
      }

      renderer.render(scene, camera)
    }

    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }
  }, [motionProgressRef])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full select-none z-20 cursor-grab active:cursor-grabbing pointer-events-auto touch-none"
    />
  )
}

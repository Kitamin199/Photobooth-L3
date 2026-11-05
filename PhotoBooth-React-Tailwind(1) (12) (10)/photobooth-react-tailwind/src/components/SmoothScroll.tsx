"use client"

import { useEffect } from "react"

// Keep a weighted glide while responding quickly to each wheel gesture.
const DOWN_DAMPING = 230
const UP_DAMPING = 190
const WHEEL_MULTIPLIER = 0.82

export default function SmoothScroll() {
  useEffect(() => {
    const root = document.documentElement
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0
    let target = window.scrollY
    let position = target
    let lastTime = 0
    let lastWritten = window.scrollY
    let direction = 0

    const maximum = () => Math.max(0, root.scrollHeight - window.innerHeight)
    const clamp = (value: number) => Math.max(0, Math.min(maximum(), value))

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      direction = 0
      target = window.scrollY
      position = target
      root.classList.remove("is-wheel-scrolling")
    }

    const tick = (now: number) => {
      // Keyboard, anchor links, scrollbar dragging, or external scrolling wins.
      if (Math.abs(window.scrollY - lastWritten) > 2) {
        stop()
        return
      }
      const elapsed = Math.min(now - lastTime, 64)
      lastTime = now
      target = clamp(target)
      const damping = direction > 0 ? DOWN_DAMPING : UP_DAMPING
      // Keep subpixel progress internally even when the browser rounds scrollY.
      position = clamp(position + (target - position) * (1 - Math.exp(-elapsed / damping)))
      window.scrollTo({ top: position, behavior: "instant" })
      lastWritten = window.scrollY
      if (Math.abs(target - position) < 0.5) {
        window.scrollTo({ top: target, behavior: "instant" })
        stop()
        return
      }
      frame = requestAnimationFrame(tick)
    }

    const wheel = (event: WheelEvent) => {
      if (event.defaultPrevented || !event.cancelable || reducedMotion.matches ||
          event.ctrlKey || event.metaKey || event.shiftKey ||
          Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.deltaY === 0) return

      // Keep dialogs, form fields and nested scrolling regions native.
      if (getComputedStyle(document.body).overflowY === "hidden" ||
          getComputedStyle(root).overflowY === "hidden") {
        stop()
        return
      }
      for (const node of event.composedPath()) {
        if (!(node instanceof HTMLElement) || node === document.body || node === root) continue
        if (node.matches("input, textarea, select, [contenteditable=true], [data-native-scroll], [role=dialog]")) {
          stop()
          return
        }
        if (/(auto|scroll|overlay)/.test(getComputedStyle(node).overflowY) &&
            node.scrollHeight > node.clientHeight) {
          stop()
          return
        }
      }

      const nextDirection = Math.sign(event.deltaY)
      if (!frame || direction !== nextDirection) {
        target = window.scrollY
        position = target
      }
      direction = nextDirection
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1
      // Bound the queued distance so repeated wheel input never leaves a long tail.
      const delta = Math.max(-window.innerHeight, Math.min(window.innerHeight, event.deltaY * unit))
      const queueLimit = window.innerHeight * 0.8
      target = clamp(Math.max(window.scrollY - queueLimit,
        Math.min(window.scrollY + queueLimit, target + delta * WHEEL_MULTIPLIER)))
      event.preventDefault()
      if (!frame) {
        root.classList.add("is-wheel-scrolling")
        lastTime = performance.now()
        lastWritten = window.scrollY
        frame = requestAnimationFrame(tick)
      }
    }

    const keydown = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Escape", "Tab"].includes(event.key)) stop()
    }
    window.addEventListener("wheel", wheel, { passive: false })
    window.addEventListener("keydown", keydown)
    window.addEventListener("pointerdown", stop, { passive: true })
    window.addEventListener("touchstart", stop, { passive: true })
    window.addEventListener("resize", stop)
    window.addEventListener("hashchange", stop)
    document.addEventListener("click", stop, true)
    document.addEventListener("visibilitychange", stop)
    reducedMotion.addEventListener?.("change", stop)
    return () => {
      stop()
      window.removeEventListener("wheel", wheel)
      window.removeEventListener("keydown", keydown)
      window.removeEventListener("pointerdown", stop)
      window.removeEventListener("touchstart", stop)
      window.removeEventListener("resize", stop)
      window.removeEventListener("hashchange", stop)
      document.removeEventListener("click", stop, true)
      document.removeEventListener("visibilitychange", stop)
      reducedMotion.removeEventListener?.("change", stop)
    }
  }, [])

  return null
}

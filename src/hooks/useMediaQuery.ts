import { useState, useEffect } from "react"

/**
 * 监听媒体查询变化的 Hook
 * @param query 媒体查询字符串，如 "(max-width: 768px)"
 * @returns 当前是否匹配该媒体查询
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}

/**
 * 检测是否为移动端布局
 * @returns 当前视口宽度是否小于 768px
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 768px)")
}

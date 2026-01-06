// src/components/ScrollToTop.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // ブラウザの自動復元をオフ（Safari対応）
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // ハッシュ(#id)付きリンクの場合はブラウザに任せる
    if (hash) return;

    // ページが変わるたびに最上部へ
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return null;
}

import { useCallback, useEffect, useRef, useState } from "react";

/** 公开的二次元横图随机源。查询参数只用来避开缓存，每次都拿一张新图。 */
const SOURCES = [
  "https://t.alcy.cc/pc",
  "https://t.alcy.cc/ycy",
  "https://t.alcy.cc/moez",
  "https://www.dmoe.cc/random.php",
];

const REFRESH_MS = 40_000;

function pickUrl(avoid?: string): string {
  const pool = SOURCES.filter((src) => !avoid?.startsWith(src));
  const choices = pool.length > 0 ? pool : SOURCES;
  const base = choices[Math.floor(Math.random() * choices.length)]!;
  return `${base}?_=${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function preload(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.referrerPolicy = "no-referrer";
    const timer = window.setTimeout(() => {
      img.src = "";
      reject(new Error("timeout"));
    }, 8000);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve();
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("error"));
    };
    img.src = url;
  });
}

/**
 * 舞台背后的二次元壁纸。先预载再交叉淡入，失败自动换源。
 * 曲目切换和定时都会换一张，右上角也可以手动换。
 */
export function AnimeWallpaper({
  trackId,
  onReady,
}: {
  trackId: string;
  onReady?: (ready: boolean) => void;
}) {
  const [current, setCurrent] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const currentRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    setBusy(true);
    let lastTried = "";
    for (let attempt = 0; attempt < SOURCES.length; attempt++) {
      const url = pickUrl(lastTried);
      lastTried = url;
      try {
        await preload(url);
        setPrevious(currentRef.current);
        currentRef.current = url;
        setRevealed(false);
        setCurrent(url);
        onReadyRef.current?.(true);
        window.setTimeout(() => setPrevious(null), 900);
        setBusy(false);
        return;
      } catch {
        // 这个源失败就换下一个
      }
    }
    setBusy(false);
  }, []);

  useEffect(() => {
    if (!current) return;
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, [current]);

  useEffect(() => {
    void refresh();
  }, [trackId, refresh]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refresh();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return (
    <>
      {previous && (
        <img
          src={previous}
          alt=""
          referrerPolicy="no-referrer"
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
      )}
      {current && (
        <img
          src={current}
          alt=""
          referrerPolicy="no-referrer"
          className={`pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-700 ${
            revealed ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/60" />
      <button
        type="button"
        onClick={() => void refresh()}
        disabled={busy}
        aria-label="换一张二次元壁纸"
        className="absolute right-3 top-3 z-30 rounded-full border border-white/30 bg-black/35 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/55 disabled:opacity-60"
      >
        {busy ? "加载中…" : "换一张壁纸"}
      </button>
    </>
  );
}

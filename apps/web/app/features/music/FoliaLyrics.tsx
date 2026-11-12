import { useEffect, useRef, useState } from "react";
import type { LyricLine } from "./types";
import { useMusic } from "./music-context";

function lineProgress(lyrics: LyricLine[], index: number, time: number): number {
  const line = lyrics[index];
  if (!line) return 0;
  const next = lyrics[index + 1];
  const span = next ? next.time - line.time : 4;
  if (span <= 0.05) return 1;
  return Math.max(0, Math.min(1, (time - line.time) / span));
}

function LyricText({ text, progress, active }: { text: string; progress: number; active: boolean }) {
  const cut = `${Math.round(progress * 1000) / 10}%`;
  return (
    <span
      className="block truncate bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]"
      style={{
        backgroundImage: active
          ? `linear-gradient(90deg, #ffffff 0%, #ffd6ee ${cut}, rgba(255,255,255,0.78) ${cut}, rgba(255,255,255,0.78) 100%)`
          : "linear-gradient(90deg, rgba(255,255,255,0.82), rgba(255,255,255,0.82))",
      }}
    >
      {text}
    </span>
  );
}

/**
 * Folia 式动态歌词：当前句居中放大，按句内时间从左向右填色，
 * 上下句变淡，点击任意一行跳转。
 */
export function FoliaLyrics({ prominent }: { prominent: boolean }) {
  const { lyrics, activeLyricIndex, currentTime, isPlaying, seek, currentTrack } = useMusic();
  const sampleRef = useRef({ time: currentTime, at: 0 });
  const [now, setNow] = useState(currentTime);

  useEffect(() => {
    sampleRef.current = { time: currentTime, at: performance.now() };
    setNow(currentTime);
  }, [currentTime]);

  useEffect(() => {
    if (!isPlaying) return;
    let frame = 0;
    const tick = () => {
      const elapsed = Math.min(0.6, (performance.now() - sampleRef.current.at) / 1000);
      setNow(sampleRef.current.time + elapsed);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  if (lyrics.length === 0) {
    return (
      <div
        className={`pointer-events-none absolute inset-x-0 z-10 px-6 text-center text-white ${
          prominent ? "top-1/2 -translate-y-1/2" : "bottom-0 bg-gradient-to-t from-black/70 to-transparent pb-4 pt-8"
        }`}
      >
        <div className="truncate text-[20px] font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          {currentTrack.name}
        </div>
        <div className="mt-1 text-[13px] text-[#ffd0ea] drop-shadow">♪ 纯音乐 / 暂无同步歌词 ♪</div>
      </div>
    );
  }

  const focus = activeLyricIndex >= 0 ? activeLyricIndex : 0;
  const offsets = prominent ? [-2, -1, 0, 1, 2] : [0, 1];
  const row = prominent ? 64 : 30;

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-10 ${
        prominent ? "inset-y-0" : "bottom-0 bg-gradient-to-t from-black/75 via-black/45 to-transparent pt-8"
      }`}
    >
      <div className={`relative mx-auto w-full max-w-3xl ${prominent ? "h-full" : "h-[4.2rem]"}`}>
        {offsets.map((offset) => {
          const lineIdx = focus + offset;
          const line = lyrics[lineIdx];
          if (!line) return null;
          const active = offset === 0 && activeLyricIndex >= 0;
          const distance = Math.abs(offset);
          return (
            <button
              key={`${lineIdx}-${line.time}`}
              type="button"
              onClick={() => seek(line.time)}
              className="pointer-events-auto absolute left-1/2 w-[92%] text-center transition-[top,opacity] duration-500 ease-out"
              style={{
                top: prominent ? `calc(46% + ${offset * row}px)` : `${4 + offset * row}px`,
                transform: prominent ? "translate(-50%, -50%)" : "translateX(-50%)",
                opacity: active ? 1 : Math.max(0.3, 0.7 - distance * 0.2),
                filter: distance >= 2 ? "blur(0.5px)" : undefined,
              }}
            >
              <span
                className={
                  active
                    ? prominent
                      ? "text-[22px] font-bold sm:text-[26px]"
                      : "text-[16px] font-bold sm:text-[18px]"
                    : prominent
                      ? "text-[14px] font-medium"
                      : "text-[12.5px] font-medium"
                }
              >
                <LyricText
                  text={line.text}
                  progress={active ? lineProgress(lyrics, lineIdx, now) : 0}
                  active={active}
                />
              </span>
              {active && line.translation && prominent && (
                <span className="mt-0.5 block truncate text-[12px] font-normal text-[#d7e8ff] drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)]">
                  {line.translation}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

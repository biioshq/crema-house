'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotionOK } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

type BackgroundVideoProps = {
  src: string;
  className?: string;
  /** Load immediately instead of waiting for the element to approach the viewport. */
  eager?: boolean;
  /** Slowing footage down is most of what makes it feel cinematic. */
  playbackRate?: number;
  onReady?: () => void;
};

/**
 * A looping, muted, decorative video.
 *
 * Two things matter here for performance: the source is only attached once
 * the element is close to the viewport, and playback is suspended the moment
 * it leaves — an off-screen video decoding at 30fps is pure battery drain.
 */
export function BackgroundVideo({
  src,
  className,
  eager = false,
  playbackRate = 1,
  onReady,
}: BackgroundVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);
  const motionOK = useMotionOK();

  useEffect(() => {
    const video = ref.current;
    if (!video || eager) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [eager]);

  // Pause while off-screen — and never start at all when the visitor has
  // asked for reduced motion. The first frame still decodes and paints, so
  // the composition holds; it simply stops moving.
  useEffect(() => {
    const video = ref.current;
    if (!video || !shouldLoad) return;

    if (!motionOK) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [shouldLoad, motionOK]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate, shouldLoad]);

  return (
    <video
      ref={ref}
      src={shouldLoad ? src : undefined}
      className={cn('size-full object-cover', className)}
      autoPlay={motionOK}
      muted
      loop
      playsInline
      preload={eager || !motionOK ? 'auto' : 'none'}
      // Decorative: never announce it, never offer it to remote playback.
      aria-hidden
      tabIndex={-1}
      disableRemotePlayback
      onCanPlay={onReady}
    />
  );
}

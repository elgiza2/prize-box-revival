import { useEffect, useRef } from "react";

/** Global fullscreen video background shared by every page (dark hero style). */
const StarryBackground = () => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    // Telegram's WebView can report HLS support without actually decoding the
    // stream. Use the bundled MP4 directly and keep its poster visible until play.
    v.setAttribute("webkit-playsinline", "true");
    const play = () => void v.play().catch(() => undefined);
    play();
    document.addEventListener("touchstart", play, { once: true });
    document.addEventListener("click", play, { once: true });
    const onVisibility = () => (document.hidden ? v.pause() : play());
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("touchstart", play);
      document.removeEventListener("click", play);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="liquid-bg" aria-hidden="true">
      <video
        ref={ref}
        autoPlay
        loop
        muted
        playsInline
        poster="/images/bg-poster.jpg"
        preload="auto"
        disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/bg-loop.mp4" type="video/mp4" />
        <source src="/bg-loop.webm" type="video/webm" />
      </video>
      <div className="absolute inset-0 bg-background/20" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent" />
    </div>
  );
};

export default StarryBackground;

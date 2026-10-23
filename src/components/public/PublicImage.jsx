import React, { useState, useEffect } from "react";
export function optimizedImage(src, width = 960) {
  return typeof src === "string" &&
    /^\/api\/local\/files\/[a-f0-9-]+$/i.test(src)
    ? `${src}?w=${width}`
    : src;
}
/** @param {import('react').ImgHTMLAttributes<HTMLImageElement>} props */
export default function PublicImage({
  src,
  alt = "",
  loading = "lazy",
  fetchPriority,
  sizes = "(max-width: 640px) 100vw, 50vw",
  ...props
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const local = optimizedImage(src) !== src;
  return (
    <img
      {...props}
      alt={alt}
      src={failed ? src : optimizedImage(src)}
      srcSet={
        !failed && local
          ? [320, 640, 960, 1440, 1920]
              .map((w) => `${optimizedImage(src, w)} ${w}w`)
              .join(", ")
          : undefined
      }
      sizes={sizes}
      loading={fetchPriority === "high" || loading === "eager" ? "eager" : "lazy"}
      decoding="async"
      {...{ fetchpriority: fetchPriority }}
      onError={(e) => {
        if (!failed && local) setFailed(true);
        else props.onError?.(e);
      }}
    />
  );
}

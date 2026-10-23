import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
export default function ViewportOverlay({
  children,
  className = "",
  onClick,
  ...props
}) {
  const root = useRef(null),
    close = useRef(onClick);
  close.current = onClick;
  useEffect(() => {
    const prior = document.activeElement,
      bodyOverflow = document.body.style.overflow,
      app = document.querySelector(".serviteur-app"),
      inert = app instanceof HTMLElement ? app.inert : false;
    document.body.style.overflow = "hidden";
    if (app instanceof HTMLElement) app.inert = true;
    const focusable = () =>
      [
        ...(root.current?.querySelectorAll(
          'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex="0"]',
        ) || []),
      ].filter((e) => e.getClientRects().length);
    focusable()[0]?.focus();
    const key = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current?.(e);
      }
      if (e.key === "Tab") {
        const all = focusable();
        const first = all[0],
          last = all[all.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = bodyOverflow;
      if (app instanceof HTMLElement) app.inert = inert;
      document.removeEventListener("keydown", key);
      if (prior instanceof HTMLElement && prior.isConnected) prior.focus();
    };
  }, []);
  return createPortal(
    <div
      ref={root}
      className={"app-viewport-overlay " + className}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>,
    document.body,
  );
}

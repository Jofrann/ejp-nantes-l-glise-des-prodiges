import { useLocation } from "react-router-dom";
import React, { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/permissions";
import {
  copyIds,
  copyDefaults,
  normalizeCopy,
  expandPublicCopy,
  isPublicPreview,
  publicConfigOnly,
} from "@/lib/publicCopy";
const CopyContext = createContext({});
export function PublicCopyProvider({ children }) {
  const { pathname } = useLocation();
  const [config, setConfig] = useState({});
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (window.location.pathname.startsWith("/app")) return;
    let alive = true;
    base44.entities.ChurchConfig.list()
      .then((rows) => {
        if (alive && !window.__ejpPublicDraft) setConfig(rows?.[0] || {});
      })
      .catch(() => {});
    if (!isPublicPreview())
      return () => {
        alive = false;
      };
    const channel = new URLSearchParams(window.location.search).get(
      "ejp_preview",
    );
    let authorized = false;
    let lastDraft = null;
    const receive = (event) => {
      if (
        !authorized ||
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== "ejp-public-draft" ||
        event.data.channel !== channel
      )
        return;
      const draft = publicConfigOnly(event.data.config || {});
      const signature = JSON.stringify(draft);
      if (signature === lastDraft) return;
      lastDraft = signature;
      window.__ejpPublicDraft = draft;
      setConfig(draft);
      setRevision((value) => value + 1);
    };
    window.addEventListener("message", receive);
    base44.auth
      .me()
      .then((user) => {
        if (
          alive &&
          isAdmin(user) &&
          !user.first_login &&
          user.account_status === "active"
        ) {
          authorized = true;
          window.parent.postMessage(
            { type: "ejp-preview-ready", channel },
            window.location.origin,
          );
        }
      })
      .catch(() => {});
    // Preview has no side effects and stays inside the chosen public page.
    const block = (event) => {
      const target = event.target.closest?.("a");
      if (target) event.preventDefault();
    };
    document.addEventListener("click", block, true);
    const escape = (event) => {
      if (event.key === "Escape")
        window.parent.postMessage(
          { type: "ejp-preview-close", channel },
          window.location.origin,
        );
    };
    document.addEventListener("keydown", escape);
    return () => {
      alive = false;
      window.removeEventListener("message", receive);
      document.removeEventListener("click", block, true);
      document.removeEventListener("keydown", escape);
      delete window.__ejpPublicDraft;
    };
  }, [pathname]);
  return (
    <CopyContext.Provider value={config}>
      <React.Fragment key={revision}>{children}</React.Fragment>
    </CopyContext.Provider>
  );
}
export function usePublicText() {
  const config = useContext(CopyContext);
  return (value) => {
    if (typeof value !== "string") return value;
    const id = copyIds.get(normalizeCopy(value));
    const edited =
      id && Object.hasOwn(config.public_copy || {}, id)
        ? config.public_copy[id]
        : (copyDefaults.get(id) ?? value);
    const result = expandPublicCopy(edited, config);
    const before =
      id && /^\s/.test(value) && !/^\s/.test(result)
        ? value.match(/^\s+/)[0]
        : "";
    const after =
      id && /\s$/.test(value) && !/\s$/.test(result)
        ? value.match(/\s+$/)[0]
        : "";
    return before + result + after;
  };
}
export function PublicText({ value }) {
  const text = usePublicText();
  return <>{text(value)}</>;
}

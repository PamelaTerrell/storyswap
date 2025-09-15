import { useEffect, useRef, useState } from "react";

export default function ExpandableText({ text, lines = 8 }) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const pRef = useRef(null);

  // Detect if the text actually overflows when clamped
  useEffect(() => {
    const el = pRef.current;
    if (!el) return;

    const check = () => {
      // When collapsed, the CSS clamp is applied, so we can detect overflow
      setOverflowing(el.scrollHeight > el.clientHeight + 1);
    };

    check();
    // Re-check on resize & when text changes
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [text, lines, expanded]);

  return (
    <div className="expandable">
      <p
        ref={pRef}
        className={`story-text ${!expanded ? "clamped" : ""}`}
        style={{
          WebkitLineClamp: !expanded ? lines : "unset",
        }}
      >
        {text}
      </p>

      {/* subtle fade when collapsed and overflowing */}
      {!expanded && overflowing && <div className="fadeout" aria-hidden="true" />}

      {overflowing && (
        <button
          type="button"
          className="expand-btn"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

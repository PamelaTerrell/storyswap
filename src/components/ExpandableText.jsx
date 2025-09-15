import { useEffect, useRef, useState } from "react";

export default function ExpandableText({ text, lines = 8, forceExpanded = undefined, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const pRef = useRef(null);
  const expandedRef = useRef(false); // to fire analytics only once if you want

  // If parent forces a state (expand all / collapse all), sync it
  useEffect(() => {
    if (typeof forceExpanded === "boolean") {
      setExpanded(forceExpanded);
    }
  }, [forceExpanded]);

  // Detect if text overflows when clamped
  useEffect(() => {
    const el = pRef.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [text, lines, expanded]);

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    onToggle?.(next);
    if (next && !expandedRef.current) {
      // example GA event (first time expand)
      window.gtag?.('event', 'read_more', { category: 'engagement' });
      expandedRef.current = true;
    }
  }

  return (
    <div className="expandable">
      <p
        ref={pRef}
        className={`story-text ${!expanded ? "clamped" : ""}`}
        style={{ WebkitLineClamp: !expanded ? lines : "unset" }}
      >
        {text}
      </p>

      {!expanded && overflowing && <div className="fadeout" aria-hidden="true" />}

      {overflowing && (
        <button
          type="button"
          className="expand-btn"
          onClick={toggle}
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

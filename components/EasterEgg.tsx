"use client";

import { useEffect, useState } from "react";

const SEQ = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function EasterEgg() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let i = 0;
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const expected = SEQ[i];
      if (key === expected) {
        i += 1;
        if (i === SEQ.length) {
          document.documentElement.dataset.egg = "fair";
          setShow(true);
          window.setTimeout(() => setShow(false), 3200);
          i = 0;
        }
      } else {
        i = key === SEQ[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={`egg-note${show ? " show" : ""}`} role="status">
      Fair winds — you found the dry dock.
    </div>
  );
}

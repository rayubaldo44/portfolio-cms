"use client";

import { useEffect, useRef, useState } from "react";

const WORDS = [
  "product-minded web engineer",
  "full-stack engineer building with ai",
  "applied ai developer shipping tools",
] as const;
const TYPING_SPEED = 80;
const DELETING_SPEED = 50;
const PAUSE_AFTER_TYPE = 1500;
const PAUSE_AFTER_DELETE = 500;

export function TypeWriter() {
  const [displayText, setDisplayText] = useState<string>(WORDS[0]);
  const stateRef = useRef({
    wordIndex: 0,
    isDeleting: false,
    charIndex: WORDS[0].length,
    timerId: undefined as ReturnType<typeof setTimeout> | undefined,
  });

  useEffect(() => {
    function tick() {
      const state = stateRef.current;
      const currentWord = WORDS[state.wordIndex];

      if (state.isDeleting) {
        state.charIndex--;
        if (state.charIndex <= 0) {
          state.charIndex = 0;
          state.isDeleting = false;
          state.wordIndex = (state.wordIndex + 1) % WORDS.length;
          setDisplayText("");
          state.timerId = setTimeout(tick, PAUSE_AFTER_DELETE);
          return;
        }
        setDisplayText(currentWord.slice(0, state.charIndex));
        state.timerId = setTimeout(tick, DELETING_SPEED);
      } else {
        state.charIndex++;
        setDisplayText(currentWord.slice(0, state.charIndex));
        if (state.charIndex >= currentWord.length) {
          state.isDeleting = true;
          state.timerId = setTimeout(tick, PAUSE_AFTER_TYPE);
          return;
        }
        state.timerId = setTimeout(tick, TYPING_SPEED);
      }
    }

    stateRef.current.timerId = setTimeout(tick, PAUSE_AFTER_TYPE);
    const timerId = stateRef.current.timerId;
    return () => clearTimeout(timerId);
  }, []);

  return (
    <span>
      {displayText}
      <span
        aria-hidden="true"
        className="ml-1 inline-block w-[3px] animate-pulse rounded-full bg-current align-baseline"
        style={{ height: "1em" }}
      />
    </span>
  );
}

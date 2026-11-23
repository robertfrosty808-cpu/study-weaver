import { cn } from "@/lib/utils";
import { createElement, useEffect, useRef } from "react";

type Tag = "div" | "span" | "p" | "h1" | "h2" | "h3" | "h4" | "summary" | "dt" | "dd";

interface EditableTextProps {
  value?: string;
  onCommit?: (value: string) => void;
  editable?: boolean;
  className?: string;
  placeholder?: string;
  as?: Tag;
  /** Prevent Enter from creating a new line (used for headings). */
  singleLine?: boolean;
  ariaLabel?: string;
}

/**
 * A content-editable text node that only reports its value on blur. Keeping the
 * DOM in charge while the user types avoids caret jumps; React re-syncs when
 * the value changes externally (undo, AI regeneration, theme changes).
 */
export function EditableText({
  value = "",
  onCommit,
  editable = false,
  className,
  placeholder = "Write something…",
  as = "div",
  singleLine = false,
  ariaLabel,
}: EditableTextProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement !== el && el.innerText !== value) {
      el.innerText = value;
    }
  }, [value]);

  return createElement(
    as,
    {
      ref,
      contentEditable: editable,
      suppressContentEditableWarning: true,
      spellCheck: editable,
      "data-placeholder": placeholder,
      "aria-label": ariaLabel,
      role: editable ? "textbox" : undefined,
      tabIndex: editable ? 0 : undefined,
      className: cn(
        editable
          ? "editable cursor-text"
          : "min-w-0 outline-none",
        "break-words [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:opacity-40 [&:empty]:before:pointer-events-none",
        className,
      ),
      onBlur: (event: React.FocusEvent<HTMLElement>) => {
        if (!editable) return;
        const next = event.currentTarget.innerText.replace(/\u00a0/g, " ").trimEnd();
        if (next !== value) onCommit?.(next);
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
        if (!editable) return;
        if (singleLine && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      },
      onPaste: (event: React.ClipboardEvent<HTMLElement>) => {
        if (!editable) return;
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      },
    },
    value,
  );
}

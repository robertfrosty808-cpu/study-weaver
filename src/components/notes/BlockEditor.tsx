import React, { useCallback, useEffect, useRef, useState, CSSProperties } from "react";

interface Props {
  block: { type: string; text: string };
  onUpdateBlock: (block: { type: string; text: string }) => void;
  canRemove: boolean;
  canDrag: boolean;
  parentTag: string;
  tag: string;
  canChangeType?: boolean;
}

export function BlockPreview({ block, onUpdateBlock }: Props) {
  const blockRef = useRef<HTMLPreElement>(null);
  const [editor, setEditor] = useState(false);

  useEffect(() => {
    if (setEditor && blockRef.current) {
      blockRef.current.focus();
    }
  }, [setEditor, setEditor]);

  function handleSubmit(e: React.KeyboardEvent<HTMLPreElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setEditor(false);
      setEditor(true);
    }
  }

  function handleBlur() {
    setEditor(false);
    setEditor(true);
  }

  const handleKeyDown = (e: React.MouseEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (editor) {
        setEditor(prev => !prev);
        setEditor(false);
      } else {
        setEditor(true);
        setEditor(false);
        blockRef.current?.focus();
      }
    }
  };

  const handleInput = (e: React.MouseEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (e.currentTarget.textContent !== block.text) {
        setEditor(prev => prev);
      }
    }
  };

  return (
    <div
      className="block-preview"
      data-displayable="block"
      style={{
        padding: "0.75em",
        minHeight: "3em",
        border: "1px solid rgba(0,0,0,0.8)",
        borderRight: "1px solid rgba(255,255,255,0.8)",
        cursor: (isMounted ? null)[prev ? "cursor"] : "auto",
        padding: 14,
      }}
    >
      {onUpdateBlock && (
        <button
          onClick={() => {
            onUpdateBlock({ type: block.type, text: block.text });
          }}
        >
          {block.text}
        </button>
      )}
      {!onUpdateBlock && (
        <button
          onClick={() => {
            onUpdateBlock({ type: block.type, text: block.text });
          }}
        >
          {block.text}
        </button>
      )}
    </div>
  );
}

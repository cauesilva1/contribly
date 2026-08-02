"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  filterSkillSuggestions,
  parseCsvSkills,
} from "@/lib/skill-suggestions";

type SkillAutocompleteProps = {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  suggestions: readonly string[];
  hint?: string;
  onDirty?: () => void;
};

export function SkillAutocomplete({
  id,
  name,
  label,
  required = false,
  defaultValue = "",
  placeholder,
  suggestions,
  hint,
  onDirty,
}: SkillAutocompleteProps) {
  const t = useTranslations("skillAutocomplete");
  const effectivePlaceholder = placeholder ?? t("defaultPlaceholder");
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState(() => parseCsvSkills(defaultValue));
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const matches = useMemo(
    () => filterSkillSuggestions(query, suggestions, values),
    [query, suggestions, values]
  );

  const canAddCustom =
    query.trim().length > 0 &&
    !values.some((item) => item.toLowerCase() === query.trim().toLowerCase()) &&
    !matches.some((item) => item.toLowerCase() === query.trim().toLowerCase());

  const options = canAddCustom
    ? [...matches, t("addOption", { query: query.trim() })]
    : matches;

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function markDirty() {
    onDirty?.();
  }

  function addValue(raw: string) {
    const next = raw.trim();
    if (!next) return;
    if (values.some((item) => item.toLowerCase() === next.toLowerCase())) {
      setQuery("");
      setOpen(false);
      return;
    }
    setValues((prev) => [...prev, next]);
    setQuery("");
    setActiveIndex(0);
    setOpen(false);
    markDirty();
    inputRef.current?.focus();
  }

  function removeValue(value: string) {
    setValues((prev) => prev.filter((item) => item !== value));
    markDirty();
    inputRef.current?.focus();
  }

  function chooseOption(index: number) {
    const option = options[index];
    if (!option) return;
    if (canAddCustom && index === options.length - 1) {
      addValue(query);
      return;
    }
    addValue(option);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !query && values.length > 0) {
      removeValue(values[values.length - 1]);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        options.length === 0 ? 0 : (index + 1) % options.length
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        options.length === 0
          ? 0
          : (index - 1 + options.length) % options.length
      );
      return;
    }

    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (open && options[activeIndex]) {
        chooseOption(activeIndex);
      } else if (query.trim()) {
        addValue(query);
      }
    }
  }

  return (
    <div className="field" ref={rootRef}>
      <label htmlFor={id}>{label}</label>
      <input type="hidden" name={name} value={values.join(", ")} />
      {required ? (
        <input
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          required={values.length === 0}
          value={values.length > 0 ? "ok" : ""}
          onChange={() => undefined}
        />
      ) : null}

      <div
        className="skill-autocomplete"
        onClick={() => inputRef.current?.focus()}
      >
        {values.map((value) => (
          <button
            key={value}
            type="button"
            className="skill-chip"
            onClick={(event) => {
              event.stopPropagation();
              removeValue(value);
            }}
          >
            {value}
            <X className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">{t("removeLabel", { value })}</span>
          </button>
        ))}
        <input
          ref={inputRef}
          id={id}
          value={query}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder={
            values.length === 0 ? effectivePlaceholder : t("addingPlaceholder")
          }
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(0);
            markDirty();
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      {open && options.length > 0 ? (
        <ul id={listId} role="listbox" className="skill-suggestions">
          {options.map((option, index) => {
            return (
              <li key={`${option}-${index}`} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  className={
                    index === activeIndex
                      ? "skill-suggestion skill-suggestion-active"
                      : "skill-suggestion"
                  }
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => chooseOption(index)}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {hint ? <p className="mt-1 text-xs text-[#57606a]">{hint}</p> : null}
    </div>
  );
}

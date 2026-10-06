/**
 * Regex match engine — shared with Portfolio/lib/regex-visualizer.ts
 */

export type RegexMatch = {
  index: number;
  text: string;
  groups: string[];
  namedGroups: Record<string, string>;
};

export type TextSegment = {
  text: string;
  match: boolean;
  matchIndex: number | null;
};

export type RegexResult = {
  ok: true;
  pattern: string;
  flags: string;
  matches: RegexMatch[];
  segments: TextSegment[];
};

export type RegexErrorResult = {
  ok: false;
  error: string;
};

export type RegexRunResult = RegexResult | RegexErrorResult;

export type RegexPreset = {
  id: string;
  name: string;
  pattern: string;
  flags: string;
  input: string;
};

const ALLOWED_FLAGS = new Set(["g", "i", "m", "s", "u", "y", "d", "v"]);

export function normalizeFlags(flags: string): string {
  const seen = new Set<string>();
  for (const ch of flags) {
    if (!ALLOWED_FLAGS.has(ch)) continue;
    seen.add(ch);
  }
  // Always enumerate all matches for visualization
  seen.add("g");
  return [...seen].sort().join("");
}

export function runRegex(input: {
  pattern: string;
  flags?: string;
  text: string;
}): RegexRunResult {
  const pattern = input.pattern;
  const flags = normalizeFlags(input.flags ?? "g");
  const text = input.text;

  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid regular expression",
    };
  }

  const matches: RegexMatch[] = [];
  try {
    for (const m of text.matchAll(re)) {
      const index = m.index ?? 0;
      const groups = m.slice(1).map((g) => (g == null ? "" : String(g)));
      const namedGroups: Record<string, string> = {};
      if (m.groups) {
        for (const [k, v] of Object.entries(m.groups)) {
          namedGroups[k] = v == null ? "" : String(v);
        }
      }
      matches.push({
        index,
        text: m[0] ?? "",
        groups,
        namedGroups,
      });
      // Zero-length match safety: advance lastIndex manually if needed
      if (m[0] === "" && re.lastIndex === index) {
        re.lastIndex = index + 1;
      }
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Match failed",
    };
  }

  const segments = buildSegments(text, matches);
  return { ok: true, pattern, flags, matches, segments };
}

function buildSegments(text: string, matches: RegexMatch[]): TextSegment[] {
  if (matches.length === 0) {
    return text.length === 0
      ? []
      : [{ text, match: false, matchIndex: null }];
  }

  const segments: TextSegment[] = [];
  let cursor = 0;
  matches.forEach((m, i) => {
    if (m.index > cursor) {
      segments.push({
        text: text.slice(cursor, m.index),
        match: false,
        matchIndex: null,
      });
    }
    segments.push({
      text: m.text,
      match: true,
      matchIndex: i,
    });
    cursor = m.index + m.text.length;
  });
  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      match: false,
      matchIndex: null,
    });
  }
  return segments;
}

/** Shared presets (parity with Portfolio) */
export const REGEX_PRESETS: RegexPreset[] = [
  {
    id: "digits",
    name: "Digits",
    pattern: "\\d+",
    flags: "g",
    input: "Order #42 ships on 2026-10-05 with 3 items.",
  },
  {
    id: "email",
    name: "Email",
    pattern: "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}",
    flags: "g",
    input: "Contact ada@example.com or grace.hopper@navy.mil for help.",
  },
  {
    id: "quoted",
    name: "Quoted strings",
    pattern: "\"([^\"]*)\"|'([^']*)'",
    flags: "g",
    input: `She said "hello" and he replied 'world'.`,
  },
  {
    id: "urlish",
    name: "URL-ish",
    pattern: "https?://[^\\s]+",
    flags: "gi",
    input: "Docs: https://rjedwards.dev/projects and HTTP://example.com/path",
  },
];

export function getRegexPreset(id: string): RegexPreset {
  const p = REGEX_PRESETS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown preset: ${id}`);
  return p;
}

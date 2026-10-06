import type { RegexResult } from "./engine.js";

export function formatResult(result: RegexResult): string {
  const lines: string[] = [];
  lines.push(`Pattern: /${result.pattern}/${result.flags}`);
  lines.push(`Matches: ${result.matches.length}`);
  lines.push("");

  if (result.matches.length === 0) {
    lines.push("(no matches)");
  } else {
    result.matches.forEach((m, i) => {
      lines.push(`[${i}] index=${m.index} text=${JSON.stringify(m.text)}`);
      if (m.groups.length > 0) {
        lines.push(`    groups: ${m.groups.map((g) => JSON.stringify(g)).join(", ")}`);
      }
      const named = Object.entries(m.namedGroups);
      if (named.length > 0) {
        lines.push(
          `    named: ${named.map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(", ")}`,
        );
      }
    });
  }

  lines.push("");
  lines.push("Highlight:");
  lines.push(result.segments.map((s) => s.text).join(""));
  lines.push(
    result.segments
      .map((s) => (s.match ? "^".repeat(s.text.length) : " ".repeat(s.text.length)))
      .join(""),
  );
  return lines.join("\n");
}

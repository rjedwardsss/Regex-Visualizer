import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  getRegexPreset,
  REGEX_PRESETS,
  runRegex,
} from "./engine.js";
import { formatResult } from "./format.js";

function usage(): never {
  console.error(`Usage:
  npx tsx src/cli.ts --pattern <regex> [--flags gims] [--input <file> | --text <string>]
  npx tsx src/cli.ts --preset <${REGEX_PRESETS.map((p) => p.id).join("|")}>`);
  process.exit(1);
}

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const val = argv[i + 1];
    if (!val || val.startsWith("--")) {
      out[key] = "true";
    } else {
      out[key] = val;
      i += 1;
    }
  }
  return out;
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  let pattern: string;
  let flags: string;
  let text: string;

  if (args.preset) {
    const preset = getRegexPreset(args.preset);
    pattern = preset.pattern;
    flags = preset.flags;
    text = preset.input;
  } else if (args.pattern) {
    pattern = args.pattern;
    flags = args.flags ?? "g";
    if (args.input) {
      text = readFileSync(resolve(args.input), "utf8");
    } else if (args.text != null) {
      text = args.text;
    } else {
      usage();
    }
  } else {
    usage();
  }

  const result = runRegex({ pattern, flags, text });
  if (!result.ok) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }
  console.log(formatResult(result));
}

main();

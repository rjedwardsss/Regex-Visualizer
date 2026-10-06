# Regex Visualizer

A **TypeScript** CLI that runs a regular expression against sample text and reports **match indices**, **capture groups**, and a simple **highlight** under the input. No runtime dependencies beyond Node.

An interactive **browser demo** is available on the live portfolio site: [rjedwards.dev/projects/regex-visualizer](https://rjedwards.dev/projects/regex-visualizer).

## Features

- Compile pattern + flags (`g`, `i`, `m`, `s`, `u`, …) with clear errors
- Enumerate all matches (`matchAll`, `g` forced for listing)
- Numbered and named capture groups
- Non-match / match text segments for highlighting

## Requirements

- Node.js 18+

## Install & run

```bash
npm install
npx tsx src/cli.ts --preset email
npx tsx src/cli.ts --pattern "\\d+" --flags g --input fixtures/sample.txt
```

Presets: `digits`, `email`, `quoted`, `urlish` (same as the portfolio demo).

## Project layout

```
src/
  engine.ts   Match engine + presets
  format.ts   CLI formatting
  cli.ts      Entrypoint
fixtures/     Sample text
```

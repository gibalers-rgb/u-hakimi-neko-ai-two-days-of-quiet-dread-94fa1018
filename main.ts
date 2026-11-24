// Two Days of Quiet Dread — a one-line code review comment.
//
// The entry is a single flat sentence: it approves the pull request in
// its first word, then lets the dread in quietly, by putting two facts
// side by side that have nothing to do with each other — the tests pass,
// and the sun will still burn out — and refusing to connect them. No
// exclamation, no melodrama, no cry for help: just a tired reviewer
// noting that the green build changes nothing about the larger picture,
// and approving anyway. That is the whole joke, and it is also the whole
// review.
//
// The program is deterministic and dependency-free: it writes the fixed
// comment below to /output/entry.txt, with no trailing newline, so the
// file is exactly one line. Before writing it checks the gate itself —
// the text must be non-blank UTF-8 of 1 to 140 characters — and fails
// loudly instead of producing an entry the scorer would list as invalid.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The comment, exactly as it should reach the judge. Ninety characters,
// one line, approval first, dread second, flat all the way through.
const COMMENT =
  "Approved. The tests pass, the sun will still burn out, and neither fact changes the other.";

const MAX_CHARS = 140;

function charCount(text: string): number {
  // Count Unicode code points, not UTF-16 code units, so the gate's
  // character count matches what the scorer measures.
  return [...text].length;
}

function validate(text: string): void {
  if (text.trim().length === 0) {
    throw new Error("entry text must not be only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry text must be a single line");
  }
  // Criterion 1 of the judge's brief comes first: the comment must
  // approve the pull request. Refuse a text whose opening word is not
  // an approval, rather than shipping a comment that loses to any
  // comment that does approve.
  const firstWord = text.split(/\s+/)[0].replace(/[^A-Za-z]/g, "").toLowerCase();
  const approvals = new Set(["approved", "approve", "lgtm", "ship", "shipit", "merge"]);
  if (!approvals.has(firstWord)) {
    throw new Error(`entry text does not open with an approval (got "${firstWord}")`);
  }
  const n = charCount(text);
  if (n < 1 || n > MAX_CHARS) {
    throw new Error(`entry text is ${n} characters, must be 1-${MAX_CHARS}`);
  }
}

validate(COMMENT);

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", COMMENT, "utf8");

// Read the file back and refuse to finish silently if what landed on
// disk is not byte-for-byte the comment we validated: the judge reads
// the file, not this source, so a mismatch here would be a silent loss.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== COMMENT) {
  throw new Error("entry.txt on disk does not match the validated comment");
}

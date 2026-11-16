const MAX_CHARS = 12000;

const dropPatterns = [
  /\b(patient|name|age|sex|gender|dob|birth|mrn|reg|id|phone|mobile|tel|contact|address|email|referred|consultant|doctor|dr|collected|received|reported|printed)\b/i,
  /\S+@\S+\.\S+/,
  /(?:\+?88)?01\d{9}/,
  /\d{10,}/,
];

const redact = (text) =>
  String(text || '')
    .split('\n')
    .filter((line) => !dropPatterns.some((pattern) => pattern.test(line)))
    .join('\n')
    .slice(0, MAX_CHARS);

module.exports = { redact };
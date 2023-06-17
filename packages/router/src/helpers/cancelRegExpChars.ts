const SPECIAL_CHARS_REGEXP = /[.+*?^$()\[\]{}\|\\]/g;

const cancelSpecialRegExpChars = (source: string) => source.replace(SPECIAL_CHARS_REGEXP, '\\$&');

export { cancelSpecialRegExpChars };

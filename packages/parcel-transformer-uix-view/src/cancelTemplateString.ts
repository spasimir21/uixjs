function cancelTemplateString(string: string): string {
  return string.replace(/(\\|`|\$)/g, '\\$1');
}

export { cancelTemplateString };

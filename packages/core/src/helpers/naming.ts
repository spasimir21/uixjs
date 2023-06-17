function camelCaseToKebab(name: string) {
  return name
    .split(/(?=[A-Z])/)
    .map(part => part.toLowerCase())
    .join('-');
}

export { camelCaseToKebab };

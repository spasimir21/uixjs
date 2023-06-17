enum StylesheetType {
  Code,
  Link
}

interface StylesheetCodeSourceInfo {
  type: StylesheetType.Code;
  code: () => Promise<string>;
}

interface StylesheetLinkSourceInfo {
  type: StylesheetType.Link;
  link: string;
}

type StylesheetSourceInfo = StylesheetCodeSourceInfo | StylesheetLinkSourceInfo;

type StylesheetInfo = StylesheetSourceInfo & { id: string };

// This function exists to mirror the component api
function defineStylesheet(info: StylesheetInfo): StylesheetInfo {
  return info;
}

export { StylesheetType, StylesheetSourceInfo, StylesheetInfo, defineStylesheet };

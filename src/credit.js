export const CREDIT_CSS = `
[data-nitrostreams-credit="link"] {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
}
[data-nitrostreams-credit="link"]:hover {
  color: var(--text-normal, var(--text-default));
  text-decoration: underline;
}
[data-nitrostreams-credit="link"]:focus-visible { outline: 2px solid var(--brand-500); outline-offset: 3px; border-radius: 2px; }
`;

export function createCredit(doc, dividerTemplate = null) {
  const credit = doc.createDocumentFragment();
  const divider = dividerTemplate?.cloneNode(true) ?? doc.createElement("span");
  if (!dividerTemplate) {
    divider.textContent = "•";
    divider.style.marginInline = "8px";
  }
  divider.setAttribute("data-nitrostreams-credit", "divider");
  divider.setAttribute("aria-hidden", "true");
  const link = doc.createElement("a");
  link.setAttribute("data-nitrostreams-credit", "link");
  link.href = "https://github.com/D4n13l3k00/NitroStreams";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", "Made with love by D4n13l3k00. Open the NitroStreams repository.");
  link.textContent = "Made with ♥ by D4n13l3k00";
  credit.append(divider, link);
  return credit;
}

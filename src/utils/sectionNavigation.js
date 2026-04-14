export const SECTION_IDS = ["home", "about", "skills", "project", "contact"];

export function isKnownSectionId(sectionId) {
  return SECTION_IDS.includes(sectionId);
}

export function isSectionPagePath(pathname) {
  return pathname === "/" || pathname.startsWith("/admin/dashboard");
}

export function getSectionBasePath(pathname) {
  if (pathname.startsWith("/admin/dashboard") || pathname.startsWith("/project/")) {
    return "/admin/dashboard";
  }

  return "/";
}

export function buildSectionHref(pathname, sectionId) {
  return `${getSectionBasePath(pathname)}#${sectionId}`;
}

const PENDING_SECTION_KEY = "portfolio:pending-section";

export function getNavbarOffset() {
  const navbar = document.querySelector(".site-nav");
  return (navbar?.offsetHeight ?? 0) + 24;
}

export function rememberSectionTarget(sectionId) {
  window.sessionStorage.setItem(PENDING_SECTION_KEY, sectionId);
}

export function consumeSectionTarget() {
  const target = window.sessionStorage.getItem(PENDING_SECTION_KEY);

  if (!target) {
    return "";
  }

  window.sessionStorage.removeItem(PENDING_SECTION_KEY);
  return target;
}

export function scrollToSectionId(
  sectionId,
  { behavior = "smooth", retries = 18, retryDelay = 90 } = {},
) {
  let attempts = 0;

  function alignScroll(nextBehavior = behavior) {
    const element = document.getElementById(sectionId);

    if (!element) {
      if (attempts < retries) {
        attempts += 1;
        window.setTimeout(run, retryDelay);
      }
      return;
    }

    const top = Math.max(
      element.getBoundingClientRect().top + window.scrollY - getNavbarOffset(),
      0,
    );

    window.scrollTo({ top, behavior: nextBehavior });
  }

  function run() {
    alignScroll(behavior);

    // Re-align after layout settles so returning to a section lands exactly.
    window.setTimeout(() => alignScroll("auto"), 180);
    window.setTimeout(() => alignScroll("auto"), 420);
  }

  run();
}

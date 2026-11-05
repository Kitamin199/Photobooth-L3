// Keep the navigation in sync with the progress formula in ScrollExpand.
export const STUDIO_EXPAND_SCROLL_DISTANCE = 1.2;

// 50% of the scroll timeline still looks like an early, partially inset photo.
// At 80% the photo is already nearly expanded, with the next scroll revealing
// the studio content; the user can still scroll backward through the animation.
export const STUDIO_NAV_TARGET_PROGRESS = 0.8;

export function getStudioNavigationScrollTop(progress = STUDIO_NAV_TARGET_PROGRESS) {
  const studio = document.getElementById('studio');
  const track = studio?.querySelector('.expand-track');
  const stage = studio?.querySelector('.expand-stage');
  if (!track || !stage) return null;

  const styles = window.getComputedStyle(stage);
  const navbarHeight = Number.parseFloat(
    window.getComputedStyle(document.documentElement).getPropertyValue('--home-navbar-height'),
  ) || document.querySelector('header')?.offsetHeight || 0;

  // Reduced-motion and short-height layouts don't use a sticky scroll timeline.
  const destination = styles.position === 'sticky' && stage.offsetHeight > 0
    ? window.scrollY + track.getBoundingClientRect().top
      - (Number.parseFloat(styles.top) || 0)
      + STUDIO_EXPAND_SCROLL_DISTANCE * stage.offsetHeight * Math.max(0, Math.min(1, progress))
    : window.scrollY + stage.getBoundingClientRect().top - navbarHeight;

  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  return Math.max(0, Math.min(destination, maxScroll));
}

export function jumpToStudioAnimation() {
  const top = getStudioNavigationScrollTop();
  if (top === null) return false;

  // Override html's smooth-scroll rule during the direct jump, including in
  // browsers that apply CSS scroll-behavior to programmatic navigation.
  const root = document.documentElement;
  root.classList.add('is-studio-jumping');
  window.scrollTo({ top, behavior: 'instant' });

  // ScrollExpand normally eases toward the new progress over ~100ms. When
  // navigating we want the image *already* expanded at the destination.
  window.dispatchEvent(new Event('studio-navigation-jump'));
  requestAnimationFrame(() => {
    // Recheck after layout settles, e.g. after the mobile menu collapses.
    const correctedTop = getStudioNavigationScrollTop();
    if (correctedTop !== null && Math.abs(correctedTop - window.scrollY) > 2) {
      window.scrollTo({ top: correctedTop, behavior: 'instant' });
      window.dispatchEvent(new Event('studio-navigation-jump'));
    }
    root.classList.remove('is-studio-jumping');
  });
  return true;
}

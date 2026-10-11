(() => {
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const root = document.documentElement;
const navLinks = Array.from(document.querySelectorAll("nav a[href^='#']"));
const navTargets = navLinks
  .map((link) => {
    const targetId = decodeURIComponent(link.hash.slice(1));
    const target = document.getElementById(targetId);
    return target ? { link, target } : null;
  })
  .filter(Boolean);
const snapTargets = Array.from(document.querySelectorAll("main > section"));
const EDGE_TOLERANCE = 8;
const WHEEL_DELTA_THRESHOLD = 44;
const WHEEL_GESTURE_IDLE = 180;
const SNAP_DURATION = 820;
let snapTimer;
let wheelSnapTimer;
let wheelAccumulatorTimer;
let isWheelSnapping = false;
let wheelSnapIndex = 0;
let wheelSnapDirection = 0;
let wheelSnapRetargeted = false;
let wheelDeltaAccumulator = 0;
let activeModalTrigger;
let lockedPageScrollY = 0;

const syncHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

const syncActiveNav = () => {
  if (!navTargets.length) return;

  // Activate the section whose top has crossed an anchor line ~1/3 down the
  // viewport (just under the fixed header), so the highlighted item always
  // matches the section currently framed on screen.
  const anchorLine = getSnapOffset() + Math.min(window.innerHeight * 0.32, 220);
  let current = null;

  navTargets.forEach((item) => {
    if (item.target.getBoundingClientRect().top <= anchorLine) {
      current = item;
    }
  });

  navLinks.forEach((link) => link.classList.toggle("is-active", link === current?.link));
};

const closeNav = () => {
  nav?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
};

const getHeaderHeight = () => header?.getBoundingClientRect().height || 0;

const getSectionFrameGap = () => {
  const value = Number.parseFloat(getComputedStyle(root).getPropertyValue("--section-frame-gap"));
  return Number.isFinite(value) ? value : 0;
};

const getSnapOffset = () => getHeaderHeight() + getSectionFrameGap();

const pauseSnap = (duration = 900) => {
  root.classList.add("is-programmatic-scroll");
  window.clearTimeout(snapTimer);
  snapTimer = window.setTimeout(() => {
    root.classList.remove("is-programmatic-scroll");
  }, duration);
};

const getDocumentTop = (target) => target.getBoundingClientRect().top + window.scrollY;

const getContentFrameOffset = () => 0;

const getTargetTop = (target) => Math.max(0, getDocumentTop(target) - getSnapOffset());

const getTargetFrameTop = (target) => {
  const frameOffset = getContentFrameOffset(target);
  return Math.max(0, getDocumentTop(target) + frameOffset - getSnapOffset());
};

const updateHashForTarget = (target) => {
  if (!target.id) return;

  const nextHash = `#${target.id}`;
  const hasNavLink = navLinks.some((link) => link.hash === nextHash);
  if (!hasNavLink) return;

  if (window.location.hash !== nextHash) {
    history.replaceState(null, "", nextHash);
  }
};

const getMaxScrollTop = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

const clampScrollTop = (top) => Math.max(0, Math.min(getMaxScrollTop(), Math.round(top)));

const scrollPageTo = ({ top, behavior }) => {
  if (behavior === "auto") {
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo({ top, behavior: "auto" });
    root.style.scrollBehavior = previousScrollBehavior;
    return;
  }

  window.scrollTo({ top, behavior });
};

const getFramePositions = () => snapTargets.map((target) => getTargetFrameTop(target));

const getNearestSnapIndex = () => {
  const frames = getFramePositions();
  const current = window.scrollY;
  let bestIndex = 0;
  let bestDistance = Infinity;

  frames.forEach((position, index) => {
    const distance = Math.abs(position - current);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
};

const getSnapTargetTop = (index) => {
  const frames = getFramePositions();
  return clampScrollTop(frames[index] || 0);
};

const clampSnapIndex = (index) => Math.max(0, Math.min(snapTargets.length - 1, index));

const resetWheelAccumulator = () => {
  wheelDeltaAccumulator = 0;
  window.clearTimeout(wheelAccumulatorTimer);
};

const releaseWheelSnap = () => {
  isWheelSnapping = false;
  wheelSnapDirection = 0;
  wheelSnapRetargeted = false;
  resetWheelAccumulator();
  syncActiveNav();
};

const snapToIndex = (index, behavior = "smooth", direction = 0, retargeted = false) => {
  if (!snapTargets.length) return;

  const nextIndex = clampSnapIndex(index);
  const target = snapTargets[nextIndex];
  if (!target) return;

  wheelSnapIndex = nextIndex;
  wheelSnapDirection = direction;
  wheelSnapRetargeted = retargeted;
  isWheelSnapping = true;

  const duration = behavior === "auto" ? 180 : SNAP_DURATION;
  pauseSnap(duration + 140);
  scrollPageTo({ top: getSnapTargetTop(nextIndex), behavior });
  updateHashForTarget(target);

  window.clearTimeout(wheelSnapTimer);
  wheelSnapTimer = window.setTimeout(releaseWheelSnap, duration + 120);
};

window.addEventListener(
  "scrollend",
  () => {
    if (!isWheelSnapping) return;
    window.clearTimeout(wheelSnapTimer);
    releaseWheelSnap();
  },
  { passive: true },
);

const snapToTarget = (target, behavior = "smooth") => {
  if (!target) return;

  const index = snapTargets.indexOf(target);
  if (index >= 0) {
    snapToIndex(index, behavior);
    return;
  }

  pauseSnap(behavior === "auto" ? 120 : 900);
  scrollPageTo({ top: clampScrollTop(getTargetFrameTop(target)), behavior });
  updateHashForTarget(target);
};

const elementCanScrollVertically = (element, direction) => {
  if (!(element instanceof HTMLElement)) return false;
  if (element.scrollHeight <= element.clientHeight + 1) return false;

  if (direction > 0) {
    return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
  }

  return element.scrollTop > 1;
};

// Contexts where the wheel must keep its native behaviour: pinch-zoom, shift /
// horizontal scrolling, an open modal, or a control that can consume vertical
// scroll internally.
const wheelIsExempt = (event, direction) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey) return true;
  if (root.classList.contains("is-modal-open")) return true;
  if (!(event.target instanceof Element)) return false;
  if (event.target.closest("dialog")) return true;
  if (event.target.closest("#dracul-chat-widget, #chat-window, .chat-window, .chat-body")) return true;

  // Read overflow within a section before advancing the page to another frame.
  const frame = event.target.closest('.section-content');
  if (elementCanScrollVertically(frame, direction)) return true;
  const scrollableControl = event.target.closest("textarea, select");
  return elementCanScrollVertically(scrollableControl, direction);
};

const handleWheelSnap = (event) => {
  if (!snapTargets.length || event.defaultPrevented || window.innerWidth <= 780) return;

  if (event.deltaY === 0) return;

  const direction = event.deltaY > 0 ? 1 : -1;

  if (wheelIsExempt(event, direction)) return;

  event.preventDefault();

  wheelDeltaAccumulator += event.deltaY;
  window.clearTimeout(wheelAccumulatorTimer);
  wheelAccumulatorTimer = window.setTimeout(resetWheelAccumulator, WHEEL_GESTURE_IDLE);

  if (Math.abs(wheelDeltaAccumulator) < WHEEL_DELTA_THRESHOLD) return;

  const snapDirection = wheelDeltaAccumulator > 0 ? 1 : -1;
  resetWheelAccumulator();

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior = prefersReducedMotion ? "auto" : "smooth";

  if (isWheelSnapping) {
    if (snapDirection !== wheelSnapDirection && !wheelSnapRetargeted) {
      const nextIndex = clampSnapIndex(wheelSnapIndex + snapDirection);
      if (nextIndex !== wheelSnapIndex) {
        snapToIndex(nextIndex, behavior, snapDirection, true);
      }
    }
    return;
  }

  const currentIndex = getNearestSnapIndex();
  const nextIndex = clampSnapIndex(currentIndex + snapDirection);
  if (nextIndex === currentIndex) return;

  snapToIndex(nextIndex, behavior, snapDirection);
};

const scrollToHash = (hash, behavior = "smooth") => {
  if (!hash || hash === "#") return false;

  let targetId;

  try {
    targetId = decodeURIComponent(hash.slice(1));
  } catch {
    return false;
  }

  const target = document.getElementById(targetId);
  if (!target) return false;

  pauseSnap(behavior === "auto" ? 120 : 900);
  scrollPageTo({ top: clampScrollTop(getTargetFrameTop(target)), behavior });

  return true;
};


const syncLayout = () => {
 syncHeader(); syncActiveNav();
};
new ResizeObserver(syncLayout).observe(header);
document.addEventListener('click', event => {
 if (!(event.target instanceof Element)) return;
 const link = event.target.closest('a[href^="#"]');
 if (!link || !scrollToHash(link.hash, matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth')) return;
 event.preventDefault(); history.pushState(null, '', link.hash);
});
window.addEventListener('wheel', handleWheelSnap, {passive:false});
window.addEventListener('scroll', () => { syncHeader(); syncActiveNav(); }, {passive:true});
window.addEventListener('load', () => { syncLayout(); if (location.hash) scrollToHash(location.hash, 'auto'); });
window.addEventListener('hashchange', () => { if (location.hash) scrollToHash(location.hash); });
syncLayout();

})();
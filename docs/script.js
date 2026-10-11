const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const root = document.documentElement;
const navLinks = Array.from(document.querySelectorAll(".nav a[href^='#']"));
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
  let current = navTargets[0];

  navTargets.forEach((item) => {
    if (item.target.getBoundingClientRect().top <= anchorLine) {
      current = item;
    }
  });

  navLinks.forEach((link) => link.classList.toggle("is-active", link === current.link));
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
  const targetTop = getSnapTargetTop(wheelSnapIndex);

  if (Math.abs(window.scrollY - targetTop) > EDGE_TOLERANCE) {
    scrollPageTo({ top: targetTop, behavior: "auto" });
  }

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

    const targetTop = getSnapTargetTop(wheelSnapIndex);
    if (Math.abs(window.scrollY - targetTop) > EDGE_TOLERANCE) {
      return;
    }

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

const lockPageScroll = () => {
  if (root.classList.contains("is-modal-open")) return;

  lockedPageScrollY = window.scrollY;
  const scrollbarCompensation = Math.max(0, window.innerWidth - root.clientWidth);

  root.style.setProperty("--scrollbar-compensation", `${scrollbarCompensation}px`);
  root.classList.add("is-modal-open");

  document.body.style.position = "fixed";
  document.body.style.top = `-${lockedPageScrollY}px`;
  document.body.style.right = "0";
  document.body.style.left = "0";
  document.body.style.width = "100%";
};

const unlockPageScroll = () => {
  if (!root.classList.contains("is-modal-open")) return;

  const scrollY = lockedPageScrollY;

  pauseSnap(900);
  root.classList.remove("is-modal-open");
  root.style.removeProperty("--scrollbar-compensation");

  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.right = "";
  document.body.style.left = "";
  document.body.style.width = "";

  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, scrollY);
  root.style.scrollBehavior = previousScrollBehavior;
};

const openModal = (modalId, trigger) => {
  const modal = document.getElementById(modalId);
  if (!(modal instanceof HTMLDialogElement) || modal.open) return;

  activeModalTrigger = trigger;
  lockPageScroll();

  try {
    modal.showModal();
  } catch {
    unlockPageScroll();
    activeModalTrigger = undefined;
  }
};

const closeModal = (modal) => {
  if (!(modal instanceof HTMLDialogElement) || !modal.open) return;
  modal.close();
};

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  document.body.classList.toggle("nav-open", Boolean(isOpen));

  const chatWidget = document.getElementById("dracul-chat-widget");
  const chatWindow = document.getElementById("chat-window");
  if (isOpen && chatWidget?.classList.contains("is-chat-open")) {
    chatWidget.classList.remove("is-chat-open");
    chatWindow?.classList.remove("is-open");
    chatWindow?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("chat-widget-active");
  }
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof Element && event.target.closest("a")) {
    closeNav();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav?.classList.contains("is-open")) {
    closeNav();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 780 && nav?.classList.contains("is-open")) {
    closeNav();
  }
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;

  const modalTrigger = event.target.closest("[data-modal-target]");
  if (modalTrigger instanceof HTMLElement) {
    event.preventDefault();
    openModal(modalTrigger.dataset.modalTarget || "", modalTrigger);
    return;
  }

  const modalClose = event.target.closest("[data-modal-close]");
  if (modalClose) {
    event.preventDefault();
    closeModal(modalClose.closest("dialog"));
    return;
  }

  const link = event.target.closest('a[href^="#"]');
  if (!(link instanceof HTMLAnchorElement)) return;
  if (link.origin !== window.location.origin || link.pathname !== window.location.pathname) return;
  if (!scrollToHash(link.hash)) return;

  event.preventDefault();
  history.pushState(null, "", link.hash);
  closeNav();
});

document.querySelectorAll(".modal").forEach((modal) => {
  if (!(modal instanceof HTMLDialogElement)) return;

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });

  modal.addEventListener("close", () => {
    unlockPageScroll();

    if (activeModalTrigger instanceof HTMLElement) {
      activeModalTrigger.focus({ preventScroll: true });
    }

    activeModalTrigger = undefined;
  });
});

// Dynamic decrementing character counters
const briefingName = document.getElementById("briefing-name");
const nameCounter = document.getElementById("name-counter");
const briefingEmail = document.getElementById("briefing-email");
const emailCounter = document.getElementById("email-counter");
const briefingScope = document.getElementById("briefing-scope");
const scopeCounter = document.getElementById("scope-counter");

const setupDecrementCounter = (inputEl, counterEl, maxLen) => {
  if (!inputEl || !counterEl) return () => {};

  const update = () => {
    const currentLen = inputEl.value.length;
    const remaining = Math.max(0, maxLen - currentLen);
    counterEl.textContent = `${remaining} restantes`;

    const warningThreshold = Math.max(5, Math.floor(maxLen * 0.15));
    const dangerThreshold = Math.max(2, Math.floor(maxLen * 0.05));

    if (remaining <= dangerThreshold) {
      counterEl.className = "char-counter is-limit";
    } else if (remaining <= warningThreshold) {
      counterEl.className = "char-counter is-warning";
    } else {
      counterEl.className = "char-counter";
    }
  };

  inputEl.addEventListener("input", update);
  update();
  return update;
};

const resetNameCounter = setupDecrementCounter(briefingName, nameCounter, 80);
const resetEmailCounter = setupDecrementCounter(briefingEmail, emailCounter, 100);
const resetScopeCounter = setupDecrementCounter(briefingScope, scopeCounter, 1500);

// LinkedIn-style Toast / Snackbar Notification
// Desktop: Bottom-Left | Mobile: Centered Bottom
function showDraculToast({ title, message, type = "success", duration = 6500 }) {
  title = window.DraculTranslate?.(title) || title;
  message = window.DraculTranslate?.(message) || message;
  let container = document.getElementById("dracul-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "dracul-toast-container";
    container.className = "dracul-toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.appendChild(container);
  }

  // Remove existing toasts so only one active alert is shown
  const existingToasts = container.querySelectorAll(".dracul-toast");
  existingToasts.forEach((t) => t.remove());

  const toast = document.createElement("div");
  toast.className = `dracul-toast is-${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");

  const iconSvg = type === "success"
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `
    <div class="dracul-toast-icon">${iconSvg}</div>
    <div class="dracul-toast-content">
      <div class="dracul-toast-title">${title}</div>
      <p class="dracul-toast-message">${message}</p>
    </div>
    <button class="dracul-toast-close" type="button" aria-label="Fechar notificação">&times;</button>
    <div class="dracul-toast-progress"></div>
  `;

  container.appendChild(toast);

  // Trigger smooth enter animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add("is-showing");
    });
  });

  const progressBar = toast.querySelector(".dracul-toast-progress");
  let startTime = Date.now();
  let remainingTime = duration;
  let timerId = null;
  let progressAnim = null;

  function dismiss() {
    if (timerId) clearTimeout(timerId);
    if (progressAnim) cancelAnimationFrame(progressAnim);
    toast.classList.remove("is-showing");
    toast.classList.add("is-hiding");
    setTimeout(() => {
      toast.remove();
    }, 380);
  }

  function startProgress() {
    startTime = Date.now();
    timerId = setTimeout(dismiss, remainingTime);

    function updateProgress() {
      const elapsed = Date.now() - startTime;
      const progress = Math.max(0, 1 - elapsed / remainingTime);
      if (progressBar) {
        progressBar.style.transform = `scaleX(${progress})`;
      }
      if (progress > 0) {
        progressAnim = requestAnimationFrame(updateProgress);
      }
    }
    progressAnim = requestAnimationFrame(updateProgress);
  }

  function pauseProgress() {
    if (timerId) clearTimeout(timerId);
    if (progressAnim) cancelAnimationFrame(progressAnim);
    const elapsed = Date.now() - startTime;
    remainingTime = Math.max(0, remainingTime - elapsed);
  }

  // Hover or touch to pause dismissal timer (LinkedIn behavior)
  toast.addEventListener("mouseenter", pauseProgress);
  toast.addEventListener("mouseleave", () => {
    if (remainingTime > 0) startProgress();
  });
  toast.addEventListener("touchstart", pauseProgress, { passive: true });
  toast.addEventListener("touchend", () => {
    if (remainingTime > 0) startProgress();
  }, { passive: true });

  const closeBtn = toast.querySelector(".dracul-toast-close");
  closeBtn?.addEventListener("click", dismiss);

  startProgress();
  return dismiss;
}

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(contactForm);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const scope = String(data.get("scope") || "").trim();

  // Validation
  if (name.length < 2 || name.length > 80) {
    showDraculToast({
      title: "Identificação necessária",
      message: "Por favor, informe seu nome ou o da sua organização (entre 2 e 80 caracteres).",
      type: "error",
      duration: 5000
    });
    contactForm.querySelector("input[name='name']")?.focus();
    return;
  }

  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (!emailRegex.test(email) || email.length > 100) {
    showDraculToast({
      title: "E-mail corporativo inválido",
      message: "Por favor, informe um endereço de e-mail corporativo válido (máximo 100 caracteres).",
      type: "error",
      duration: 5000
    });
    contactForm.querySelector("input[name='email']")?.focus();
    return;
  }

  if (scope.length < 10) {
    showDraculToast({
      title: "Detalhe o escopo",
      message: "Por favor, detalhe melhor o escopo e os alvos a serem avaliados (mínimo de 10 caracteres).",
      type: "error",
      duration: 5000
    });
    briefingScope?.focus();
    return;
  }

  if (scope.length > 1500) {
    showDraculToast({
      title: "Limite de caracteres excedido",
      message: "O detalhamento do escopo excede o limite máximo de 1500 caracteres.",
      type: "error",
      duration: 5000
    });
    briefingScope?.focus();
    return;
  }

  // Block all form controls and button
  const formElements = Array.from(contactForm.elements);
  formElements.forEach((el) => {
    el.disabled = true;
  });

  const submitBtn = contactForm.querySelector("button[type='submit']");
  const originalBtnContent = submitBtn ? submitBtn.innerHTML : "Enviar briefing";

  if (submitBtn) {
    submitBtn.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span> Transmitindo briefing...`;
  }

  if (formStatus) {
    formStatus.className = "form-status sr-only";
    formStatus.textContent = "Transmitindo briefing com segurança...";
  }

  try {
    const response = await fetch("/api/briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, scope })
    });

    const result = await response.json().catch(() => ({}));

    if (response.ok && result.success) {
      contactForm.reset();
      resetNameCounter();
      resetEmailCounter();
      resetScopeCounter();

      if (formStatus) {
        formStatus.textContent = "Briefing enviado com sucesso!";
      }

      // Popup in LinkedIn style: Bottom-left on Desktop, Bottom-center on Mobile
      showDraculToast({
        title: "Briefing enviado com sucesso!",
        message: "Recebemos sua solicitação. Nossa equipe técnica irá avaliar o escopo e retornará o contato em breve com um alinhamento.",
        type: "success",
        duration: 6500
      });
    } else {
      throw new Error(result.error || "Não foi possível enviar via servidor.");
    }
  } catch (err) {
    showDraculToast({
      title: "Falha na transmissão",
      message: err.message || "Ocorreu uma instabilidade na conexão ao transmitir o briefing. Por favor, tente novamente em instantes.",
      type: "error",
      duration: 7000
    });
  } finally {
    // Unblock all form controls
    formElements.forEach((el) => {
      el.disabled = false;
    });
    if (submitBtn) {
      submitBtn.innerHTML = originalBtnContent;
    }
  }
});

// Dracul AI Conversational Widget Controller
(function initDraculChat() {
  const launcher = document.getElementById("chat-launcher");
  const chatWindow = document.getElementById("chat-window");
  const closeBtn = document.getElementById("chat-close");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");
  const chatSuggestions = document.getElementById("chat-suggestions");

  const chatWidget = document.getElementById("dracul-chat-widget");

  if (!launcher || !chatWindow || !chatForm || !chatInput || !chatMessages) return;

  const chatHistory = [];

  function openChat() {
    closeNav();
    chatWindow.classList.add("is-open");
    chatWidget?.classList.add("is-chat-open");
    chatWindow.setAttribute("aria-hidden", "false");

    if (window.innerWidth <= 640) {
      document.body.classList.add("chat-widget-active");
    } else {
      setTimeout(() => chatInput.focus(), 150);
    }
  }

  function closeChat() {
    chatWindow.classList.remove("is-open");
    chatWidget?.classList.remove("is-chat-open");
    chatWindow.setAttribute("aria-hidden", "true");
    document.body.classList.remove("chat-widget-active");
  }

  launcher.addEventListener("click", () => {
    if (chatWindow.classList.contains("is-open")) {
      closeChat();
    } else {
      openChat();
    }
  });

  closeBtn?.addEventListener("click", closeChat);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && chatWindow.classList.contains("is-open")) {
      closeChat();
    }
  });

  // Close chat when clicking outside
  document.addEventListener("click", (event) => {
    if (!chatWindow.classList.contains("is-open")) return;
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest("#chat-launcher") || target.closest("#chat-window")) {
      return;
    }

    closeChat();
  });

  // Prevent wheel from triggering page snap and allow natural, smooth scrolling
  chatWindow.addEventListener("wheel", (event) => {
    event.stopPropagation();
    if (!event.target.closest("#chat-messages") && chatMessages && event.deltaY) {
      chatMessages.scrollTop += event.deltaY;
    }
  }, { passive: true });

  function appendMessage(role, text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${role}`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    const paragraphs = text.split(/\n\n+/);
    paragraphs.forEach(pText => {
      const p = document.createElement("p");
      p.textContent = pText.trim();
      if (p.textContent) contentDiv.appendChild(p);
    });

    msgDiv.appendChild(contentDiv);
    chatMessages.appendChild(msgDiv);

    if (role === "bot") {
      // Position the scroll directly at the top/beginning of the new bot reply!
      window.requestAnimationFrame(() => {
        const topPos = msgDiv.offsetTop - chatMessages.offsetTop;
        chatMessages.scrollTo({
          top: Math.max(0, topPos - 12),
          behavior: "smooth"
        });
      });
    } else {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    return msgDiv;
  }

  function showTypingIndicator() {
    const indDiv = document.createElement("div");
    indDiv.className = "chat-message bot typing-msg";
    indDiv.innerHTML = `
      <div class="message-content typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    chatMessages.appendChild(indDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indDiv;
  }

  async function sendMessage(userText) {
    const text = userText.trim();
    if (!text) return;

    if (chatSuggestions) {
      chatSuggestions.style.display = "none";
    }

    appendMessage("user", text);
    chatHistory.push({ role: "user", text });

    const indicator = showTypingIndicator();
    chatInput.value = "";
    chatInput.disabled = true;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          language: window.DraculLocale?.language || "en",
          history: chatHistory.slice(-6)
        })
      });

      const data = await res.json().catch(() => ({}));
      indicator.remove();

      const reply = data.reply || "Agradeço a mensagem! Estamos prontos para avaliar a segurança do seu ambiente. Por favor, detalhe seu escopo no formulário de briefing logo abaixo para que nossa equipe técnica avalie e retorne o contato.";
      appendMessage("bot", reply);
      chatHistory.push({ role: "model", text: reply });
    } catch (e) {
      indicator.remove();
      appendMessage("bot", "Estou com instabilidade temporária na conexão, mas você pode enviar seu escopo diretamente pelo formulário de briefing logo abaixo para que nossa equipe técnica avalie.");
    } finally {
      chatInput.disabled = false;
      chatInput.focus();
    }
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(chatInput.value);
  });

  chatSuggestions?.addEventListener("click", (e) => {
    const btn = e.target.closest(".suggestion-chip");
    if (btn && btn.dataset.prompt) {
      sendMessage(btn.dataset.prompt);
    }
  });
})();


syncHeader();
syncActiveNav();
window.addEventListener(
  "scroll",
  () => {
    syncHeader();
    syncActiveNav();
  },
  { passive: true },
);
window.addEventListener("wheel", handleWheelSnap, { passive: false });
window.addEventListener("load", () => {
  if (window.location.hash) {
    window.requestAnimationFrame(() => scrollToHash(window.location.hash, "auto"));
  }
  syncActiveNav();
});
window.addEventListener("hashchange", () => {
  if (window.location.hash) {
    scrollToHash(window.location.hash);
  }
  syncActiveNav();
});

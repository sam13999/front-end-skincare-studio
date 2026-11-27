import { useEffect } from "react";

const PRESSED = "is-pressed";
const SCOPE = "admin-ui";
const CLICKABLE = "button, [role='button'], a.action-button, a.primary-button";

/** Retour visuel au clic/tap sur tous les boutons de la page (Dashboard admin). */
export function usePressFeedback(minimumMs = 180) {
  useEffect(() => {
    document.body.classList.add(SCOPE);
    const timers = new Map<Element, number>();

    const press = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest(CLICKABLE) : null;
      if (!target || target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true") return;
      window.clearTimeout(timers.get(target));
      target.classList.add(PRESSED);
      const pressedAt = performance.now();
      const release = () => {
        const wait = Math.max(0, minimumMs - (performance.now() - pressedAt));
        timers.set(target, window.setTimeout(() => { target.classList.remove(PRESSED); timers.delete(target); }, wait));
        window.removeEventListener("pointerup", release);
        window.removeEventListener("pointercancel", release);
      };
      window.addEventListener("pointerup", release);
      window.addEventListener("pointercancel", release);
    };

    document.addEventListener("pointerdown", press, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", press);
      timers.forEach((timer, element) => { window.clearTimeout(timer); element.classList.remove(PRESSED); });
      document.body.classList.remove(SCOPE);
    };
  }, [minimumMs]);
}

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  /* ------------------------------------------------------------- copy -- */

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand("copy");
      field.remove();
      return ok;
    }
  };

  $$("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = $(button.dataset.copy);
      if (!target) return;
      const ok = await copyText(target.textContent.trim());
      if (!ok) return;
      const label = button.textContent;
      button.textContent = "Copied";
      button.classList.add("is-copied");
      window.setTimeout(() => {
        button.textContent = label;
        button.classList.remove("is-copied");
      }, 1600);
    });
  });

  /* --------------------------------------------------------- composer -- */

  const presets = {
    "27.7172,85.324": { label: "Kathmandu", zoom: 14 },
    "27.6736,85.325": { label: "Patan", zoom: 15 },
    "27.7215,85.362": { label: "Boudhanath", zoom: 15 },
    "28.2096,83.9856": { label: "Pokhara", zoom: 13 },
  };

  const preset = $("#preset");
  const zoom = $("#zoom");
  const zoomValue = $("#zoom-value");
  const coords = $("#coords");
  const composerCode = $("#composer-code");
  const withMarker = $("#with-marker");
  const withPolygon = $("#with-polygon");
  const withSearch = $("#with-search");

  const formatCoords = (lat, lng) => {
    const ns = lat >= 0 ? "N" : "S";
    const ew = lng >= 0 ? "E" : "W";
    return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lng).toFixed(4)}° ${ew}`;
  };

  const renderComposer = () => {
    if (!preset || !zoom || !composerCode) return;

    const [lat, lng] = preset.value.split(",").map(Number);
    const current = presets[preset.value] || { label: "Custom", zoom: Number(zoom.value) };
    const lines = [],
      children = [];

    lines.push("<Gallimap");
    lines.push("  accessToken={token}");
    lines.push(`  center={[${lat}, ${lng}]}`);
    lines.push(`  zoom={${zoom.value}}`);
    lines.push(">");

    if (withMarker?.checked) {
      children.push(`  <Marker position={[${lat}, ${lng}]} color="red" />`);
    }

    if (withPolygon?.checked) {
      const d = 0.004;
      children.push(`  <Polygon`);
      children.push(`    name="sample-area"`);
      children.push(`    coordinates={[`);
      children.push(`      [${(lat - d).toFixed(4)}, ${(lng - d).toFixed(4)}],`);
      children.push(`      [${(lat - d).toFixed(4)}, ${(lng + d).toFixed(4)}],`);
      children.push(`      [${(lat + d).toFixed(4)}, ${(lng + d).toFixed(4)}],`);
      children.push(`    ]}`);
      children.push(`  />`);
    }

    if (withSearch?.checked) {
      children.push(`  <Search lat={${lat}} lng={${lng}} />`);
    }

    lines.push(...children, "</Gallimap>");
    composerCode.textContent = lines.join("\n");

    if (zoomValue) zoomValue.textContent = zoom.value;
    if (coords) {
      coords.textContent = `${formatCoords(lat, lng)} · ${current.label} · zoom ${zoom.value}`;
    }
  };

  if (preset && zoom) {
    preset.addEventListener("change", () => {
      const next = presets[preset.value];
      if (next) zoom.value = String(next.zoom);
      renderComposer();
    });
    zoom.addEventListener("input", renderComposer);
    [withMarker, withPolygon, withSearch].forEach((box) => {
      box?.addEventListener("change", renderComposer);
    });
    renderComposer();
  }

  /* ----------------------------------------------------- showcase tabs -- */

  const bindTabs = ({ tabSelector, panelSelector, panelData, activeClass = "is-active" }) => {
    const tabs = $$(tabSelector);
    if (!tabs.length) return;

    const activate = (tab, focus = false) => {
      tabs.forEach((item) => {
        const on = item === tab;
        item.classList.toggle(activeClass, on);
        item.setAttribute("aria-selected", String(on));
        item.tabIndex = on ? 0 : -1;
        const panel = $("#" + item.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (event) => {
        const keys = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: tabs.length - 1 - index };
        if (!(event.key in keys)) return;
        event.preventDefault();
        const next = tabs[(index + keys[event.key] + tabs.length) % tabs.length];
        activate(next, true);
      });
    });
  };

  bindTabs({ tabSelector: ".showcase-tab", panelSelector: ".sheet" });
  bindTabs({ tabSelector: ".ref-tab", panelSelector: ".ref-panel" });

  /* ------------------------------------------------------ guide steps -- */

  const steps = $$(".guide-step");
  const guidePanels = $$(".guide-panel");

  if (steps.length) {
    const setStep = (step) => {
      steps.forEach((item) => item.classList.toggle("is-active", item === step));
      guidePanels.forEach((panel) => {
        panel.hidden = panel.dataset.panel !== step.dataset.step;
      });
      $$(".step-toggle").forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.step === step.dataset.step),
        );
      });
    };

    $$(".step-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const step = steps.find((item) => item.dataset.step === button.dataset.step);
        if (step) setStep(step);
      });
    });

    setStep(steps[0]);
  }

  /* --------------------------------------------------------- api list -- */

  const filter = $("#api-filter");
  const rows = $$(".command-row");
  const empty = $("#command-empty");

  if (filter && rows.length) {
    const setActive = (row) => {
      rows.forEach((item) => item.classList.toggle("is-active", item === row));
    };

    rows.forEach((row) => row.addEventListener("click", () => setActive(row)));

    filter.addEventListener("input", () => {
      const query = filter.value.trim().toLowerCase();
      let visible = 0;

      rows.forEach((row) => {
        const match = !query || row.textContent.toLowerCase().includes(query);
        row.hidden = !match;
        if (match) visible += 1;
      });

      if (empty) empty.hidden = visible > 0;

      const active = rows.find((row) => row.classList.contains("is-active"));
      if (!active || active.hidden) setActive(rows.find((row) => !row.hidden));
    });
  }

  /* ------------------------------------------------------------- faq -- */

  const faqItems = $$(".faq-item");
  const faqText = $("#faq-answer-text");

  if (faqItems.length && faqText) {
    const activateFaq = (item) => {
      const wasActive = item.classList.contains("is-active");

      faqItems.forEach((other) => {
        const on = other === item && !wasActive;
        other.classList.toggle("is-active", on);
        $(".faq-q", other).setAttribute("aria-expanded", String(on));
        $(".faq-a-inline", other).hidden = true;
      });

      if (wasActive) return;

      $(".faq-a-inline", item).hidden = false;

      const answer = $(".faq-a-inline", item).textContent.trim();
      faqText.classList.add("is-swapping");
      window.setTimeout(() => {
        faqText.textContent = answer;
        faqText.classList.remove("is-swapping");
      }, 140);
    };

    faqItems.forEach((item) => {
      $(".faq-q", item).addEventListener("click", () => activateFaq(item));
    });
  }

  /* ---------------------------------------------------- package manager -- */

  const commands = {
    npm: "npm install react-gallimaps",
    pnpm: "pnpm add react-gallimaps",
    yarn: "yarn add react-gallimaps",
  };

  const ctaCommand = $("#cta-command");
  $$(".pm").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".pm").forEach((item) => item.classList.toggle("is-active", item === button));
      if (ctaCommand) ctaCommand.textContent = commands[button.dataset.pm] || commands.npm;
    });
  });

  /* ------------------------------------------------------- local time -- */

  const clock = $("#local-time");
  if (clock) {
    const tick = () => {
      clock.textContent = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kathmandu",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());
    };
    tick();
    window.setInterval(tick, 30_000);
  }

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------------------- reveal -- */

  const reveal = $$("[data-reveal]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reveal.length && !reduce && "IntersectionObserver" in window) {
    document.body.classList.add("reveal-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    reveal.forEach((item) => observer.observe(item));
  }
})();

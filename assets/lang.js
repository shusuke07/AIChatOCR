(() => {
  const LANG_KEY = "lang";

  const getQueryLang = () => {
    try {
      const params = new URLSearchParams(location.search);
      const lang = (params.get("lang") || "").toLowerCase();
      if (lang === "ja" || lang === "en") return lang;
    } catch {}
    return null;
  };

  const stripLangParam = () => {
    try {
      const params = new URLSearchParams(location.search);
      params.delete("lang");
      const s = params.toString();
      return s ? `?${s}` : "";
    } catch {}
    return "";
  };

  const getStoredLang = () => {
    try {
      const lang = (localStorage.getItem(LANG_KEY) || "").toLowerCase();
      if (lang === "ja" || lang === "en") return lang;
    } catch {}
    return null;
  };

  const setStoredLang = (lang) => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {}
  };

  const getBrowserLang = () => {
    const raw = (navigator.language || navigator.userLanguage || "").toLowerCase();
    if (raw.startsWith("ja")) return "ja";
    if (raw.startsWith("en")) return "en";
    return "ja";
  };

  const getPathLang = () => {
    const m = location.pathname.match(/\/(ja|en)\//);
    return m ? m[1] : null;
  };

  const replaceLangInPath = (targetLang) => {
    const path = location.pathname;
    const current = getPathLang();
    if (!current) return `/${targetLang}/`;
    return path.replace(`/${current}/`, `/${targetLang}/`);
  };

  // Optional override: if a user explicitly specifies ?lang= on any /ja/ or /en/ page,
  // move to the same path in the requested language.
  const maybeRedirectByQueryOnLangPages = () => {
    const q = getQueryLang();
    const current = getPathLang();
    if (!q || !current) return;
    if (q === current) {
      setStoredLang(q);
      return;
    }
    setStoredLang(q);
    location.replace(replaceLangInPath(q) + stripLangParam() + location.hash);
  };

  // Gateway behavior: redirect only when user already chose (or explicit ?lang=).
  const maybeRedirectFromGateway = () => {
    if (document.documentElement?.dataset?.page !== "lang-gateway") return;

    const q = getQueryLang();
    if (q) {
      setStoredLang(q);
      location.replace(`/${q}/` + stripLangParam() + location.hash);
      return;
    }

    const stored = getStoredLang();
    if (stored) {
      location.replace(`/${stored}/`);
      return;
    }

    // No forced redirect on first visit. We only show a hint.
    const hint = document.querySelector("[data-lang-hint]");
    if (hint) {
      hint.textContent =
        getBrowserLang() === "en"
          ? "English is recommended based on your browser settings."
          : "ブラウザ設定に基づき、日本語がおすすめです。";
    }
  };

  const wireLanguageLinks = () => {
    // Language switcher links inside /ja/ or /en/
    const switchLinks = document.querySelectorAll("[data-lang-link]");
    if (switchLinks.length) {
      const current = getPathLang();
      switchLinks.forEach((a) => {
        const target = (a.getAttribute("data-lang-link") || "").toLowerCase();
        if (target !== "ja" && target !== "en") return;
        a.setAttribute("href", replaceLangInPath(target));
        a.addEventListener("click", () => setStoredLang(target));
        if (current && target === current) a.classList.add("is-active");
        if (current && target !== current) a.classList.remove("is-active");
      });
    }

    // Gateway buttons
    const setLinks = document.querySelectorAll("[data-set-lang]");
    if (setLinks.length) {
      setLinks.forEach((a) => {
        const target = (a.getAttribute("data-set-lang") || "").toLowerCase();
        if (target !== "ja" && target !== "en") return;
        a.addEventListener("click", () => setStoredLang(target));
      });
    }
  };

  const rememberCurrentLang = () => {
    const pathLang = getPathLang();
    if (pathLang) setStoredLang(pathLang);
  };

  maybeRedirectByQueryOnLangPages();
  maybeRedirectFromGateway();
  rememberCurrentLang();
  wireLanguageLinks();
})();


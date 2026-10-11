(() => {
  const supported = ['en', 'es', 'pt'];
  const normalize = value => String(value || '').toLowerCase().split('-')[0];
  const requested = normalize(new URL(location.href).searchParams.get('lang'));
  let saved;
  try { saved = localStorage.getItem('dracul-language'); } catch {}
  let language = supported.includes(requested) ? requested : supported.includes(saved) ? saved : 'en';
  const listeners = [];
  window.DraculLocale = {
    get language() { return language; },
    subscribe(callback) { listeners.push(callback); callback(language); },
    set(value) {
      if (!supported.includes(value)) return;
      language = value;
      try { localStorage.setItem('dracul-language', value); } catch {}
      const url = new URL(location.href);
      url.searchParams.set('lang', value);
      history.replaceState(null, '', url);
      listeners.forEach(callback => callback(language));
      document.dispatchEvent(new CustomEvent('dracul-language-change', { detail: language }));
    }
  };
})();

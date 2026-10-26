const root = document.querySelector('[data-personality-tabs]');

if (root) {
  const tablist = root.querySelector('[role="tablist"]');
  const tabs = [...root.querySelectorAll('[data-personality-tab]')];
  const panels = [...root.querySelectorAll('[data-personality-panel]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactLayout = window.matchMedia('(max-width: 840px)');

  const syncOrientation = () => {
    tablist?.setAttribute('aria-orientation', compactLayout.matches ? 'horizontal' : 'vertical');
  };

  const revealTab = tab => {
    if (!tab || !tablist || !compactLayout.matches) return;
    const left = tab.offsetLeft - Math.max(0, (tablist.clientWidth - tab.offsetWidth) / 2);
    tablist.scrollTo({
      left: Math.max(0, left),
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
  };

  const activate = (key, { focus = false, reveal = false } = {}) => {
    let activeTab = null;

    for (const tab of tabs) {
      const selected = tab.dataset.personalityTab === key;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
      if (selected) activeTab = tab;
    }

    for (const panel of panels) {
      panel.hidden = panel.dataset.personalityPanel !== key;
    }

    if (activeTab && focus) activeTab.focus({ preventScroll: true });
    if (activeTab && reveal) revealTab(activeTab);
  };

  syncOrientation();
  compactLayout.addEventListener?.('change', syncOrientation);

  root.classList.add('is-enhanced');
  activate(
    tabs.find(tab => tab.getAttribute('aria-selected') === 'true')?.dataset.personalityTab
      || tabs[0]?.dataset.personalityTab
  );

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activate(tab.dataset.personalityTab, { reveal: true });
    });

    tab.addEventListener('keydown', event => {
      const horizontal = compactLayout.matches;
      const previousKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
      const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown';

      if (![previousKey, nextKey, 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === nextKey) nextIndex = (index + 1) % tabs.length;
      if (event.key === previousKey) nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;

      activate(tabs[nextIndex].dataset.personalityTab, { focus: true, reveal: true });
    });
  });
}

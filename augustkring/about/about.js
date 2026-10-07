const root = document.querySelector('[data-personality-tabs]');

if (root) {
  const tabs = [...root.querySelectorAll('[data-personality-tab]')];
  const panels = [...root.querySelectorAll('[data-personality-panel]')];

  const activate = (key, focus = false) => {
    for (const tab of tabs) {
      const selected = tab.dataset.personalityTab === key;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    }

    for (const panel of panels) {
      panel.hidden = panel.dataset.personalityPanel !== key;
    }
  };

  root.classList.add('is-enhanced');
  activate(tabs.find(tab => tab.getAttribute('aria-selected') === 'true')?.dataset.personalityTab || tabs[0]?.dataset.personalityTab);

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.personalityTab));

    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;

      activate(tabs[nextIndex].dataset.personalityTab, true);
    });
  });
}

(() => {
  const form = document.querySelector('.unsubscribe-form');
  const status = document.querySelector('#unsubscribe-status');
  if (!form || !status) return;

  const emailInput = form.querySelector('input[name="email"]');
  const button = form.querySelector('button[type="submit"]');
  if (!emailInput || !button) return;

  const defaultLabel = button.textContent || 'Unsubscribe';

  const url = new URL(window.location.href);
  if (url.searchParams.get('status') === 'done') {
    status.textContent = 'You’re unsubscribed.';
    url.searchParams.delete('status');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    const payload = Object.fromEntries(new FormData(form));

    form.setAttribute('aria-busy', 'true');
    button.disabled = true;
    button.textContent = 'Unsubscribing…';
    status.textContent = 'Unsubscribing…';
    status.classList.remove('is-error');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'We could not process the request. Please try again.');
      }

      form.reset();
      status.textContent = 'You’re unsubscribed.';
    } catch (error) {
      const message = error instanceof DOMException && error.name === 'AbortError'
        ? 'The request took too long. Please try again.'
        : error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';

      status.textContent = message;
      status.classList.add('is-error');
    } finally {
      window.clearTimeout(timeout);
      form.removeAttribute('aria-busy');
      button.disabled = false;
      button.textContent = defaultLabel;
    }
  });
})();

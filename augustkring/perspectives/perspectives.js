(() => {
  const newsletterForm = document.querySelector('.perspectives-newsletter-form');
  const newsletterStatus = document.querySelector('.newsletter-status');

  if (!newsletterForm || !newsletterStatus) return;

  const emailInput = newsletterForm.querySelector('input[name="email"]');
  const button = newsletterForm.querySelector('button[type="submit"]');

  if (!emailInput || !button) return;

  const defaultButtonLabel = button.textContent || 'Subscribe';

  const url = new URL(window.location.href);
  if (url.searchParams.get('subscribed') === '1') {
    newsletterStatus.textContent = 'You’re subscribed.';
    url.searchParams.delete('subscribed');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }

  newsletterForm.addEventListener('submit', async event => {
    event.preventDefault();

    if (!newsletterForm.reportValidity()) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    const payload = Object.fromEntries(new FormData(newsletterForm));

    newsletterForm.setAttribute('aria-busy', 'true');
    button.disabled = true;
    button.textContent = 'Subscribing…';
    newsletterStatus.textContent = 'Subscribing…';
    newsletterStatus.classList.remove('is-error');

    try {
      const response = await fetch(newsletterForm.action, {
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
        throw new Error(typeof data.error === 'string' ? data.error : 'Subscription failed. Please try again.');
      }

      newsletterForm.reset();
      newsletterStatus.textContent = 'You’re subscribed.';
    } catch (error) {
      const message = error instanceof DOMException && error.name === 'AbortError'
        ? 'The request took too long. Please try again.'
        : error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';

      newsletterStatus.textContent = message;
      newsletterStatus.classList.add('is-error');
    } finally {
      window.clearTimeout(timeout);
      newsletterForm.removeAttribute('aria-busy');
      button.disabled = false;
      button.textContent = defaultButtonLabel;
    }
  });
})();

let scriptPromise = null;

function loadGoogleScript() {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-signin="true"]');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleSignin = 'true';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Google script'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function promptGoogleSignIn() {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error('Google Sign-In is not configured. Add REACT_APP_GOOGLE_CLIENT_ID in frontend .env');
  }

  await loadGoogleScript();

  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    throw new Error('Google Sign-In library is unavailable');
  }

  return new Promise((resolve, reject) => {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response?.credential) {
          resolve(response.credential);
          return;
        }
        reject(new Error('No Google credential received'));
      }
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        reject(new Error('Google prompt was not shown. Check popup settings and browser support.'));
      }
    });
  });
}

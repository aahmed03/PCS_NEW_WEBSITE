export function loadReCaptcha(siteKey) {
  return new Promise((resolve, reject) => {
    if (!siteKey) {
      reject(new Error("Missing site key"));
      return;
    }

    // Already loaded
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => resolve(window.grecaptcha));
      return;
    }

    // Create script tag
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (!window.grecaptcha) {
        reject(new Error("grecaptcha failed to load"));
      } else {
        window.grecaptcha.ready(() => resolve(window.grecaptcha));
      }
    };

    script.onerror = () => reject(new Error("Failed to load recaptcha script"));

    document.body.appendChild(script);
  });
}


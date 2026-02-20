(function () {
  const form = document.querySelector('form[name="contact-wingchun"], form[name="contact"]');
  if (!form) return;
  form.noValidate = true;

  const MESSAGE_MIN_LEN = 10;
  const PHONE_REGEX_NANP = /^(?:1)?[2-9]\d{2}[2-9]\d{6}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const NAME_REGEX = /^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF' -]+$/;

  const fields = Array.from(form.querySelectorAll('input, select, textarea')).filter((el) => {
    const type = (el.type || '').toLowerCase();
    if (type === 'hidden' || type === 'submit' || type === 'reset' || type === 'button') return false;
    if (el.name === 'bot-field') return false;
    return true;
  });
  const fieldSet = new Set(fields);
  let hasSubmitted = false;

  const errorEls = new Map();
  form.querySelectorAll('[data-error-for]').forEach((el) => {
    errorEls.set(el.getAttribute('data-error-for'), el);
  });

  function lang() {
    return (document.documentElement.getAttribute('lang') || 'fr').startsWith('en') ? 'en' : 'fr';
  }

  const MSG = {
    fr: {
      required: 'Champ obligatoire.',
      selectRequired: 'Veuillez choisir une option.',
      minLen: 'Le champ est trop court.',
      maxLen: 'Le champ est trop long.',
      nameInvalid: 'Veuillez entrer un nom valide (lettres, espaces, tirets, apostrophes).',
      nameLen: 'Doit contenir entre 2 et 50 caracteres.',
      emailInvalid: 'Veuillez entrer un courriel valide (doit contenir un @).',
      phoneInvalid: 'Seulement les chiffres sont permis pour le champ telephone.',
      phoneLen: 'Le telephone doit contenir 10 a 15 chiffres.',
      msgLen: 'Le message doit contenir au moins 10 caracteres (max 2000).'
    },
    en: {
      required: 'This field is required.',
      selectRequired: 'Please choose an option.',
      minLen: 'This field is too short.',
      maxLen: 'This field is too long.',
      nameInvalid: 'Please enter a valid name (letters, spaces, hyphens, apostrophes).',
      nameLen: 'Must be between 2 and 50 characters.',
      emailInvalid: 'Please enter a valid email (must contain a @).',
      phoneInvalid: 'Only digits are allowed in the phone field.',
      phoneLen: 'Phone must contain 10-15 digits.',
      msgLen: 'Message must be at least 10 characters (max 2000).'
    }
  };

  function cleanText(s) {
    return (s || '')
      .normalize('NFKC')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function cleanName(s) {
    return cleanText(s)
      .replace(/[^A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF' -]/g, '')
      .replace(/[-' ]{2,}/g, ' ')
      .trim();
  }

  function stripHtml(s) {
    return cleanText((s || '').replace(/<[^>]*>/g, ''));
  }

  function getErrorEl(field) {
    if (!field || !field.id) return null;
    return errorEls.get(field.id) || null;
  }

  function setError(field, message) {
    if (!field) return;
    field.classList.add('invalid');
    const err = getErrorEl(field);
    if (err) err.textContent = message || '';
  }

  function clearError(field) {
    if (!field) return;
    field.classList.remove('invalid');
    const err = getErrorEl(field);
    if (err) err.textContent = '';
  }

  function sanitizeField(field) {
    if (!field) return '';
    const id = field.id || '';
    const tag = field.tagName.toLowerCase();
    const type = (field.type || '').toLowerCase();

    if (tag === 'select') return field.value || '';

    const noHtml = stripHtml(field.value);

    if (id === 'message') {
      field.value = noHtml;
      return field.value;
    }

    if (id === 'prenom' || id === 'nom') {
      field.value = cleanName(noHtml);
      return field.value;
    }

    if (type === 'email') {
      field.value = cleanText(noHtml).toLowerCase();
      return field.value;
    }

    field.value = cleanText(noHtml);
    return field.value;
  }

  function validateTelephone(field, L, value) {
    const required = field.hasAttribute('required');
    const digits = (value || '').replace(/\D/g, '');

    if (!value) {
      if (required) {
        setError(field, MSG[L].required);
        return false;
      }
      clearError(field);
      return true;
    }

    if (!digits) {
      setError(field, MSG[L].phoneInvalid);
      return false;
    }

    if (!PHONE_REGEX_NANP.test(digits)) {
      setError(field, MSG[L].phoneLen);
      return false;
    }

    clearError(field);
    return true;
  }

  function validateRequired(field, L, value) {
    if (!field.hasAttribute('required')) return true;
    if (value) return true;

    const tag = field.tagName.toLowerCase();
    setError(field, tag === 'select' ? MSG[L].selectRequired : MSG[L].required);
    return false;
  }

  function validateLengths(field, L, value) {
    if (!value) return true;

    const minLen = field.minLength;
    const maxLen = field.maxLength;

    if (minLen > -1 && value.length < minLen) {
      setError(field, MSG[L].minLen);
      return false;
    }
    if (maxLen > -1 && value.length > maxLen) {
      setError(field, MSG[L].maxLen);
      return false;
    }
    return true;
  }

  function validateField(field) {
    if (!field) return true;

    const L = lang();
    const value = sanitizeField(field);
    const id = field.id || '';
    const type = (field.type || '').toLowerCase();

    if (id === 'telephone') return validateTelephone(field, L, value);

    if (!validateRequired(field, L, value)) return false;

    if (!value) {
      clearError(field);
      return true;
    }

    if (type === 'email' && !EMAIL_REGEX.test(value)) {
      setError(field, MSG[L].emailInvalid);
      return false;
    }

    if ((id === 'prenom' || id === 'nom') && !NAME_REGEX.test(value)) {
      setError(field, MSG[L].nameInvalid);
      return false;
    }

    if ((id === 'prenom' || id === 'nom') && (value.length < 2 || value.length > 50)) {
      setError(field, MSG[L].nameLen);
      return false;
    }

    if (id === 'message' && value.length < MESSAGE_MIN_LEN) {
      setError(field, MSG[L].msgLen);
      return false;
    }

    if (!validateLengths(field, L, value)) return false;

    clearError(field);
    return true;
  }

  function validateForm() {
    let ok = true;
    fields.forEach((field) => {
      if (!validateField(field)) ok = false;
    });
    return ok;
  }

  form.addEventListener('submit', function (e) {
    hasSubmitted = true;
    if (!validateForm()) e.preventDefault();
  });

  form.addEventListener('input', function (e) {
    const field = e.target;
    if (!field || !fieldSet.has(field)) return;
    validateField(field);

    if (hasSubmitted) {
      validateForm();
    }
  });

  form.addEventListener('change', function (e) {
    const field = e.target;
    if (!field || !fieldSet.has(field)) return;
    validateField(field);

    if (hasSubmitted) {
      validateForm();
    }
  });

  form.addEventListener('focusout', function (e) {
    const field = e.target;
    if (!field || !fieldSet.has(field)) return;
    validateField(field);

    if (hasSubmitted) {
      validateForm();
    }
  });
})();

(function () {
  const form = document.querySelector('form[name="contact"]');
  if (!form) return;

  const fields = {
    prenom: form.querySelector('#prenom'),
    nom: form.querySelector('#nom'),
    telephone: form.querySelector('#telephone'),
    age: form.querySelector('#age'),
    reference: form.querySelector('#reference'),
    message: form.querySelector('#message'),
    email:  form.querySelector('#email'),
    discipline:  form.querySelector('#discipline')
  };

  const errorEls = {
    prenom: form.querySelector('[data-error-for="prenom"]'),
    nom: form.querySelector('[data-error-for="nom"]'),
    telephone: form.querySelector('[data-error-for="telephone"]'),
    age: form.querySelector('[data-error-for="age"]'),
    reference: form.querySelector('[data-error-for="reference"]'),
    message: form.querySelector('[data-error-for="message"]'),
    email: form.querySelector('[data-error-for="email"]'),
    discipline: form.querySelector('[data-error-for="discipline"]')
  };

  function lang() {
    return (document.documentElement.getAttribute('lang') || 'fr').startsWith('en') ? 'en' : 'fr';
  }

  const MSG = {
    fr: {
      required: 'Champ obligatoire.',
      nameInvalid: 'Veuillez entrer un nom valide (lettres, espaces, tirets, apostrophes).',
      emailInvalid: 'Veuillez entrer un courriel valide (doit contenir un @)',
      nameLen: 'Doit contenir entre 2 et 50 caractères.',
      phoneInvalid: 'Seulement les chiffres sont permis pour le champ téléphone.',
      phoneLen: 'Le téléphone doit contenir 10 à 15 chiffres.',
      selectRequired: 'Veuillez choisir une option.',
      msgLen: 'Le message doit contenir au moins 10 caractères (max 2000).'
    },
    en: {
      required: 'This field is required.',
      nameInvalid: 'Please enter a valid name (letters, spaces, hyphens, apostrophes).',
      emailInvalid: 'Please enter a valid email (must contain a @)',
      nameLen: 'Must be between 2 and 50 characters.',
      phoneInvalid: 'Only digits are allowed in the phone field.',
      phoneLen: 'Phone must contain 10–15 digits.',
      selectRequired: 'Please choose an option.',
      msgLen: 'Message must be at least 10 characters (max 2000).'
    }
  };

  // Sanitizers
  function cleanText(s) {
    return (s || '')
      .normalize('NFKC')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function cleanName(s) {
    s = cleanText(s);
    s = s.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ' -]/g, '');
    s = s.replace(/[-' ]{2,}/g, ' ');
    return s.trim();
  }

  function stripHtml(s) {
    return cleanText(s.replace(/<[^>]*>/g, ''));
  }

  function digitsOnlyPhone(s) {
    s = cleanText(s);
    const digits = s.replace(/[^\d]/g, '');
    return { raw: s, digits };
  }

  function setError(key, msg) {
    const el = fields[key];
    const err = errorEls[key];
    if (el) el.classList.add('invalid');
    if (err) err.textContent = msg || '';
  }

  function clearError(key) {
    const el = fields[key];
    const err = errorEls[key];
    if (el) el.classList.remove('invalid');
    if (err) err.textContent = '';
  }

  function validate() {
    const L = lang();
    let ok = true;

    // Discipline (required select)
    if (!fields.discipline.value) { setError('discipline', MSG[L].selectRequired); ok = false; }
    else clearError('discipline');

    // Email (required + regex)
    const email = cleanText(fields.email.value).toLowerCase();
    fields.email.value = email;
    if (!email) { setError('email', MSG[L].required); ok = false; }
    else if (email.length < 6 || email.length > 254) { setError('email', MSG[L].emailInvalid); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setError('email', MSG[L].emailInvalid); ok = false; }
    else clearError('email');

    // Prenom
    const prenom = cleanName(fields.prenom.value);
    fields.prenom.value = prenom;
    if (!prenom) { setError('prenom', MSG[L].required); ok = false; }
    else if (prenom.length < 2 || prenom.length > 50) { setError('prenom', MSG[L].nameLen); ok = false; }
    else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,50}$/.test(prenom)) { setError('prenom', MSG[L].nameInvalid); ok = false; }
    else clearError('prenom');

    // Nom
    const nom = cleanName(fields.nom.value);
    fields.nom.value = nom;
    if (!nom) { setError('nom', MSG[L].required); ok = false; }
    else if (nom.length < 2 || nom.length > 50) { setError('nom', MSG[L].nameLen); ok = false; }
    else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,50}$/.test(nom)) { setError('nom', MSG[L].nameInvalid); ok = false; }
    else clearError('nom');

    
    // Phone (REQUIRED) - show a specific message when letters are entered
    const rawPhone = cleanText(fields.telephone.value);
    const digits = rawPhone.replace(/\D/g, '');

    // 1) empty => required
    if (!rawPhone) {
    setError('telephone', MSG[L].required);
    ok = false;

    // 2) user typed something but no digits at all => "numbers only"
    } else if (!digits) {
    // Use phoneInvalid to say "numbers only" (or create MSG[L].phoneDigitsOnly)
    setError('telephone', MSG[L].phoneInvalid);
    ok = false;

    // 3) validate NANP digits (Canada/US): optional 1 + 10 digits with valid area/exchange
    } else {
    const NA_DIGITS_REGEX = /^(?:1)?[2-9]\d{2}[2-9]\d{6}$/;

    if (!NA_DIGITS_REGEX.test(digits)) {
        // Here you can keep phoneLen or phoneInvalid; I recommend phoneLen for length/rules
        setError('telephone', MSG[L].phoneLen);
        ok = false;
    } else {
        clearError('telephone');
    }
    }




    // Age select required
    if (!fields.age.value) { setError('age', MSG[L].selectRequired); ok = false; }
    else clearError('age');

    // Source select required
    if (!fields.reference.value) { setError('reference', MSG[L].selectRequired); ok = false; }
    else clearError('reference');

    // Message required + sanitize
    const msg = stripHtml(fields.message.value);
    fields.message.value = msg;
    if (!msg) { setError('message', MSG[L].required); ok = false; }
    else if (msg.length < 10 || msg.length > 2000) { setError('message', MSG[L].msgLen); ok = false; }
    else clearError('message');

    return ok;
  }

  // Validate on submit
  form.addEventListener('submit', function (e) {
    if (!validate()) e.preventDefault();
  });

  // Live clear per-field
  form.addEventListener('input', function (e) {
    const id = e.target && e.target.id;
    if (!id || !(id in fields)) return;
    clearError(id);
  });

  // Revalidate on change (selects)
  form.addEventListener('change', function (e) {
    const id = e.target && e.target.id;
    if (!id || !(id in fields)) return;
    validate();
  });

  // Validate on blur (field lost focus)
form.addEventListener('focusout', function (e) {
  const id = e.target && e.target.id;
  if (!id || !(id in fields)) return;
  validate();
});

})();

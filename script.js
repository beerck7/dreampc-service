'use strict';
(() => {
  document.documentElement.classList.remove('no-js');
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const money = (value) => new Intl.NumberFormat('pl-PL').format(value) + ' zł';
  const services = {
    diagnosis: { label: 'Diagnoza usterki', price: '0 zł przy naprawie', note: 'Przy rezygnacji z naprawy diagnoza kosztuje 50 zł.' },
    cleaning: { label: 'Czyszczenie i pasta', price: 'od 100 zł' },
    ssd: { label: 'Wymiana dysku', price: 'od 150 zł' },
    setup: { label: 'Konfiguracja laptopa', price: 'od 120 zł' },
    security: { label: 'Usuwanie wirusów', price: 'od 120 zł' },
    installation: { label: 'Instalacja i konfiguracja', price: 'od 80 zł' },
    build: { label: 'Budowa PC', price: 'Wycena indywidualna' },
  };
  const usages = {
    gaming: ['GRY', 'Pod Twoje ulubione gry.', 'Dobór części zaczniemy od gier, rozdzielczości monitora i oczekiwań wobec płynności.'],
    work: ['PRACA I NAUKA', 'Więcej zrobione. Mniej czekania.', 'Priorytety: komfort pracy, sprawne aplikacje i kultura pracy. Opisz programy, których używasz.'],
    creative: ['GRAFIKA I WIDEO', 'Miejsce na duże pomysły.', 'Montaż, grafika czy 3D? Dobierzemy części pod konkretne narzędzia i rodzaj projektów.'],
  };
  let usage = 'gaming';
  let style = 'Minimalistyczny';
  function selectGroup(selector, target, className = 'selected') {
    $$(selector).forEach(button => {
      const selected = button === target;
      button.classList.toggle(className, selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    selectGroup('[data-filter]', button, 'active');
    $$('.service-card').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; });
  }));
  $$('[data-usage]').forEach(button => button.addEventListener('click', () => {
    usage = button.dataset.usage;
    selectGroup('[data-usage]', button);
    ['#buildCategory', '#buildTitle', '#buildDescription'].forEach((selector, i) => { $(selector).textContent = usages[usage][i]; });
  }));
  $$('[data-style]').forEach(button => button.addEventListener('click', () => {
    style = button.dataset.style;
    selectGroup('[data-style]', button);
  }));
  $('#budget').addEventListener('input', (event) => {
    $('#budgetValue').textContent = $('#summaryBudget').textContent = money(event.target.value);
    event.target.setAttribute('aria-valuetext', money(event.target.value));
    const progress = (event.target.value - event.target.min) / (event.target.max - event.target.min) * 100;
    event.target.style.setProperty('--range-progress', progress + '%');
  });
  $$('[data-preset]').forEach(button => button.addEventListener('click', (event) => {
    event.preventDefault();
    const option = $(`[data-usage="${button.dataset.preset}"]`);
    option.click();
    $('#build').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    option.focus({ preventScroll: true });
  }));
  function getBrief() {
    return `Zastosowanie: ${usages[usage][0]}\nBudżet całkowity: ${money($('#budget').value)}\nWygląd: ${style}\nMonitor i akcesoria w budżecie: ${$('#peripherals').checked ? 'tak' : 'nie'}`;
  }
  const header = $('.site-header');
  const menu = $('.menu-toggle');
  function closeMenu() { header.classList.remove('nav-open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Otwórz menu'); }
  menu.addEventListener('click', () => {
    const open = header.classList.toggle('nav-open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
  });
  $$('#navigation a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('nav-open')) { closeMenu(); menu.focus(); }
  });
  document.addEventListener('pointerdown', event => {
    if (!header.contains(event.target)) closeMenu();
  });
  matchMedia('(min-width: 1200px)').addEventListener('change', closeMenu);
  $('#year').textContent = new Date().getFullYear();

  const dialog = $('#bookingDialog');
  const form = $('#bookingForm');
  const fields = form.elements;
  const steps = $$('[data-step]');
  const fieldErrors = new Map();
  form.querySelectorAll('input[name]:not([type=hidden]):not(.honeypot), textarea').forEach(input => {
    const message = document.createElement('p');
    message.id = 'error-' + input.name;
    message.className = 'field-error';
    message.hidden = true;
    input.closest('label').after(message);
    input.setAttribute('aria-describedby', message.id);
    fieldErrors.set(input, message);
  });
  function clearError(input) {
    input.removeAttribute('aria-invalid');
    const message = fieldErrors.get(input);
    if (message) message.hidden = true;
  }
  function syncContactPreference() {
    const required = fields.contact.value === 'E-mail';
    fields.email.required = required;
    $('#emailOptional').textContent = required ? 'wymagany przy kontakcie e-mail' : 'opcjonalnie';
  }
  fields.contact.addEventListener('change', syncContactPreference);
  syncContactPreference();
  let step = 0;
  let pending = false;
  let submitted = false;
  let ticket = null;
  let receipt = '';
  let buildBrief = '';
  function showDialog(element) { closeMenu(); element.showModal(); document.body.classList.add('modal-open'); }
  $$('dialog').forEach(element => {
    element.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open'); });
    element.addEventListener('cancel', event => { if (pending) event.preventDefault(); });
    element.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => { if (!pending) element.close(); }));
  });
  function syncBrief() {
    const isBuild = fields.service.value === 'build';
    $('#buildBrief').hidden = !isBuild;
    if (isBuild) {
      if (!buildBrief) buildBrief = getBrief();
      $('#buildBrief').textContent = buildBrief;
    }
  }
  fields.service.addEventListener('change', syncBrief);
  function setStep(next, focus = true) {
    window.dreamSelects?.close();
    step = next;
    steps.forEach((fieldset, index) => {
      fieldset.hidden = index !== step;
      fieldset.disabled = index !== step;
    });
    $$('.dialog-progress span').forEach((item, index) => {
      item.classList.toggle('current', index <= step);
      if (index === step) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
    });
    $('#bookingTitle').textContent = ['Co potrzebuje uwagi?', 'Jak się z Tobą skontaktować?', 'Wszystko się zgadza?'][step];
    $('#previousStep').hidden = step === 0;
    $('#nextStep').hidden = step === 2;
    $('#sendRequest').hidden = step !== 2;
    $('#formStatus').textContent = '';
    if (step === 2) renderSummary();
    dialog.querySelector('.dialog-shell').scrollTop = 0;
    if (focus) {
      const first = steps[step].querySelector('input,select,textarea');
      if (first?.tagName === 'SELECT') window.dreamSelects?.focus(first);
      else first?.focus({ preventScroll: true });
    }
  }
  function openBooking(service, fromBuilder = false) {
    dialog.setAttribute('aria-labelledby', 'bookingTitle');
    if (submitted) { form.reset(); submitted = false; ticket = null; buildBrief = ''; }
    form.hidden = false;
    $('#successPanel').hidden = true;
    $('.dialog-progress').hidden = false;
    $('#bookingTitle').hidden = false;
    fields.service.value = service;
    if (fromBuilder) {
      buildBrief = getBrief();
      fields.device.value = 'Nowy zestaw PC';
      fields.handover.value = 'Budowa PC — do ustalenia';
    }
    syncBrief();
    syncContactPreference();
    window.dreamSelects?.refresh();
    setStep(0, false);
    showDialog(dialog);
  }
  $$('[data-book]').forEach(button => button.addEventListener('click', () => openBooking(button.dataset.book)));
  $('#buildRequest').addEventListener('click', () => openBooking('build', true));
  function validate(index) {
    let firstInvalid = null;
    for (const input of steps[index].querySelectorAll('input,select,textarea')) {
      input.setCustomValidity('');
      clearError(input);
      if (input.name === 'phone') {
        const digits = input.value.replace(/\D/g, '');
        if (!/^\+?[\d\s()-]+$/.test(input.value.trim()) || digits.length < 9 || digits.length > 15) input.setCustomValidity('Podaj numer telefonu zawierający od 9 do 15 cyfr.');
      }
      if (input.name === 'problem' && input.value.trim().length < 10) input.setCustomValidity('Opisz problem lub potrzeby w co najmniej 10 znakach.');
      if (input.name === 'name' && !input.value.trim()) input.setCustomValidity('Podaj imię.');
      if (input.name === 'email' && fields.contact.value === 'E-mail' && !input.value.trim()) input.setCustomValidity('Podaj e-mail, jeśli wybierasz kontakt e-mailowy.');
      if (input.name === 'email' && input.validity.typeMismatch) input.setCustomValidity('Podaj poprawny adres e-mail, np. jan@example.com.');
      if (input.name === 'acknowledgement' && !input.checked) input.setCustomValidity('Potwierdź zapoznanie się z informacją o prywatności i warunkami zgłoszenia.');
      if (!input.checkValidity()) {
        firstInvalid ||= input;
        if (input.tagName === 'SELECT') window.dreamSelects?.invalid(input, false);
        else {
          input.setAttribute('aria-invalid', 'true');
          const message = fieldErrors.get(input);
          if (message) { message.textContent = input.validationMessage; message.hidden = false; }
        }
      }
    }
    if (firstInvalid) {
      $('#formStatus').textContent = 'Popraw zaznaczone pola, aby przejść dalej.';
      if (firstInvalid.tagName === 'SELECT') window.dreamSelects?.focus(firstInvalid);
      else firstInvalid.focus();
      return false;
    }
    return true;
  }
  form.addEventListener('input', event => { event.target.setCustomValidity?.(''); clearError(event.target); if (!pending) ticket = null; });
  form.addEventListener('change', () => { fields.email.setCustomValidity(''); clearError(fields.email); if (!pending) ticket = null; });
  function summary() {
    const value = name => fields[name].value.trim();
    return [
      `Usługa: ${services[value('service')].label}`,
      `Sprzęt: ${value('device')}${value('model') ? ' / ' + value('model') : ''}`,
      `Opis: ${value('problem')}`,
      ...(value('service') === 'build' ? ['', buildBrief] : []),
      '', `Kontakt: ${value('name')} / ${value('phone')}`,
      ...(value('email') ? [`E-mail: ${value('email')}`] : []),
      `Preferowany kontakt: ${value('contact')}`,
      `Przekazanie: ${value('handover')}`,
      ...(value('area') ? [`Miejscowość / dzielnica: ${value('area')}`] : []),
      ...(value('time') ? [`Termin kontaktu: ${value('time')}`] : []),
    ].join('\n');
  }
  function renderSummary() {
    const service = services[fields.service.value];
    $('#requestSummary').textContent = summary();
    $('#estimateValue').textContent = service.price;
    const transport = fields.handover.value === 'Odbiór i dostawa w Białymstoku' ? ' Odbiór i dostawa w mieście: dodatkowo 30 zł.' : ' Transport do uzgodnienia.';
    $('#estimateNote').textContent = (service.note || 'Ostateczny koszt wymaga wyceny. Części i licencje osobno.') + transport;
  }
  $('#nextStep').addEventListener('click', () => { if (validate(step)) setStep(step + 1); });
  $('#previousStep').addEventListener('click', () => { if (!pending) setStep(Math.max(0, step - 1)); });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending) return;
    if (step < 2) { if (validate(step)) setStep(step + 1); return; }
    if (!validate(2)) return;
    if (fields._gotcha.value) { $('#formStatus').textContent = 'Nie udało się przygotować podsumowania.'; return; }
    pending = true;
    form.setAttribute('aria-busy', 'true');
    steps[2].disabled = true;
    const button = $('#sendRequest');
    button.disabled = true;
    $('#previousStep').disabled = true;
    dialog.querySelectorAll('[data-close]').forEach(b => { b.disabled = true; });
    button.textContent = 'Przygotowywanie…';
    $('#formStatus').textContent = 'Przygotowuję lokalne podsumowanie demo…';
    try {
      // A short demo delay makes the processing state visible. No network request is made.
      await new Promise(resolve => setTimeout(resolve, 350));
      ticket ||= 'DEMO-' + new Date().toISOString().slice(0, 10).replaceAll('-', '') + '-' + [...crypto.getRandomValues(new Uint8Array(6))].map(n => n.toString(16).padStart(2, '0')).join('').toUpperCase();
      receipt = `DreamPC — podsumowanie demonstracyjne ${ticket}\n${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}\n\n${summary()}\n\nTryb demo: dane nie zostały wysłane. To nie jest zgłoszenie do naprawy ani zamówienie.\n`;
      submitted = true;
      form.hidden = true;
      $('.dialog-progress').hidden = true;
      $('#bookingTitle').hidden = true;
      dialog.setAttribute('aria-labelledby', 'successTitle');
      $('#successTicket').textContent = ticket;
      $('#successPanel').hidden = false;
      $('#ticketLookup').value = ticket;
      dialog.querySelector('.dialog-shell').scrollTop = 0;
      $('#downloadRequest').focus({ preventScroll: true });
    } catch {
      $('#formStatus').textContent = 'Nie udało się przygotować podsumowania. Spróbuj ponownie. Dane pozostają w formularzu.';
    } finally {
      pending = false;
      form.removeAttribute('aria-busy');
      steps[2].disabled = false;
      button.disabled = false;
      $('#previousStep').disabled = false;
      dialog.querySelectorAll('[data-close]').forEach(b => { b.disabled = false; });
      button.textContent = 'Przygotuj podsumowanie ↓';
    }
  });
  $('#downloadRequest').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob(['\uFEFF' + receipt], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `${ticket}.txt`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $('#contactTicket').addEventListener('click', () => showDialog($('#ticketDialog')));
  $('#copyTicket').addEventListener('click', async () => {
    const ref = $('#ticketLookup').value.trim();
    if (!ref) { $('#copyStatus').textContent = 'Wpisz numer zgłoszenia.'; $('#ticketLookup').focus(); return; }
    const text = ref;
    try { await navigator.clipboard.writeText(text); $('#copyStatus').textContent = 'Skopiowano numer demo.'; }
    catch { $('#copyStatus').textContent = text; }
  });
  if (location.hash === '#zgloszenie') openBooking('diagnosis');
})();

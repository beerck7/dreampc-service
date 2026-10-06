'use strict';
// Walidacja i podsumowanie korzystają z wartości natywnych pól select.
(() => {
  const paths = {
    diagnosis: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M10 7v6M7 10h6"/>',
    cleaning: '<path d="M4 7c3-5 5 5 8 0s5 5 8 0M4 12c3-5 5 5 8 0s5 5 8 0M4 17c3-5 5 5 8 0s5 5 8 0"/>',
    ssd: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 14h18M7 17h2M16 17h1"/>',
    setup: '<path d="M4 16V5h16v11M2 19h20M8 19l1-3h6l1 3"/>',
    security: '<path d="m12 3 8 3v5c0 5-8 10-8 10S4 16 4 11V6l8-3Z"/><path d="m8 11 3 3 5-5"/>',
    installation: '<path d="m14 6 4-3 3 3-3 4-3-1-8 11-3-3 10-8-1-3Z"/>',
    build: '<rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="8" r="3"/><circle cx="12" cy="16" r="3"/>',
    contact: '<path d="M5 3h4l2 5-3 2c1 3 3 5 6 6l2-3 5 2v4c0 5-18-1-18-13 0-2 1-3 2-3Z"/>',
    transport: '<path d="M3 6h12v12H3zM15 10h4l3 4v4h-7"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
  };
  const descriptions = {
    diagnosis: ['Sprawdźmy, co nie działa', '0 zł*'], cleaning: ['Chłodzenie, kurz, temperatury', 'od 100 zł'],
    ssd: ['Nowy dysk i migracja danych', 'od 150 zł'], setup: ['System gotowy do pracy', 'od 120 zł'],
    security: ['Porządek i zabezpieczenia', 'od 120 zł'], installation: ['Programy, drukarki i sterowniki', 'od 80 zł'],
    build: ['Zestaw dopasowany do Ciebie', 'Wycena'],
  };
  const icons = { service: 'diagnosis', device: 'setup', contact: 'contact', handover: 'transport' };
  const widgets = new Map();
  let opened = null;
  const icon = (key) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[key] || paths.setup}</svg>`;
  document.querySelectorAll('#bookingForm select').forEach((select, index) => {
    const label = select.closest('label');
    const caption = [...label.childNodes].filter(node => node !== select).map(node => node.textContent).join('').trim();
    const field = document.createElement('div');
    field.className = 'select-field';
    const title = document.createElement('span');
    title.className = 'control-label'; title.id = `choice-label-${index}`; title.textContent = caption;
    const trigger = document.createElement('button');
    trigger.type = 'button'; trigger.className = 'select-trigger'; trigger.dataset.select = select.name;
    trigger.id = `choice-${select.name}`;
    trigger.setAttribute('role', 'combobox'); trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false'); trigger.setAttribute('aria-labelledby', `${title.id} choice-value-${index}`);
    trigger.setAttribute('aria-controls', `choice-list-${index}`);
    trigger.setAttribute('aria-required', String(select.required));
    trigger.innerHTML = `<span class="select-symbol">${icon(icons[select.name])}</span><span class="select-copy"><span id="choice-value-${index}" class="select-value"></span><span class="select-hint"></span></span><svg class="select-chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg>`;
    const list = document.createElement('div');
    list.id = `choice-list-${index}`; list.className = 'select-menu'; list.hidden = true;
    list.setAttribute('role', 'listbox'); list.setAttribute('aria-labelledby', title.id);
    const error = document.createElement('p'); error.className = 'select-error'; error.id = `choice-error-${index}`; error.hidden = true;
    trigger.setAttribute('aria-describedby', error.id);
    const items = [...select.options].filter(option => option.value).map((option, optionIndex) => {
      const item = document.createElement('div'); item.className = 'select-option';
      item.setAttribute('role', 'option'); item.id = `choice-option-${index}-${optionIndex}`; item.dataset.value = option.value;
      const details = select.name === 'service' ? descriptions[option.value] : null;
      item.innerHTML = `<span class="option-icon">${icon(select.name === 'service' ? option.value : icons[select.name])}</span><span class="option-copy"><span class="option-name"></span>${details ? '<small></small>' : ''}</span>${details ? '<span class="option-price"></span>' : ''}<span class="option-check" aria-hidden="true">✓</span>`;
      item.querySelector('.option-name').textContent = option.text;
      if (details) { item.querySelector('small').textContent = details[0]; item.querySelector('.option-price').textContent = details[1]; }
      list.append(item);
      item.addEventListener('mousedown', event => event.preventDefault());
      item.addEventListener('click', () => choose(optionIndex));
      return item;
    });
    label.before(field);
    field.append(title, select, trigger, list, error);
    label.remove();
    select.hidden = true; select.tabIndex = -1; select.setAttribute('aria-hidden', 'true'); select.setAttribute('aria-label', caption);
    let active = 0;
    let search = '';
    let searchTimer;
    function markActive(next) {
      active = Math.max(0, Math.min(next, items.length - 1));
      items.forEach((item, i) => item.classList.toggle('focused', i === active));
      trigger.setAttribute('aria-activedescendant', items[active].id);
      const item = items[active];
      const top = item.offsetTop;
      const bottom = top + item.offsetHeight;
      if (top < list.scrollTop) list.scrollTop = top;
      else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
    }
    function refresh() {
      const option = select.selectedOptions[0];
      trigger.querySelector('.select-value').textContent = option?.text || 'Wybierz';
      const details = select.name === 'service' ? descriptions[select.value] : null;
      const hint = trigger.querySelector('.select-hint');
      hint.textContent = details ? details[0] : ''; hint.hidden = !details;
      trigger.querySelector('.select-symbol').innerHTML = icon(select.name === 'service' ? select.value : icons[select.name]);
      trigger.classList.toggle('has-value', Boolean(select.value));
      items.forEach(item => { const selected = item.dataset.value === select.value; item.setAttribute('aria-selected', String(selected)); });
      clearError();
    }
    function clearError() { trigger.removeAttribute('aria-invalid'); error.hidden = true; }
    function close(restoreFocus = false) {
      list.hidden = true; trigger.setAttribute('aria-expanded', 'false'); trigger.removeAttribute('aria-activedescendant');
      field.classList.remove('is-open');
      if (opened === widget) opened = null;
      if (restoreFocus) trigger.focus({ preventScroll: true });
    }
    function open() {
      if (trigger.matches(':disabled')) return;
      opened?.close(); opened = widget;
      list.hidden = false; field.classList.add('is-open'); trigger.setAttribute('aria-expanded', 'true');
      markActive(Math.max(0, items.findIndex(item => item.dataset.value === select.value)));
    }
    function choose(i) {
      select.value = items[i].dataset.value;
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
      refresh(); close(true);
    }
    const widget = { refresh, close, trigger, invalid(focus = true) {
      trigger.setAttribute('aria-invalid', 'true'); error.textContent = 'Wybierz jedną z opcji.'; error.hidden = false;
      if (focus) trigger.focus();
    } };
    widgets.set(select, widget);
    trigger.addEventListener('click', () => list.hidden ? open() : close());
    trigger.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !list.hidden) { event.preventDefault(); event.stopPropagation(); close(true); return; }
      if (event.key === 'Tab') { close(); return; }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        if (list.hidden) { open(); if (event.key === 'End') markActive(items.length - 1); return; }
        markActive(event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : active + (event.key === 'ArrowDown' ? 1 : -1));
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault(); list.hidden ? open() : choose(active);
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault(); clearTimeout(searchTimer); search += event.key.toLocaleLowerCase('pl');
        if (list.hidden) open();
        const found = items.findIndex(item => item.querySelector('.option-name').textContent.toLocaleLowerCase('pl').startsWith(search));
        if (found >= 0) markActive(found);
        searchTimer = setTimeout(() => { search = ''; }, 700);
      }
    });
    select.addEventListener('change', refresh);
    refresh();
  });
  document.addEventListener('pointerdown', event => { if (opened && !opened.trigger.closest('.select-field').contains(event.target)) opened.close(); });
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('close', () => opened?.close()));
  window.dreamSelects = {
    refresh: () => widgets.forEach(widget => widget.refresh()),
    close: () => opened?.close(),
    invalid: (select, focus) => widgets.get(select)?.invalid(focus),
    focus: select => widgets.get(select)?.trigger.focus({ preventScroll: true }),
  };
})();

import { topics, marketplaces, products } from './mocks/data.ts';
import type { Marketplace, TopicStatus } from './domain/types.ts';
import { makeCsv } from './domain/analytics.ts';
import { state, allReviews, selectedReviews, save, getWork, updateWork, unreadCount, resetDemo } from './state/store.ts';
import { button, esc, icon } from './components/ui.ts';
import { themesPage } from './pages/topics.ts';
import { topicPage, reviewCard } from './pages/topic.ts';
import { overviewPage, reviewsPage, productsPage, connectionsPage, alertsPage, reportsPage, settingsPage } from './pages/other.ts';

const root = document.getElementById('root')!;
const nav = [['overview', 'Обзор'], ['topics', 'Темы жалоб'], ['reviews', 'Все отзывы'], ['products', 'Товары'], ['alerts', 'Оповещения'], ['reports', 'Отчёты'], ['connections', 'Площадки'], ['settings', 'Настройки']];
let toastTimer: ReturnType<typeof setTimeout>;
let priorFocus: { action: string; id: string } | null = null;

function navigate(route: string) { state.mobileMenu = false; state.modal = null; if (location.hash.slice(1) === route) { state.route = route; render(); } else location.hash = route; }
function notify(message: string) {
  state.toast = message;
  const element = document.getElementById('toast');
  if (element) { element.innerHTML = `<span>${icon('check', 17)}</span>${esc(message)}`; element.classList.add('visible'); }
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { state.toast = ''; document.getElementById('toast')?.classList.remove('visible'); }, 5000);
}
function openModal(type: string, id?: string) { const el = document.activeElement as HTMLElement; priorFocus = el.dataset.action ? { action: el.dataset.action, id: el.dataset.id || '' } : null; state.modal = { type, id }; render(); document.querySelector<HTMLElement>('.modal input:not([readonly]), .modal select, .modal .modal-close')?.focus(); }
function closeModal() { state.modal = null; render(); if (priorFocus) root.querySelector<HTMLElement>(`[data-action="${priorFocus.action}"]${priorFocus.id ? `[data-id="${priorFocus.id}"]` : ''}`)?.focus({ preventScroll: true }); }

function sidebar(): string {
  const active = state.route.split('/')[0];
  return `<aside class="sidebar ${state.mobileMenu ? 'mobile-open' : ''}"><a href="#topics" class="logo"><span class="logo-mark">${icon('activity', 22)}</span>Сигнал<span class="beta-label">BETA</span></a><button class="workspace" data-action="workspace"><span class="brand-avatar">ХХ</span><span><strong>${esc(state.saved.settings.brand)}</strong><small>${state.saved.connections.length} площадки · демоданные</small></span>${icon('chevron', 15)}</button><div class="nav-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div><nav aria-label="Основная навигация">${nav.map(([route, label], i) => `${i === 6 ? '<div class="nav-divider"></div>' : ''}<a class="nav-item ${active === route ? 'active' : ''}" href="#${route}" ${active === route ? 'aria-current="page"' : ''}>${icon(route, 19)}<span>${label}</span>${route === 'topics' ? '<b class="nav-count">7</b>' : route === 'alerts' && unreadCount() ? `<b class="nav-count alert-count">${unreadCount()}</b>` : ''}</a>`).join('')}</nav><div class="sidebar-bottom"><div class="sidebar-sync"><span class="sync-symbol">${icon('shield', 18)}</span><div><strong>Всё начинается с отзыва</strong><p>Каждый вывод — с источником.<br>Каждая проблема — в контексте.</p></div><span class="sync-status"><i></i>Демоданные загружены</span></div><button class="help-link" data-action="help">${icon('help', 17)}Помощь и обратная связь</button><div class="user-block"><span class="user-avatar">АК</span><div><strong>Анна Королёва</strong><small>Менеджер по ассортименту</small></div><button class="icon-button" aria-label="Настройки профиля" data-action="navigate" data-route="settings">${icon('settings', 17)}</button></div></div></aside>`;
}

function modal(): string {
  if (!state.modal) return '';
  const { type, id = '' } = state.modal;
  let title = '', content = '';
  if (type === 'connection') {
    const m = id as Marketplace, connected = state.saved.connections.includes(m);
    title = `${marketplaces[m].name} · подключение`;
    content = `<div class="modal-info">${icon('shield', 20)}<p>Это тестовая форма. Используются только встроенные демо-ключи, без запросов к маркетплейсу.</p></div><form data-form="connect" data-id="${m}">${m === 'ozon' ? '<label class="form-field"><span>Client-Id</span><input value="demo-client-123" readonly /></label>' : ''}<label class="form-field"><span>Тестовый API-ключ</span><input type="text" value="demo-${m}-token" readonly /><small>Настоящий ключ в прототипе не нужен.</small></label><label class="demo-permission">${icon('check', 16)}Чтение отзывов и оценок</label><div class="form-actions">${connected ? button('Отключить демо', 'disconnect', '', 'danger-text', `data-id="${m}"`) : ''}<button type="submit" class="button primary">${connected ? 'Проверить демоподключение' : 'Подключить демоданные'}</button></div></form>`;
  } else if (type === 'task') {
    const t = topics.find(t => t.id === id)!, w = getWork(id); title = 'Создать задачу по теме';
    content = `<form data-form="task" data-id="${id}"><label class="form-field"><span>Тема</span><input value="${esc(t.title)}" readonly /></label><label class="form-field"><span>Что нужно сделать</span><textarea name="taskText" required maxlength="1200" rows="3" placeholder="Например: проверить образцы партии и уплотнитель крышки"></textarea></label><label class="form-field"><span>Ответственный</span><select name="assignee"><option ${w.assignee.includes('Олег') ? 'selected' : ''}>Олег П., контроль качества</option><option ${w.assignee.includes('Анна') ? 'selected' : ''}>Анна Королёва</option></select></label><label class="form-field"><span>Срок</span><input type="date" name="deadline" value="${w.deadline}" required /></label><p class="subtle">Задача сохранится в этом браузере в блоке «Работа с темой».</p><div class="form-actions">${button('Отмена', 'close-modal')}<button class="button primary" type="submit">Создать задачу</button></div></form>`;
  } else if (type === 'source') {
    const review = allReviews().find(r => r.id === id); title = 'Исходный отзыв';
    content = review ? `<div class="modal-info"><p>Демонстрационный отзыв. Он не связан с реальной карточкой на маркетплейсе.</p></div>${reviewCard(review)}<div class="form-actions">${button('Понятно', 'close-modal', '', 'primary')}</div>` : '<p>Отзыв не найден.</p>';
  } else {
    title = type === 'workspace' ? 'Рабочее пространство' : 'Знакомьтесь, Сигнал';
    content = `<div class="help-hero"><span class="logo-mark">${icon('activity', 26)}</span><h3>Из отдельных отзывов —<br>в понятную картину.</h3></div><p>Прототип аналитики для продавцов на Wildberries, Ozon и Яндекс Маркете, созданный по вашему дизайн-проекту.</p><ul class="help-list"><li>Откройте тему и проверьте вывод по исходным отзывам.</li><li>Исключите ошибочное совпадение или создайте локальную задачу.</li><li>Используйте фильтры и выгрузите выбранные данные в CSV.</li></ul><div class="modal-info"><p>Все цифры, отзывы и товары вымышлены. Срез данных — 26 октября 2026. Подключения и оповещения имитируются; данные не отправляются наружу.</p></div><div class="form-actions">${button('К темам жалоб', 'help-topics', '', 'primary')}</div>`;
  }
  return `<div class="modal-backdrop" data-action="backdrop"><div class="modal ${type === 'source' ? 'wide-modal' : ''}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-heading"><h2 id="modal-title">${title}</h2><button class="icon-button modal-close" aria-label="Закрыть окно" data-action="close-modal">${icon('close', 20)}</button></div>${content}</div></div>`;
}

function render() {
  const focused = document.activeElement as HTMLInputElement | null;
  const focusName = focused?.getAttribute('name');
  const focusAction = focused?.dataset.action;
  const focusId = focused?.dataset.id;
  const selection = focused?.tagName === 'INPUT' && focused.type === 'text' ? [focused.selectionStart, focused.selectionEnd] : null;
  const route = state.route.split('/')[0];
  const pages: Record<string, () => string> = { topics: themesPage, overview: overviewPage, reviews: reviewsPage, products: productsPage, connections: connectionsPage, alerts: alertsPage, reports: reportsPage, settings: settingsPage };
  const body = route === 'topics' && state.route.includes('/') ? topicPage(state.route.split('/')[1]) : (pages[route] ?? themesPage)();
  root.innerHTML = `<a class="skip-link" href="#main-content">К содержимому</a>${sidebar()}${state.mobileMenu ? '<button class="mobile-scrim" data-action="menu" aria-label="Закрыть меню"></button>' : ''}<div class="app-content"><div class="topbar"><div class="topbar-path"><button class="icon-button menu-button" data-action="menu" aria-label="Открыть меню">${icon('menu', 21)}</button><span>${esc(state.saved.settings.brand)}</span>${icon('right', 13)}<strong>${nav.find(([key]) => key === route)?.[1] ?? 'Темы жалоб'}</strong></div><div class="topbar-right"><span class="demo-chip"><i></i>Деморежим</span><span class="last-update">Срез: 26 октября 2026</span><span class="topbar-divider"></span><button class="icon-button notification-button" data-action="navigate" data-route="alerts" aria-label="Оповещения: ${unreadCount()} непрочитанных">${icon('alerts', 20)}${unreadCount() ? '<i></i>' : ''}</button><span class="top-avatar">АК</span></div></div><main id="main-content" class="main-content" tabindex="-1">${body}</main><footer class="app-footer"><span>Сигнал <i>·</i> Слышать покупателей. Видеть причины.</span><span>Прототип · v0.1</span></footer></div>${modal()}<div id="toast" class="toast ${state.toast ? 'visible' : ''}" role="status" aria-live="polite">${state.toast ? `<span>${icon('check', 17)}</span>${esc(state.toast)}` : ''}</div>`;
  document.body.classList.toggle('modal-open', !!state.modal);
  if (focusName) {
    const next = root.querySelector<HTMLInputElement>(`[name="${focusName}"]`); next?.focus({ preventScroll: true });
    if (selection && next?.type === 'text') next.setSelectionRange(selection[0], selection[1]);
  } else if (focusAction && !state.modal) {
    const next = root.querySelector<HTMLElement>(`[data-action="${focusAction}"]${focusId ? `[data-id="${focusId}"]` : ''}`) ?? document.getElementById('main-content');
    next?.focus({ preventScroll: true });
  }
}

function download(content: string, name: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportData(reviews = false) {
  let rs = state.route.startsWith('reports') ? allReviews().filter(r => Date.parse(r.publishedAt) >= Date.parse('2026-10-20T00:00:00+03:00')) : selectedReviews();
  if (reviews) {
    rs = rs.filter(r => (state.reviewRating === 'all' || (state.reviewRating === 'negative' ? r.rating <= 3 : r.rating >= 4)) && (state.reviewTopic === 'all' || (state.reviewTopic === 'none' ? !r.topicId && r.rating <= 3 : r.topicId === state.reviewTopic)) && `${r.text} ${products.find(p => p.id === r.productId)?.name} ${r.author}`.toLocaleLowerCase('ru').includes(state.reviewSearch.toLocaleLowerCase('ru')));
    download(makeCsv(['ID', 'Площадка', 'Товар', 'Оценка', 'Текст', 'Дата', 'Тема'], rs.map(r => [r.id, marketplaces[r.marketplace].name, products.find(p => p.id === r.productId)?.name, r.rating, r.text, r.publishedAt, topics.find(t => t.id === r.topicId)?.title || ''])), 'signal-reviews-demo.csv');
  } else {
    const shown = topics.filter(t => rs.some(r => r.topicId === t.id) && (state.route !== 'topics' || ((state.cause === 'Все' || t.cause === state.cause) && `${t.title} ${t.phrases.join(' ')}`.toLocaleLowerCase('ru').includes(state.topicSearch.toLocaleLowerCase('ru')))));
    download(makeCsv(['Тема', 'Причина', 'Упоминания', 'Приоритет', 'Статус'], shown.map(t => [t.title, t.cause, rs.filter(r => r.topicId === t.id).length, t.priority, getWork(t.id).status])), 'signal-topics-demo.csv');
  }
  notify('CSV с выбранными демоданными скачан.');
}

root.addEventListener('click', async event => {
  if ((event.target as Element).closest('.skip-link')) { event.preventDefault(); document.getElementById('main-content')?.focus(); return; }
  const target = (event.target as Element).closest<HTMLElement>('[data-action]'); if (!target) return;
  const { action, id = '', value = '', route = '' } = target.dataset;
  if (action === 'backdrop' && event.target !== target) return;
  if (action === 'navigate') navigate(route);
  else if (action === 'topic') { state.topicMarket = 'all'; state.reviewLimit = 4; navigate(`topics/${id}`); }
  else if (action === 'cause') { state.cause = value; render(); }
  else if (action === 'menu') { state.mobileMenu = !state.mobileMenu; render(); }
  else if (action === 'help' || action === 'workspace') openModal(action);
  else if (action === 'help-topics') { state.modal = null; navigate('topics'); }
  else if (action === 'close-modal' || action === 'backdrop') closeModal();
  else if (action === 'connection' || action === 'task' || action === 'source') openModal(action, id);
  else if (action === 'disconnect') { state.saved.connections = state.saved.connections.filter(m => m !== id); save(); closeModal(); notify('Демоподключение отключено. Загруженные отзывы сохранены.'); }
  else if (action === 'export-topics') exportData(state.route === 'reviews');
  else if (action === 'export-reviews') exportData(true);
  else if (action === 'topic-market') { state.topicMarket = value; state.reviewLimit = 4; render(); }
  else if (action === 'more-reviews') { state.reviewLimit += 12; render(); }
  else if (action === 'exclude') { state.saved.excluded = [...new Set([...state.saved.excluded, id])]; save(); render(); notify('Отзыв исключён из темы. Восстановить группировку можно в настройках.'); }
  else if (action === 'ungrouped') { state.reviewRating = 'negative'; state.reviewTopic = 'none'; state.reviewPage = 1; navigate('reviews'); }
  else if (action === 'product-reviews') { state.filters.productId = id; state.reviewPage = 1; state.reviewSearch = ''; state.reviewTopic = 'all'; state.reviewRating = 'all'; navigate('reviews'); }
  else if (action === 'review-prev' || action === 'review-next') { state.reviewPage += action === 'review-next' ? 1 : -1; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  else if (action === 'alert-tab') { state.alertTab = value; render(); }
  else if (action === 'read-all') { state.saved.read = ['1', '2', '3', '4']; save(); render(); notify('Все оповещения отмечены прочитанными.'); }
  else if (action === 'alert-open') { state.saved.read = [...new Set([...state.saved.read, id])]; save(); navigate(`topics/${target.dataset.topic}`); }
  else if (action === 'toggle') { const key = target.dataset.key as 'growth' | 'newTopic' | 'weekly'; state.saved.settings[key] = !state.saved.settings[key]; save(); target.classList.toggle('on', state.saved.settings[key]); target.setAttribute('aria-checked', String(state.saved.settings[key])); target.innerHTML = `<span>${state.saved.settings[key] ? icon('check', 10) : ''}</span>`; notify('Правило оповещения сохранено локально.'); }
  else if (action === 'reset-demo') { resetDemo(); render(); notify('Начальные демоданные восстановлены.'); }
  else if (action === 'print') window.print();
  else if (action === 'share') {
    try { await navigator.clipboard.writeText(location.href); notify('Локальная ссылка на тему скопирована.'); }
    catch { openModal('help'); notify('Скопируйте ссылку на тему из адресной строки.'); }
  }
});

root.addEventListener('input', event => {
  const el = event.target as HTMLInputElement;
  if (el.name === 'topicSearch' || el.name === 'reviewSearch' || el.name === 'productSearch') { state[el.name] = el.value; state.reviewPage = 1; render(); }
});
root.addEventListener('change', event => {
  const el = event.target as HTMLInputElement;
  if (el.name === 'days') state.filters.days = Number(el.value);
  else if (el.name === 'marketplace') state.filters.marketplace = el.value as Marketplace | 'all';
  else if (el.name === 'productId') state.filters.productId = el.value;
  else if (el.name === 'reviewRating' || el.name === 'reviewTopic' || el.name === 'sort') state[el.name] = el.value;
  else if (el.name === 'topicStatus') updateWork(state.route.split('/')[1], { status: el.value as TopicStatus });
  else if (el.name === 'topicAssignee') updateWork(state.route.split('/')[1], { assignee: el.value });
  else if (el.name === 'topicDeadline') updateWork(state.route.split('/')[1], { deadline: el.value });
  else return;
  state.reviewPage = 1; render();
  if (el.name.startsWith('topic')) notify('Изменения темы сохранены локально.');
});
root.addEventListener('submit', event => {
  const form = event.target as HTMLFormElement; if (!form.dataset.form) return;
  event.preventDefault(); if (!form.reportValidity()) return;
  const data = new FormData(form), id = form.dataset.id || '';
  if (form.dataset.form === 'connect') { state.saved.connections = [...new Set([...state.saved.connections, id as Marketplace])]; save(); closeModal(); notify('Демоподключение готово. Реальный API не вызывается.'); }
  else if (form.dataset.form === 'note' || form.dataset.form === 'task') {
    const text = String(data.get(form.dataset.form === 'note' ? 'note' : 'taskText') || '').trim(); if (!text) return;
    updateWork(id, { notes: [...getWork(id).notes, { text, createdAt: new Date().toISOString() }], ...(form.dataset.form === 'task' ? { status: 'В работе', assignee: String(data.get('assignee')), deadline: String(data.get('deadline')) } : {}) });
    state.modal = null; render(); notify(form.dataset.form === 'task' ? 'Задача создана локально и добавлена к теме.' : 'Комментарий сохранён.');
  } else if (form.dataset.form === 'settings') {
    state.saved.settings = { ...state.saved.settings, brand: String(data.get('brand')).trim() || 'Хюгге Хоум', email: String(data.get('email')).trim(), threshold: Math.max(2, Math.min(100, Number(data.get('threshold')) || 5)) }; save(); render(); notify('Настройки сохранены в этом браузере.');
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { if (state.modal) closeModal(); else if (state.mobileMenu) { state.mobileMenu = false; render(); } }
  if (event.key === 'Tab' && state.modal) {
    const els = [...root.querySelectorAll<HTMLElement>('.modal button:not([disabled]), .modal input:not([readonly]), .modal select, .modal textarea, .modal a[href]')];
    const first = els[0], last = els.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
});
window.addEventListener('hashchange', () => { state.route = location.hash.slice(1) || 'topics'; state.modal = null; state.mobileMenu = false; render(); window.scrollTo(0, 0); });
render();

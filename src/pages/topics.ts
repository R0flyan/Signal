import { topics, products, marketplaces, DEMO_NOW } from '../mocks/data.ts';
import type { Marketplace, Review } from '../domain/types.ts';
import { summarize, weeklyCounts } from '../domain/analytics.ts';
import { state, selectedReviews } from '../state/store.ts';
import { button, esc, icon, marketBadge, number, priorityBadge, select, search, sparkline, empty, plural } from '../components/ui.ts';

export function pageFilters(): string {
  return `<div class="page-filters"><div class="date-select">${icon('calendar', 16)}${select('days', state.filters.days, [[56, 'Последние 8 недель'], [28, 'Последние 4 недели'], [7, 'Последняя неделя']], 'Период')}</div>${select('marketplace', state.filters.marketplace, [['all', 'Все площадки'], ['wb', 'Wildberries'], ['ozon', 'Ozon'], ['ym', 'Яндекс Маркет']], 'Площадка')}${select('productId', state.filters.productId, [['all', 'Все товары'], ...products.map(p => [p.id, `${p.name} · ${p.variant}`] as [string, string])], 'Товар')}${button('Экспорт', 'export-topics', 'download')}</div>`;
}
export function metrics(reviews = selectedReviews()): string {
  const s = summarize(reviews, topics);
  const growing = topics.filter(t => { const v = weeklyCounts(reviews, t.id, DEMO_NOW); return v[7] >= 5 && v[7] >= v[6] * 1.5; });
  return `<div class="metrics">
    <article class="metric"><div class="metric-label">Отзывов за период<span class="metric-icon">${icon('reviews', 17)}</span></div><div class="metric-main">${number(s.total)}<span class="mini-label">${state.filters.days / 7} ${plural(state.filters.days / 7, 'неделя', 'недели', 'недель')}</span></div><p>со всех выбранных площадок</p></article>
    <article class="metric"><div class="metric-label">Негативных отзывов<span class="metric-icon">${icon('warning', 17)}</span></div><div class="metric-main">${number(s.negative)}<span class="stat-badge orange">${s.negativePercent}%</span></div><p>с оценкой от 1 до 3 звёзд</p></article>
    <article class="metric"><div class="metric-label">Повторяющихся тем<span class="metric-icon">${icon('topics', 17)}</span></div><div class="metric-main">${s.topics}<span class="stat-badge purple">${s.explainedPercent}% негатива</span></div><p>объяснено найденными темами</p></article>
    <article class="metric"><div class="metric-label">Растущих тем<span class="metric-icon">${icon('trend', 17)}</span></div><div class="metric-main">${growing.length}<span class="stat-badge red">${growing.reduce((sum, t) => sum + weeklyCounts(reviews, t.id, DEMO_NOW)[7], 0)} упоминаний</span></div><p>рост от 50% за последнюю неделю</p></article>
  </div>`;
}
export function themeTable(compact = false): string {
  const reviews = selectedReviews();
  const causes = ['Все', 'Товар', 'Упаковка', 'Доставка', 'Комплектация'];
  let shown = topics.filter(t => (state.cause === 'Все' || t.cause === state.cause) && `${t.title} ${t.phrases.join(' ')}`.toLocaleLowerCase('ru').includes(state.topicSearch.toLocaleLowerCase('ru')) && reviews.some(r => r.topicId === t.id));
  if (state.sort === 'count') shown = shown.toSorted((a, b) => reviews.filter(r => r.topicId === b.id).length - reviews.filter(r => r.topicId === a.id).length);
  else {
    const rank = { 'Высокий': 0, 'Средний': 1, 'Низкий': 2 };
    shown = shown.toSorted((a, b) => rank[a.priority] - rank[b.priority]);
  }
  if (compact) shown = shown.slice(0, 4);
  return `<section class="panel themes-panel"><div class="panel-title"><div><h2>Повторяющиеся претензии <span class="count-pill">${shown.length}</span></h2><p>Одна проблема — разные формулировки покупателей</p></div>${compact ? button('Все темы', 'navigate', '', 'quiet', 'data-route="topics"') : search(state.topicSearch, 'Найти тему', 'topicSearch')}</div>
  ${!compact ? `<div class="table-toolbar"><div class="tabs">${causes.map(c => `<button class="tab ${state.cause === c ? 'active' : ''}" data-action="cause" data-value="${c}">${c}<span>${topics.filter(t => (c === 'Все' || t.cause === c) && reviews.some(r => r.topicId === t.id)).length}</span></button>`).join('')}</div>${select('sort', state.sort, [['priority', 'По приоритету'], ['count', 'По упоминаниям']], 'Сортировка тем', 'sort-select')}</div>` : ''}
  ${shown.length ? `<div class="table-scroll"><table class="topics-table"><thead><tr><th>Тема и как о ней пишут</th><th>Причина</th><th>Упоминания</th><th>Динамика</th><th>Площадки</th><th>Товары</th><th>Приоритет</th><th><span class="sr-only">Открыть</span></th></tr></thead><tbody>${shown.map(t => {
    const rs = reviews.filter(r => r.topicId === t.id), weeks = weeklyCounts(reviews, t.id, DEMO_NOW);
    const ms = (['wb', 'ozon', 'ym'] as Marketplace[]).filter(m => rs.some(r => r.marketplace === m));
    return `<tr class="${t.id === 'leak' ? 'featured-row' : ''}"><td><button class="topic-link" data-action="topic" data-id="${t.id}">${esc(t.title)}${t.isNew ? '<span class="new-badge">Новая</span>' : ''}</button><p class="topic-phrases">${t.phrases.map(p => `«${esc(p)}»`).join(', ')}</p></td><td><span class="cause-label ${t.cause === 'Доставка' ? 'muted' : ''}">${t.cause}</span></td><td><strong class="mentions">${rs.length}</strong><span class="weekly-change ${weeks[7] > weeks[6] ? 'growing' : ''}">${weeks[7]} за неделю</span></td><td>${sparkline(weeks, t.id === 'leak')}</td><td><div class="market-list">${ms.map(m => marketBadge(m)).join('')}</div></td><td><span class="product-count">${new Set(rs.map(r => r.productId)).size}</span></td><td>${priorityBadge(t.priority)}</td><td><button class="icon-button row-open" aria-label="Открыть тему ${esc(t.title)}" data-action="topic" data-id="${t.id}">${icon('right', 16)}</button></td></tr>`;
  }).join('')}</tbody></table></div>` : empty('Таких тем пока нет', 'Измените категорию, поисковый запрос или фильтры.')}
  <div class="table-footer"><span>${icon('help', 15)}${reviews.filter(r => r.rating <= 3 && !r.topicId).length} негативных отзывов вне тем — единичные случаи</span><button class="text-button" data-action="ungrouped">Посмотреть ${icon('right', 14)}</button></div></section>`;
}
export function bottomPanels(reviews = selectedReviews()): string {
  const negative = reviews.filter(r => r.rating <= 3);
  const causes = ['Товар', 'Упаковка', 'Доставка', 'Комплектация', 'Единичные случаи'];
  const colors = ['#4f46e5', '#9489ed', '#b8aff5', '#d8d3fc', '#e8eaf0'];
  const data = causes.map(c => negative.filter(r => c === 'Единичные случаи' ? !r.topicId : topics.find(t => t.id === r.topicId)?.cause === c).length);
  return `<div class="bottom-grid"><section class="panel causes-panel"><div class="panel-title"><div><h2>Причины недовольства</h2><p>Что стоит за низкими оценками</p></div><span class="subtle">${negative.length} отзывов</span></div><div class="causes-content"><div class="cause-chart"><svg viewBox="0 0 140 140" role="img" aria-label="Распределение причин негативных отзывов"><circle cx="70" cy="70" r="53" fill="none" stroke="#f0f1f5" stroke-width="17"/>${data.map((v, i) => {
    const ratio = negative.length ? v / negative.length : 0, prev = data.slice(0, i).reduce((s, x) => s + x, 0);
    return `<circle cx="70" cy="70" r="53" fill="none" stroke="${colors[i]}" stroke-width="17" stroke-dasharray="${Math.max(0, ratio * 333 - 2)} 333" stroke-dashoffset="${negative.length ? -prev / negative.length * 333 : 0}" transform="rotate(-90 70 70)"/>`;
  }).join('')}</svg><div><strong>${negative.length}</strong><span>отзывов</span></div></div><div class="cause-legend">${causes.map((c, i) => `<div><i style="background:${colors[i]}"></i><span>${c}</span><strong>${data[i]}</strong><small>${negative.length ? Math.round(data[i] / negative.length * 100) : 0}%</small></div>`).join('')}</div></div><div class="panel-note">${icon('help', 15)}Доставка отделена от проблем товара и упаковки.</div></section>
  <section class="panel ratings-panel"><div class="panel-title"><div><h2>Рейтинг не показывает причину</h2><p>Общая проблема может скрываться за высокой оценкой</p></div>${icon('star', 20)}</div><div class="ratings-list">${(Object.keys(marketplaces) as Marketplace[]).filter(m => state.filters.marketplace === 'all' || state.filters.marketplace === m).map(m => `<div class="rating-row"><span class="market-avatar market-${m}">${marketplaces[m].short}</span><div><strong>${marketplaces[m].name}</strong><p>${number(reviews.filter(r => r.marketplace === m).length)} отзывов за период</p></div><span class="rating-value">${icon('star', 14)}${marketplaces[m].rating}</span></div>`).join('')}</div><div class="insight-note">${icon('sparkles', 18)}<p>Смотрите глубже рейтинга: повторяющиеся жалобы помогают заметить системную проблему.<span>Рейтинги карточек — отдельные демонстрационные показатели.</span></p></div></section></div>`;
}
export function themesPage(): string {
  const leak = selectedReviews().filter(r => r.topicId === 'leak');
  return `<header class="page-heading"><div><div class="eyebrow">АНАЛИТИКА ОТЗЫВОВ</div><h1>Темы жалоб</h1><p>Находите общие причины, а не разбирайте отзывы по одному.</p></div>${pageFilters()}</header>
  ${leak.length ? `<div class="signal-alert"><span class="alert-symbol">${icon('trend', 22)}</span><div><strong>Быстро растёт тема «Протекает крышка»</strong><p>Упоминаний за неделю: ${weeklyCounts(leak, 'leak', DEMO_NOW)[7]}. Проверьте термокружки из партии №2408.</p></div>${button('Открыть тему', 'topic', '', '', 'data-id="leak"')}</div>` : ''}
  ${metrics()}${themeTable()}${bottomPanels()}<div class="page-footnote">${icon('shield', 14)}Каждый вывод можно проверить по исходным отзывам</div>`;
}

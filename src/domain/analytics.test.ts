import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { reviews, topics, DEMO_NOW } from '../mocks/data.ts';
import { csvCell, filterReviews, makeCsv, summarize, weeklyCounts } from './analytics.ts';
import type { Filters, Review } from './types.ts';

const filters: Filters = { days: 56, marketplace: 'all', productId: 'all' };

describe('review analytics', () => {
  it('keeps the fixture and dashboard totals consistent', () => {
    const selected = filterReviews(reviews, filters, DEMO_NOW);
    assert.equal(new Set(selected.map(r => r.id)).size, 1284);
    assert.deepEqual(summarize(selected, topics), { total: 1284, negative: 236, negativePercent: 18, topics: 7, explainedPercent: 87, average: selected.reduce((s, r) => s + r.rating, 0) / selected.length });
    for (const [market, count] of [['wb', 612], ['ozon', 498], ['ym', 174]] as const) assert.equal(selected.filter(r => r.marketplace === market).length, count);
  });
  it('applies all filters together', () => {
    const selected = filterReviews(reviews, { days: 7, marketplace: 'ozon', productId: 'cup-350-g' }, DEMO_NOW);
    assert.ok(selected.length > 0);
    assert.ok(selected.every(r => r.marketplace === 'ozon' && r.productId === 'cup-350-g' && Date.parse(r.publishedAt) >= Date.parse('2026-10-20T00:00:00+03:00')));
  });
  it('uses inclusive local calendar dates, including the final day', () => {
    const base = reviews[0];
    const dates = ['2026-10-19T23:59:59+03:00', '2026-10-20T00:00:00+03:00', '2026-10-26T23:59:59+03:00', '2026-10-27T00:00:00+03:00'];
    const rs: Review[] = dates.map((publishedAt, i) => ({ ...base, id: String(i), publishedAt }));
    assert.deepEqual(filterReviews(rs, { ...filters, days: 7 }, DEMO_NOW).map(r => r.id), ['1', '2']);
  });
  it('matches each topic weekly totals and marketplace distribution', () => {
    for (const topic of topics) {
      assert.deepEqual(weeklyCounts(reviews, topic.id, DEMO_NOW), topic.weekly);
      for (const [market, count] of Object.entries(topic.platforms)) assert.equal(reviews.filter(r => r.topicId === topic.id && r.marketplace === market).length, count);
    }
  });
  it('updates explained share when an incorrect assignment is removed', () => {
    const changed = reviews.map(r => r.id === 'leak-0' ? { ...r, topicId: null } : r);
    assert.equal(changed.filter(r => r.topicId === 'leak').length, 63);
    assert.equal(changed.filter(r => !r.topicId && r.rating <= 3).length, 31);
    assert.equal(summarize(changed, topics).negative, 236);
  });
  it('returns safe values for an empty selection', () => {
    assert.equal(summarize([], topics).average, 0);
    assert.equal(summarize([], topics).explainedPercent, 0);
    assert.deepEqual(weeklyCounts([], 'leak', DEMO_NOW), Array(8).fill(0));
  });
});

describe('CSV exports', () => {
  it('escapes formulas in imported user content', () => {
    for (const value of ['=SUM(1,2)', '+1', '-1', '@cmd', '  =cmd', '\tcmd']) assert.equal(csvCell(value), `"'${value}"`);
  });
  it('preserves Russian text, quotes, semicolons and line breaks', () => {
    assert.equal(makeCsv(['Текст'], [['Крышка "течёт";\nплохо']]), '\uFEFF"Текст"\r\n"Крышка ""течёт"";\nплохо"');
  });
});

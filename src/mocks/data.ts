import type { Marketplace, Product, Review, Topic } from '../domain/types.ts';

export const DEMO_NOW = '2026-10-26T12:00:00+03:00';
export const marketplaces: Record<Marketplace, { name: string; short: string; color: string; cards: number; rating: string }> = {
  wb: { name: 'Wildberries', short: 'WB', color: '#cb11ab', cards: 38, rating: '4,6' },
  ozon: { name: 'Ozon', short: 'Ozon', color: '#005bff', cards: 30, rating: '4,7' },
  ym: { name: 'Яндекс Маркет', short: 'ЯМ', color: '#e1ac00', cards: 16, rating: '4,8' },
};

export const products: Product[] = [
  { id: 'cup-350-g', name: 'Термокружка 350 мл', variant: 'Графит', sku: 'HH-T350-GR', kind: 'cup', color: '#515667', marketplaces: ['wb', 'ozon', 'ym'] },
  { id: 'cup-350-b', name: 'Термокружка 350 мл', variant: 'Бежевая', sku: 'HH-T350-BG', kind: 'cup', color: '#c9bba8', marketplaces: ['wb', 'ozon', 'ym'] },
  { id: 'cup-450', name: 'Термокружка 450 мл', variant: 'Графит', sku: 'HH-T450-GR', kind: 'cup', color: '#738285', marketplaces: ['wb', 'ozon'] },
  { id: 'bottle', name: 'Бутылка 500 мл', variant: 'Белая', sku: 'HH-B500-WH', kind: 'bottle', color: '#dddeda', marketplaces: ['wb', 'ozon', 'ym'] },
  { id: 'lunch', name: 'Ланч-бокс 850 мл', variant: 'Шалфей', sku: 'HH-L850-SG', kind: 'box', color: '#a5b2a1', marketplaces: ['wb', 'ozon'] },
  { id: 'cup-450-b', name: 'Термокружка 450 мл', variant: 'Песочная', sku: 'HH-T450-SD', kind: 'cup', color: '#baaa95', marketplaces: ['ozon', 'ym'] },
];

export const topics: Topic[] = [
  { id: 'leak', title: 'Протекает крышка', phrases: ['течёт из-под крышки', 'мокрая сумка', 'подтекает клапан'], cause: 'Товар', priority: 'Высокий', weekly: [1, 2, 3, 5, 7, 9, 14, 23], platforms: { wb: 31, ozon: 24, ym: 9 }, productCount: 4, description: 'Покупатели пишут, что жидкость протекает через крышку или клапан термокружки, особенно когда она лежит горизонтально.' },
  { id: 'package', title: 'Мятая или порванная коробка', phrases: ['коробка в заломах', 'упаковка порвана', 'помятый угол'], cause: 'Упаковка', priority: 'Средний', weekly: [3, 4, 5, 6, 6, 8, 4, 5], platforms: { wb: 24, ozon: 17 }, productCount: 11, description: 'Покупатели получают товары в повреждённой упаковке. Чаще всего упоминают замятые углы и разрывы внешнего короба.' },
  { id: 'delivery', title: 'Долгая доставка', phrases: ['ехал две недели', 'перенесли дату', 'долго в пункте выдачи'], cause: 'Доставка', priority: 'Низкий', weekly: [5, 6, 5, 4, 4, 4, 3, 2], platforms: { wb: 18, ozon: 10, ym: 5 }, productCount: 84, description: 'Отзывы о переносах сроков и задержках доставки. Причина относится к логистике площадки и требует отдельной проверки.' },
  { id: 'color', title: 'Цвет не как на фото', phrases: ['на фото бежевая, пришла серая', 'оттенок темнее'], cause: 'Товар', priority: 'Средний', weekly: [2, 3, 4, 3, 4, 5, 4, 4], platforms: { wb: 20, ym: 9 }, productCount: 3, description: 'Покупатели замечают расхождение оттенка товара с фотографиями в карточке. Стоит проверить фото при естественном освещении.' },
  { id: 'smell', title: 'Запах пластика', phrases: ['пахнет химией', 'запах не выветривается'], cause: 'Товар', priority: 'Средний', isNew: true, weekly: [0, 0, 0, 1, 2, 4, 4, 7], platforms: { ozon: 18 }, productCount: 2, description: 'Покупатели отмечают запах пластика у новых термокружек. Пока жалобы встречаются только на Ozon.' },
  { id: 'heat', title: 'Не держит тепло заявленное время', phrases: ['через 3 часа еле тёплый', 'никак не 8 часов'], cause: 'Товар', priority: 'Низкий', weekly: [1, 2, 1, 2, 2, 2, 1, 1], platforms: { wb: 12 }, productCount: 2, description: 'Фактическое время сохранения тепла не соответствует ожиданиям покупателей и описанию в карточке.' },
  { id: 'variant', title: 'Пришёл не тот вариант', phrases: ['заказывала 450 мл, пришла 350', 'другой цвет'], cause: 'Комплектация', priority: 'Средний', isNew: true, weekly: [0, 0, 0, 0, 0, 1, 3, 5], platforms: { ozon: 9 }, productCount: 5, description: 'Покупатели получают другой объём или цвет товара. Нужно проверить маркировку и комплектацию на складе.' },
];

const examples: Record<string, string[]> = {
  leak: ['Купила в подарок, через неделю крышка начала подтекать. В сумке всё мокрое, документы испорчены.', 'Тепло держит отлично, но если положить горизонтально — течёт через клапан. Уплотнитель как будто не до конца прилегает.', 'Беру эту модель второй раз. Первая была идеальная, а эта пролилась в рюкзаке в первый же день.', 'Красивая и удобная, но кофе просачивается по резьбе, приходится держать вертикально.'],
  package: ['Сама кружка хорошая, но коробка вся мятая. Для подарка пришлось искать другую упаковку.', 'Упаковка порвана по углу, внутри товар целый. Хотелось бы более плотную коробку.'],
  delivery: ['Кружка понравилась, но доставка заняла две недели. Дату переносили три раза.'],
  color: ['На фото цвет светлый бежевый, в жизни гораздо темнее и уходит в серый.'],
  smell: ['После мытья всё ещё пахнет пластиком. За несколько дней запах не выветрился.'],
  heat: ['Через три часа кофе уже еле тёплый, хотя в карточке написано до 8 часов.'],
  variant: ['Заказывала 450 мл, а пришла 350. На коробке правильная наклейка, внутри другой вариант.'],
};

function generateReviews(): Review[] {
  const out: Review[] = [];
  const start = Date.parse('2026-09-01T12:00:00+03:00');
  const names = ['Анна', 'Мария', 'Алексей', 'Екатерина', 'Ольга', 'Дмитрий', 'Ирина', 'Покупатель'];
  for (const topic of topics) {
    const shares = Object.entries(topic.platforms) as [Marketplace, number][];
    const total = shares.reduce((sum, [, count]) => sum + count, 0);
    const assigned: Partial<Record<Marketplace, number>> = {};
    const distribution = Array.from({ length: total }, (_, i) => {
      const chosen = shares.toSorted(([a, ac], [b, bc]) => ((i + 1) * bc / total - (assigned[b] || 0)) - ((i + 1) * ac / total - (assigned[a] || 0)))[0][0];
      assigned[chosen] = (assigned[chosen] || 0) + 1;
      return chosen;
    });
    let n = 0;
    topic.weekly.forEach((count, week) => {
      for (let j = 0; j < count; j++) {
        const productIndex = topic.id === 'leak' ? n < 31 ? 0 : n < 48 ? 1 : n < 60 ? 2 : 3 : topic.id === 'smell' ? n % 2 === 0 ? 2 : 5 : n % products.length;
        const marketplace = distribution[n];
        const compatible = products[productIndex].marketplaces.includes(marketplace) ? products[productIndex] : products.find(p => p.marketplaces.includes(marketplace))!;
        out.push({ id: `${topic.id}-${n}`, marketplace, productId: compatible.id, rating: n % 11 === 0 ? 2 : 3, text: examples[topic.id][n % examples[topic.id].length], publishedAt: new Date(start + (week * 7 + Math.min(6, Math.floor(j * 7 / count))) * 86400000 + (n % 9) * 3600000).toISOString(), topicId: topic.id, author: names[n % names.length], batch: topic.id === 'leak' && n >= 12 ? '2408' : n % 3 === 0 ? null : '2406', confidence: 88 + n % 10 });
        n++;
      }
    });
  }
  const target: Record<Marketplace, number> = { wb: 612, ozon: 498, ym: 174 };
  for (const marketplace of ['wb', 'ozon', 'ym'] as const) {
    const remaining = target[marketplace] - out.filter(r => r.marketplace === marketplace).length;
    const suitable = products.filter(p => p.marketplaces.includes(marketplace));
    for (let i = 0; i < remaining; i++) {
      const negative = i < 10;
      out.push({ id: `${marketplace}-other-${i}`, marketplace, productId: suitable[i % suitable.length].id, rating: negative ? 3 : i % 24 === 0 ? 4 : 5, text: negative ? ['На корпусе небольшая царапина. В остальном всё хорошо.', 'Не очень удобно открывать одной рукой. Мне не подошло.'][i % 2] : ['Отличная кружка, беру с собой каждый день. Удобная, красивая и хорошо держит тепло.', 'Всё пришло вовремя, аккуратно упаковано. Качество понравилось!', 'Пользуюсь уже месяц. Приятный цвет, удобно мыть. Спасибо!'][i % 3], publishedAt: new Date(start + (i % 56) * 86400000 + i % 10 * 3600000).toISOString(), topicId: null, author: names[i % names.length], batch: i % 2 ? '2408' : '2406', confidence: null });
    }
  }
  return out.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export const reviews = generateReviews();

export const alerts = [
  { id: '1', topicId: 'leak', title: '«Протекает крышка» — превышен порог', text: '10 новых упоминаний за сутки при пороге 5. Большинство связано с партией №2408.', date: '26 октября, 09:40', kind: 'danger', unread: true },
  { id: '2', topicId: 'smell', title: 'Растёт новая тема «Запах пластика»', text: '7 упоминаний за неделю, все на Ozon. Проверьте термокружку 450 мл.', date: '25 октября, 18:12', kind: 'warning', unread: true },
  { id: '3', topicId: 'variant', title: 'Найдена тема «Пришёл не тот вариант»', text: 'Объединены отзывы с разными формулировками. Проверьте, верно ли они сгруппированы.', date: '24 октября, 12:05', kind: 'info', unread: true },
  { id: '4', topicId: 'delivery', title: 'Тема «Долгая доставка» снижается', text: 'Меньше упоминаний, чем неделей ранее. Тема относится к логистике площадки.', date: '23 октября, 11:20', kind: 'success', unread: false },
];

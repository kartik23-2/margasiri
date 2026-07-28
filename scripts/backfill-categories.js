const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'lib', 'data', 'places.ts'), 'utf8');
const entries = [...source.matchAll(/\{ name: '((?:\\'|[^'])*)', state: '([^']+)'[^}]*category: '([^']+)'[^}]*description: '((?:\\'|[^'])*)'/g)]
  .map((match) => ({
    name: match[1].replace(/\\'/g, "'"),
    category: match[3],
    description: match[4].replace(/\\'/g, "'")
  }));

function slugify(value) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function categoriesFor(place) {
  const tags = new Set([place.category]);
  const text = `${place.name} ${place.description}`.toLowerCase();
  if (['Wilderness', 'Wildlife', 'Hills', 'Valley', 'Beach'].includes(place.category)) tags.add('Nature');
  if (['Heritage', 'Spiritual', 'Village'].includes(place.category)) tags.add('Art & Culture');
  if (place.category === 'Heritage') {
    tags.add('History');
    tags.add('Architecture');
  }
  if (place.category === 'Spiritual') tags.add('Architecture');
  if (/(fort|palace|temple|monastery|stepwell)/.test(text)) tags.add('Architecture');
  if (/(trek|raft|safari|climb|cave)/.test(text)) tags.add('Adventure');
  return [...tags];
}

const rows = entries.flatMap((place) =>
  categoriesFor(place).map((category) => ({
    place_slug: slugify(place.name),
    category_slug: slugify(category)
  }))
);

console.log(JSON.stringify(rows, null, 2));

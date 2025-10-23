// Seed products parsed from provided menu images into Supabase
// Uses SERVICE ROLE key to bypass RLS for admin seeding

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing Supabase env vars. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const categories = [
  { name: 'Fries', description: 'Fried sides & snacks' },
  { name: 'Kebab Special', description: 'Piadina kebab specials' },
  { name: 'Burgers', description: 'Beef & chicken burgers' },
  { name: 'Hotdog', description: 'Hotdogs and variations' },
  { name: 'Birra Artigianale', description: 'Craft beers' },
  { name: 'Birra', description: 'Beers' },
  { name: 'Cocktails', description: 'Classic cocktails' },
  { name: 'Alcolici (Shot/Bicchiere)', description: 'Spirits' },
  { name: 'Bevande Analcoliche', description: 'Soft drinks' },
];

// Helper to euro string like "€6,50" to number 6.5
const parseEuro = (s) => Number(String(s).replace(/[^0-9,\.]/g, '').replace(',', '.'));

const menuItems = [
  // Fries
  { category: 'Fries', name: 'Patate Fritte', price: parseEuro('€6,00') },
  { category: 'Fries', name: 'Bocconcini di Pollo (5 pz)', price: parseEuro('€6,00') },
  { category: 'Fries', name: 'Anelli di Cipolla (5 pz)', price: parseEuro('€6,00') },
  { category: 'Fries', name: 'Samosa Verdure (3 pz)', price: parseEuro('€6,00') },
  { category: 'Fries', name: 'Alette di Pollo (5 pz)', price: parseEuro('€7,00') },

  // Kebab specials
  { category: 'Kebab Special', name: 'Classico (Piadina, pollo 150g)', price: parseEuro('€7,00') },
  { category: 'Kebab Special', name: 'Formaggio (pollo 150g, cheddar)', price: parseEuro('€8,00') },
  { category: 'Kebab Special', name: 'Bacon (pollo 150g, bacon)', price: parseEuro('€9,00') },
  { category: 'Kebab Special', name: 'Piccante (carne di pollo 150g, chilli)', price: parseEuro('€8,00') },

  // Burgers
  { category: 'Burgers', name: 'Hamburger', price: parseEuro('€6,50') },
  { category: 'Burgers', name: 'Cheese Burger', price: parseEuro('€7,00') },
  { category: 'Burgers', name: 'Cheese Bacon Burger', price: parseEuro('€9,00') },
  { category: 'Burgers', name: 'Onion Burger', price: parseEuro('€9,00') },
  { category: 'Burgers', name: 'Chilli Burger', price: parseEuro('€9,00') },
  { category: 'Burgers', name: 'Egg Bacon Burger', price: parseEuro('€10,00') },
  { category: 'Burgers', name: 'Crispy Chicken Burger', price: parseEuro('€7,00') },

  // Hotdog
  { category: 'Hotdog', name: 'Hotdog', price: parseEuro('€5,50') },
  { category: 'Hotdog', name: 'Cheese Hotdog', price: parseEuro('€6,00') },
  { category: 'Hotdog', name: 'Cheese Bacon Hotdog', price: parseEuro('€7,00') },

  // Craft Beer (Birra Artigianale)
  { category: 'Birra Artigianale', name: 'IPA Steam Brew 0,5L 4,9%', price: parseEuro('€5,00') },
  { category: 'Birra Artigianale', name: 'Double IPA Steam Brew 0,5L 7,8%', price: parseEuro('€5,00') },
  { category: 'Birra Artigianale', name: 'German Red Steam Brew 0,5L 7,9%', price: parseEuro('€5,00') },
  { category: 'Birra Artigianale', name: 'Black Stout Steam Brew 7,5%', price: parseEuro('€5,00') },
  { category: 'Birra Artigianale', name: 'Wheat Pale Ale Steam Brew 5,6%', price: parseEuro('€5,00') },
  { category: 'Birra Artigianale', name: 'Blanche Isaac Baladin 33cl 5%', price: parseEuro('€6,50') },
  { category: 'Birra Artigianale', name: 'Gluten Free Igea Salento 33cl 5,3%', price: parseEuro('€6,50') },
  { category: 'Birra Artigianale', name: 'Agricola Chiara Leverano 33cl 5%', price: parseEuro('€7,00') },
  { category: 'Birra Artigianale', name: 'Rock and Roll APA Baladin 33cl 7,5%', price: parseEuro('€7,00') },
  { category: 'Birra Artigianale', name: 'Giulia Weizen 33cl 6%', price: parseEuro('€7,00') },
  { category: 'Birra Artigianale', name: 'Giulia IPA 33cl 5,8%', price: parseEuro('€7,00') },
  { category: 'Birra Artigianale', name: 'Giulia Ambrata 33cl 7%', price: parseEuro('€7,00') },

  // Birra
  { category: 'Birra', name: 'Peroni 66cl', price: parseEuro('€4,50') },
  { category: 'Birra', name: 'Heineken 66cl', price: parseEuro('€5,00') },
  { category: 'Birra', name: 'Peroni 33cl', price: parseEuro('€2,50') },
  { category: 'Birra', name: 'Heineken 33cl', price: parseEuro('€3,00') },
  { category: 'Birra', name: 'Menabrea 33cl', price: parseEuro('€3,50') },
  { category: 'Birra', name: 'Senza Glutine 33cl', price: parseEuro('€3,50') },
  { category: 'Birra', name: 'Tennent’s 33cl', price: parseEuro('€3,50') },
  { category: 'Birra', name: 'Ceres 33cl / Messina 50cl', price: parseEuro('€4,50') },
  { category: 'Birra', name: 'Ichnusa/Morretti non filtrate 50cl', price: parseEuro('€4,50') },
  { category: 'Birra', name: 'Corona 35.5cl', price: parseEuro('€3,50') },
  { category: 'Birra', name: 'Weissbier Paulaner 50cl', price: parseEuro('€4,50') },
  { category: 'Birra', name: 'Kozel Scura (spina) 50cl', price: parseEuro('€6,50') },
  { category: 'Birra', name: 'Kozel Chiara (spina) 50cl', price: parseEuro('€6,50') },
  { category: 'Birra', name: 'Peroni Cruda (spina) 50cl', price: parseEuro('€6,50') },

  // Cocktails
  { category: 'Cocktails', name: 'Vodka Lemon', price: parseEuro('€8,00') },
  { category: 'Cocktails', name: 'Gin Lemon', price: parseEuro('€8,00') },
  { category: 'Cocktails', name: 'Gin Tonic', price: parseEuro('€8,00') },
  { category: 'Cocktails', name: 'Jägerbomb', price: parseEuro('€8,00') },
  { category: 'Cocktails', name: 'Cuba Libre', price: parseEuro('€8,00') },
  { category: 'Cocktails', name: 'Negroni', price: parseEuro('€10,00') },
  { category: 'Cocktails', name: 'Americano', price: parseEuro('€8,00') },
  { category: 'Cocktails', name: 'Boulevardier', price: parseEuro('€10,00') },
  { category: 'Cocktails', name: 'Aperol Spritz', price: parseEuro('€8,00') },
  { category: 'Cocktails', name: 'Black Russian', price: parseEuro('€9,00') },
  { category: 'Cocktails', name: 'Sex on the Beach', price: parseEuro('€9,00') },
  { category: 'Cocktails', name: 'Loyola (vodka fragola, lemon soda)', price: parseEuro('€8,00') },

  // Soft drinks
  { category: 'Bevande Analcoliche', name: 'Coca-cola 33cl', price: parseEuro('€2,50') },
  { category: 'Bevande Analcoliche', name: 'Coca-cola Zero 33cl', price: parseEuro('€2,50') },
  { category: 'Bevande Analcoliche', name: 'Fanta o Sprite 33cl', price: parseEuro('€2,50') },
  { category: 'Bevande Analcoliche', name: 'Red Bull 250ml', price: parseEuro('€3,50') },
  { category: 'Bevande Analcoliche', name: 'Tè Pesca o Limone 50cl', price: parseEuro('€3,00') },
  { category: 'Bevande Analcoliche', name: 'Schweppes Tonica 20cl', price: parseEuro('€3,00') },
  { category: 'Bevande Analcoliche', name: 'Schweppes Limone 20cl', price: parseEuro('€3,00') },
  { category: 'Bevande Analcoliche', name: 'Acqua Naturale/Frizzante 50cl', price: parseEuro('€1,50') },
  { category: 'Bevande Analcoliche', name: 'Succo di Frutta 200ml', price: parseEuro('€3,00') },
];

async function main() {
  console.log('🌱 Seeding categories & menu items from images...');

  // Upsert categories and build name -> id map
  // Ensure categories exist (no unique constraint on name, so do manual upsert)
  const { data: existingCats, error: selErr } = await supabase
    .from('categories')
    .select('id,name');
  if (selErr) throw selErr;

  const existingNames = new Set((existingCats || []).map((c) => c.name));
  const toInsert = categories.filter((c) => !existingNames.has(c.name));
  if (toInsert.length) {
    const { error: insErr } = await supabase.from('categories').insert(toInsert);
    if (insErr) throw insErr;
  }
  const { data: catsData, error: catsErr } = await supabase
    .from('categories')
    .select('id,name');
  if (catsErr) throw catsErr;
  const nameToCatId = new Map(catsData.map((c) => [c.name, c.id]));

  // Insert menu items
  const rows = menuItems.map((m) => ({
    name: m.name,
    price: m.price,
    image_url: '',
    description: '',
    calories: null,
    protein: null,
    rating: null,
    type: m.category,
    categories: [m.category],
  }));

  const { error: miErr } = await supabase.from('menu_items').insert(rows);
  if (miErr) throw miErr;

  console.log(`✅ Seeded ${rows.length} menu items across ${categories.length} categories.`);
}

main().catch((e) => {
  console.error('Seeding failed:', e.message);
  process.exit(1);
});



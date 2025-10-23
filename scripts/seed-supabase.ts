import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import data from '@/lib/data';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(url, key);

async function main() {
  // categories
  for (const cat of data.categories) {
    await supabase.from('categories').insert(cat);
  }

  // menu items
  for (const item of data.menu) {
    await supabase.from('menu_items').insert({
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      description: item.description,
      calories: item.calories,
      protein: item.protein,
      rating: item.rating,
      type: item.category_name,
      categories: [item.category_name],
    });
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });





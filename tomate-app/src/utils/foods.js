// Curated food database for Quick Log
// All macros are per 100g unless `unit` is specified (then per `unitGrams` of that unit).
// kcal = calories, p = protein (g), c = carbs (g), f = fat (g)

const F = (id, name, nameEn, category, kcal, p, c, f, opts = {}) => ({
  id, name, nameEn, category,
  per100: { kcal, p, c, f },
  defaultGrams: opts.defaultGrams ?? 100,
  unit: opts.unit,           // e.g. 'egg', 'banana'  (omit for gram foods)
  unitGrams: opts.unitGrams, // grams in 1 unit
  emoji: opts.emoji,
})

export const FOODS = [
  // ─── PROTEINS ────────────────────────────────────────────────────────
  F('chk_breast',     'Pechuga de pollo',         'Chicken breast (cooked)',     'protein', 165, 31, 0,    3.6,  { defaultGrams: 200, emoji: '🍗' }),
  F('chk_thigh',      'Muslo de pollo',           'Chicken thigh (cooked)',      'protein', 209, 26, 0,    11,   { defaultGrams: 150, emoji: '🍗' }),
  F('beef_lean',      'Carne de res magra',       'Lean beef (cooked)',          'protein', 217, 27, 0,    11,   { defaultGrams: 150, emoji: '🥩' }),
  F('beef_ground85',  'Carne molida 85/15',       'Ground beef 85/15 (cooked)',  'protein', 250, 26, 0,    16,   { defaultGrams: 150, emoji: '🥩' }),
  F('pork_loin',      'Lomo de cerdo',            'Pork loin (cooked)',          'protein', 242, 27, 0,    14,   { defaultGrams: 150, emoji: '🥩' }),
  F('bacon',          'Tocino',                   'Bacon',                        'protein', 541, 37, 1,    42,   { defaultGrams: 30,  emoji: '🥓' }),
  F('chorizo',        'Chorizo',                  'Chorizo',                     'protein', 455, 24, 2,    38,   { defaultGrams: 60,  emoji: '🌶️' }),
  F('ham_lean',       'Jamón de pavo',            'Lean turkey ham',             'protein', 110, 18, 2,    3,    { defaultGrams: 80,  emoji: '🍖' }),

  F('salmon',         'Salmón',                   'Salmon (cooked)',             'protein', 208, 22, 0,    13,   { defaultGrams: 150, emoji: '🐟' }),
  F('tuna_water',     'Atún en agua',             'Tuna (water)',                'protein', 116, 26, 0,    1,    { defaultGrams: 140, emoji: '🐟' }),
  F('tuna_oil',       'Atún en aceite',           'Tuna (oil)',                  'protein', 198, 29, 0,    8,    { defaultGrams: 140, emoji: '🐟' }),
  F('shrimp',         'Camarón cocido',           'Shrimp (cooked)',             'protein', 99,  24, 0,    0.3,  { defaultGrams: 150, emoji: '🦐' }),
  F('tilapia',        'Tilapia',                  'Tilapia (cooked)',            'protein', 128, 26, 0,    2.7,  { defaultGrams: 150, emoji: '🐟' }),
  F('cod',            'Bacalao',                  'Cod (cooked)',                'protein', 105, 23, 0,    0.9,  { defaultGrams: 150, emoji: '🐟' }),

  F('egg_whole',      'Huevo entero',             'Egg (whole)',                 'protein', 155, 13, 1.1,  11,   { unit: 'huevo', unitGrams: 50, defaultGrams: 150, emoji: '🥚' }),
  F('egg_white',      'Clara de huevo',           'Egg white',                   'protein', 52,  11, 0.7,  0.2,  { unit: 'clara', unitGrams: 33, defaultGrams: 100, emoji: '🥚' }),

  F('greek_yogurt',   'Yogurt griego natural',    'Greek yogurt (plain)',        'protein', 59,  10, 3.6,  0.4,  { defaultGrams: 200, emoji: '🥛' }),
  F('cottage',        'Queso cottage',            'Cottage cheese',              'protein', 98,  11, 3.4,  4.3,  { defaultGrams: 200, emoji: '🥣' }),
  F('milk_whole',     'Leche entera',             'Whole milk',                  'protein', 61,  3.2, 4.8, 3.3,  { defaultGrams: 250, emoji: '🥛' }),
  F('milk_skim',      'Leche descremada',         'Skim milk',                   'protein', 34,  3.4, 5,   0.1,  { defaultGrams: 250, emoji: '🥛' }),
  F('milk_lact_free', 'Leche deslactosada',       'Lactose-free milk',           'protein', 50,  3.3, 5,   2,    { defaultGrams: 250, emoji: '🥛' }),

  F('cheese_oaxaca',  'Queso Oaxaca',             'Oaxaca cheese',               'protein', 356, 22, 4,    28,   { defaultGrams: 30,  emoji: '🧀' }),
  F('cheese_panela',  'Queso panela',             'Panela cheese',               'protein', 272, 19, 1.5,  21,   { defaultGrams: 50,  emoji: '🧀' }),
  F('cheese_cheddar', 'Queso cheddar',            'Cheddar cheese',              'protein', 403, 25, 1.3,  33,   { defaultGrams: 30,  emoji: '🧀' }),
  F('cheese_fresh',   'Queso fresco',             'Queso fresco',                'protein', 297, 18, 5,    23,   { defaultGrams: 50,  emoji: '🧀' }),
  F('cheese_cream',   'Queso crema',              'Cream cheese',                'protein', 342, 6,  4.1,  34,   { defaultGrams: 30,  emoji: '🧀' }),

  F('protein_whey',   'Proteína whey',            'Whey protein',                'protein', 380, 75, 10,   5,    { defaultGrams: 30,  unit: 'scoop', unitGrams: 30, emoji: '💪' }),
  F('protein_casein', 'Caseína',                  'Casein protein',              'protein', 360, 70, 9,    3,    { defaultGrams: 30,  unit: 'scoop', unitGrams: 30, emoji: '💪' }),
  F('protein_bar',    'Barra de proteína',        'Protein bar',                 'protein', 380, 22, 35,   12,   { defaultGrams: 60,  unit: 'barra', unitGrams: 60, emoji: '🍫' }),

  F('jerky',          'Jerky de res',             'Beef jerky',                  'protein', 410, 33, 11,   26,   { defaultGrams: 30,  emoji: '🥩' }),
  F('tofu_firm',      'Tofu firme',               'Firm tofu',                   'protein', 144, 15, 4,    9,    { defaultGrams: 150, emoji: '🟦' }),

  // ─── CARBS ───────────────────────────────────────────────────────────
  F('rice_white',     'Arroz blanco cocido',      'White rice (cooked)',         'carb', 130, 2.7, 28,  0.3,  { defaultGrams: 150, emoji: '🍚' }),
  F('rice_brown',     'Arroz integral cocido',    'Brown rice (cooked)',         'carb', 111, 2.6, 23,  0.9,  { defaultGrams: 150, emoji: '🍚' }),
  F('rice_dry',       'Arroz crudo',              'Rice (dry)',                  'carb', 365, 7,   80,  0.7,  { defaultGrams: 80,  emoji: '🍚' }),
  F('oats',           'Avena',                    'Oats (dry)',                  'carb', 389, 16.9,66,  6.9,  { defaultGrams: 50,  emoji: '🥣' }),
  F('oatmeal_cooked', 'Avena cocida',             'Oatmeal (cooked)',            'carb', 71,  2.5, 12,  1.5,  { defaultGrams: 250, emoji: '🥣' }),
  F('quinoa',         'Quinoa cocida',            'Quinoa (cooked)',             'carb', 120, 4.4, 21,  1.9,  { defaultGrams: 150, emoji: '🌾' }),

  F('bread_white',    'Pan blanco',               'White bread',                 'carb', 265, 9,   49,  3.2,  { unit: 'rebanada', unitGrams: 30, defaultGrams: 60, emoji: '🍞' }),
  F('bread_wheat',    'Pan integral',             'Whole wheat bread',           'carb', 247, 13,  41,  3.5,  { unit: 'rebanada', unitGrams: 30, defaultGrams: 60, emoji: '🍞' }),
  F('bagel',          'Bagel',                    'Bagel',                       'carb', 257, 10,  50,  1.5,  { unit: 'bagel', unitGrams: 100, defaultGrams: 100, emoji: '🥯' }),

  F('tortilla_corn',  'Tortilla de maíz',         'Corn tortilla',               'carb', 218, 5.7, 45,  2.9,  { unit: 'tortilla', unitGrams: 25, defaultGrams: 75, emoji: '🌽' }),
  F('tortilla_flour', 'Tortilla de harina',       'Flour tortilla',              'carb', 304, 8,   49,  8,    { unit: 'tortilla', unitGrams: 35, defaultGrams: 70, emoji: '🌮' }),

  F('pasta_cooked',   'Pasta cocida',             'Pasta (cooked)',              'carb', 158, 5.8, 31,  0.9,  { defaultGrams: 200, emoji: '🍝' }),
  F('pasta_dry',      'Pasta cruda',              'Pasta (dry)',                 'carb', 371, 13,  75,  1.5,  { defaultGrams: 80,  emoji: '🍝' }),

  F('potato_baked',   'Papa horneada',            'Baked potato',                'carb', 93,  2.5, 21,  0.1,  { defaultGrams: 200, emoji: '🥔' }),
  F('sweet_potato',   'Camote',                   'Sweet potato (baked)',        'carb', 90,  2,   21,  0.1,  { defaultGrams: 200, emoji: '🍠' }),
  F('beans_black',    'Frijoles negros',          'Black beans (cooked)',        'carb', 132, 8.9, 24,  0.5,  { defaultGrams: 200, emoji: '🫘' }),
  F('beans_pinto',    'Frijoles pintos',          'Pinto beans (cooked)',        'carb', 143, 9,   26,  0.7,  { defaultGrams: 200, emoji: '🫘' }),
  F('lentils',        'Lentejas cocidas',         'Lentils (cooked)',            'carb', 116, 9,   20,  0.4,  { defaultGrams: 200, emoji: '🟤' }),
  F('chickpeas',      'Garbanzos cocidos',        'Chickpeas (cooked)',          'carb', 164, 8.9, 27,  2.6,  { defaultGrams: 200, emoji: '🟡' }),

  F('cereal_cornflakes', 'Cereal corn flakes',    'Corn flakes',                 'carb', 357, 7,   84,  0.4,  { defaultGrams: 40,  emoji: '🥣' }),
  F('granola',        'Granola',                  'Granola',                     'carb', 489, 13,  64,  20,   { defaultGrams: 50,  emoji: '🥣' }),

  // ─── FRUITS ──────────────────────────────────────────────────────────
  F('banana',         'Plátano',                  'Banana',                      'fruit', 89,  1.1, 23,  0.3,  { unit: 'plátano', unitGrams: 120, defaultGrams: 120, emoji: '🍌' }),
  F('apple',          'Manzana',                  'Apple',                       'fruit', 52,  0.3, 14,  0.2,  { unit: 'manzana', unitGrams: 180, defaultGrams: 180, emoji: '🍎' }),
  F('orange',         'Naranja',                  'Orange',                      'fruit', 47,  0.9, 12,  0.1,  { unit: 'naranja', unitGrams: 130, defaultGrams: 130, emoji: '🍊' }),
  F('pear',           'Pera',                     'Pear',                        'fruit', 57,  0.4, 15,  0.1,  { unit: 'pera', unitGrams: 180, defaultGrams: 180, emoji: '🍐' }),
  F('grapes',         'Uvas',                     'Grapes',                      'fruit', 67,  0.6, 17,  0.4,  { defaultGrams: 100, emoji: '🍇' }),
  F('strawberry',     'Fresas',                   'Strawberries',                'fruit', 32,  0.7, 7.7, 0.3,  { defaultGrams: 150, emoji: '🍓' }),
  F('blueberries',    'Arándanos',                'Blueberries',                 'fruit', 57,  0.7, 14,  0.3,  { defaultGrams: 100, emoji: '🫐' }),
  F('mango',          'Mango',                    'Mango',                       'fruit', 60,  0.8, 15,  0.4,  { defaultGrams: 200, emoji: '🥭' }),
  F('pineapple',      'Piña',                     'Pineapple',                   'fruit', 50,  0.5, 13,  0.1,  { defaultGrams: 150, emoji: '🍍' }),
  F('watermelon',     'Sandía',                   'Watermelon',                  'fruit', 30,  0.6, 8,   0.2,  { defaultGrams: 200, emoji: '🍉' }),
  F('papaya',         'Papaya',                   'Papaya',                      'fruit', 43,  0.5, 11,  0.3,  { defaultGrams: 200, emoji: '🥭' }),

  // ─── VEGGIES ─────────────────────────────────────────────────────────
  F('broccoli',       'Brócoli',                  'Broccoli',                    'veggie', 34,  2.8, 7,   0.4,  { defaultGrams: 150, emoji: '🥦' }),
  F('spinach',        'Espinaca',                 'Spinach',                     'veggie', 23,  2.9, 3.6, 0.4,  { defaultGrams: 100, emoji: '🥬' }),
  F('lettuce',        'Lechuga',                  'Lettuce',                     'veggie', 15,  1.4, 2.9, 0.2,  { defaultGrams: 100, emoji: '🥬' }),
  F('cucumber',       'Pepino',                   'Cucumber',                    'veggie', 16,  0.7, 3.6, 0.1,  { defaultGrams: 150, emoji: '🥒' }),
  F('tomato',         'Tomate',                   'Tomato',                      'veggie', 18,  0.9, 3.9, 0.2,  { defaultGrams: 150, emoji: '🍅' }),
  F('carrot',         'Zanahoria',                'Carrot',                      'veggie', 41,  0.9, 10,  0.2,  { defaultGrams: 150, emoji: '🥕' }),
  F('bellpepper',     'Pimiento',                 'Bell pepper',                 'veggie', 26,  1,   6,   0.3,  { defaultGrams: 150, emoji: '🫑' }),
  F('onion',          'Cebolla',                  'Onion',                       'veggie', 40,  1.1, 9.3, 0.1,  { defaultGrams: 50,  emoji: '🧅' }),
  F('avocado',        'Aguacate',                 'Avocado',                     'fat', 160, 2,   9,   15,   { unit: 'aguacate', unitGrams: 150, defaultGrams: 150, emoji: '🥑' }),
  F('nopales',        'Nopales',                  'Nopales',                     'veggie', 16,  1.3, 3.3, 0.1,  { defaultGrams: 150, emoji: '🌵' }),
  F('green_beans',    'Ejotes',                   'Green beans',                 'veggie', 31,  1.8, 7,   0.2,  { defaultGrams: 150, emoji: '🫛' }),
  F('zucchini',       'Calabacita',               'Zucchini',                    'veggie', 17,  1.2, 3.1, 0.3,  { defaultGrams: 150, emoji: '🥒' }),
  F('mushroom',       'Champiñones',              'Mushrooms',                   'veggie', 22,  3.1, 3.3, 0.3,  { defaultGrams: 100, emoji: '🍄' }),

  // ─── FATS / NUTS / OILS ──────────────────────────────────────────────
  F('almonds',        'Almendras',                'Almonds',                     'fat', 579, 21,  22,  50,   { defaultGrams: 30,  emoji: '🌰' }),
  F('walnuts',        'Nueces',                   'Walnuts',                     'fat', 654, 15,  14,  65,   { defaultGrams: 30,  emoji: '🌰' }),
  F('peanuts',        'Cacahuates',               'Peanuts',                     'fat', 567, 26,  16,  49,   { defaultGrams: 30,  emoji: '🥜' }),
  F('cashews',        'Marañones',                'Cashews',                     'fat', 553, 18,  30,  44,   { defaultGrams: 30,  emoji: '🌰' }),
  F('mixed_nuts',     'Nueces mixtas',            'Mixed nuts',                  'fat', 607, 20,  21,  54,   { defaultGrams: 30,  emoji: '🥜' }),
  F('peanut_butter',  'Crema de cacahuate',       'Peanut butter',               'fat', 588, 25,  20,  50,   { defaultGrams: 32,  unit: 'cda', unitGrams: 16, emoji: '🥜' }),
  F('almond_butter',  'Crema de almendra',        'Almond butter',               'fat', 614, 21,  19,  56,   { defaultGrams: 32,  unit: 'cda', unitGrams: 16, emoji: '🌰' }),

  F('olive_oil',      'Aceite de oliva',          'Olive oil',                   'fat', 884, 0,   0,   100,  { defaultGrams: 14,  unit: 'cda', unitGrams: 14, emoji: '🫒' }),
  F('coconut_oil',    'Aceite de coco',           'Coconut oil',                 'fat', 862, 0,   0,   100,  { defaultGrams: 14,  unit: 'cda', unitGrams: 14, emoji: '🥥' }),
  F('butter',         'Mantequilla',              'Butter',                      'fat', 717, 0.9, 0.1, 81,   { defaultGrams: 14,  unit: 'cda', unitGrams: 14, emoji: '🧈' }),
  F('mayo',           'Mayonesa',                 'Mayonnaise',                  'fat', 680, 1,   0.6, 75,   { defaultGrams: 15,  unit: 'cda', unitGrams: 15, emoji: '🥚' }),

  F('chia_seeds',     'Chía',                     'Chia seeds',                  'fat', 486, 17,  42,  31,   { defaultGrams: 15,  unit: 'cda', unitGrams: 15, emoji: '⚫' }),
  F('flax_seeds',     'Linaza',                   'Flax seeds',                  'fat', 534, 18,  29,  42,   { defaultGrams: 15,  unit: 'cda', unitGrams: 15, emoji: '⚫' }),

  // ─── DAIRY EXTRA ─────────────────────────────────────────────────────
  F('yogurt_natural', 'Yogurt natural',           'Plain yogurt',                'protein', 61, 3.5, 4.7, 3.3, { defaultGrams: 200, emoji: '🥛' }),
  F('yogurt_oikos',   'Oikos griego sabor',       'Greek yogurt (flavored)',     'protein', 100, 9, 12, 1.5, { defaultGrams: 150, emoji: '🥛' }),

  // ─── MEXICAN STAPLES ─────────────────────────────────────────────────
  F('frijoles_refritos','Frijoles refritos',      'Refried beans',               'carb', 138, 7,   17,  4.5,  { defaultGrams: 150, emoji: '🫘' }),
  F('arroz_mexicano', 'Arroz a la mexicana',      'Mexican rice',                'carb', 158, 3,   28,  3.7,  { defaultGrams: 150, emoji: '🍚' }),
  F('salsa_verde',    'Salsa verde',              'Green salsa',                 'veggie', 34, 1.5, 7,   0.3,  { defaultGrams: 60,  emoji: '🌶️' }),
  F('salsa_roja',     'Salsa roja',               'Red salsa',                   'veggie', 36, 1.6, 7.5, 0.4,  { defaultGrams: 60,  emoji: '🌶️' }),
  F('guacamole',      'Guacamole',                'Guacamole',                   'fat', 150, 2,   8,   13,   { defaultGrams: 60,  emoji: '🥑' }),
  F('mole',           'Mole poblano',             'Mole',                        'fat', 250, 7,   18,  17,   { defaultGrams: 80,  emoji: '🍫' }),
  F('elote',          'Elote',                    'Mexican corn (elote)',        'carb', 110, 3,   23,  2,    { unit: 'elote', unitGrams: 130, defaultGrams: 130, emoji: '🌽' }),
  F('nopal_grilled',  'Nopal asado',              'Grilled nopal',               'veggie', 16, 1.3, 3.3, 0.1,  { defaultGrams: 100, emoji: '🌵' }),
  F('chiles_jalap',   'Jalapeños',                'Jalapeños',                   'veggie', 28, 0.9, 6.5, 0.4,  { defaultGrams: 30,  emoji: '🌶️' }),
  F('limón',          'Limón',                    'Lime',                        'fruit', 30, 0.7, 11,  0.2,  { unit: 'limón', unitGrams: 60, defaultGrams: 60, emoji: '🍋' }),

  // ─── DRINKS ──────────────────────────────────────────────────────────
  F('coffee_black',   'Café negro',               'Black coffee',                'drink', 2,   0.3, 0,   0,    { defaultGrams: 240, emoji: '☕' }),
  F('coffee_milk',    'Café con leche',           'Coffee w/ milk',              'drink', 35,  2,   3.5, 1.5,  { defaultGrams: 240, emoji: '☕' }),
  F('orange_juice',   'Jugo de naranja',          'Orange juice',                'drink', 45,  0.7, 10,  0.2,  { defaultGrams: 250, emoji: '🍊' }),
  F('apple_juice',    'Jugo de manzana',          'Apple juice',                 'drink', 46,  0.1, 11,  0.1,  { defaultGrams: 250, emoji: '🧃' }),
  F('coke',           'Coca-Cola',                'Coca-Cola',                   'drink', 42,  0,   11,  0,    { defaultGrams: 355, unit: 'lata', unitGrams: 355, emoji: '🥤' }),
  F('coke_zero',      'Coca-Cola Zero',           'Coke Zero',                   'drink', 0,   0,   0,   0,    { defaultGrams: 355, unit: 'lata', unitGrams: 355, emoji: '🥤' }),
  F('beer',           'Cerveza',                  'Beer',                        'drink', 43,  0.5, 3.6, 0,    { defaultGrams: 355, unit: 'lata', unitGrams: 355, emoji: '🍺' }),
  F('wine_red',       'Vino tinto',               'Red wine',                    'drink', 85,  0.1, 2.6, 0,    { defaultGrams: 150, unit: 'copa', unitGrams: 150, emoji: '🍷' }),
  F('whiskey',        'Whiskey',                  'Whiskey',                     'drink', 250, 0,   0,   0,    { defaultGrams: 44,  unit: 'shot', unitGrams: 44, emoji: '🥃' }),
  F('agua_jamaica',   'Agua de jamaica',          'Hibiscus water',              'drink', 30,  0,   8,   0,    { defaultGrams: 250, unit: 'vaso', unitGrams: 250, emoji: '🥤' }),
  F('horchata',       'Horchata',                 'Horchata',                    'drink', 65,  0.5, 14,  0.6,  { defaultGrams: 250, unit: 'vaso', unitGrams: 250, emoji: '🥛' }),
  F('atole',          'Atole',                    'Atole',                       'drink', 80,  2,   17,  0.5,  { defaultGrams: 250, unit: 'taza', unitGrams: 250, emoji: '🥛' }),

  // ─── SNACKS / SWEETS ─────────────────────────────────────────────────
  F('chocolate_dark', 'Chocolate amargo 70%',     'Dark chocolate 70%',          'snack', 598, 7.8, 46,  43,   { defaultGrams: 30,  emoji: '🍫' }),
  F('chocolate_milk', 'Chocolate con leche',      'Milk chocolate',              'snack', 535, 7.6, 59,  30,   { defaultGrams: 30,  emoji: '🍫' }),
  F('chips_potato',   'Papitas',                  'Potato chips',                'snack', 536, 7,   53,  35,   { defaultGrams: 30,  emoji: '🥔' }),
  F('popcorn',        'Palomitas',                'Popcorn',                     'snack', 387, 12,  78,  4.5,  { defaultGrams: 30,  emoji: '🍿' }),
  F('ice_cream',      'Helado',                   'Ice cream',                   'snack', 207, 3.5, 24,  11,   { defaultGrams: 100, emoji: '🍦' }),
  F('honey',          'Miel',                     'Honey',                       'snack', 304, 0.3, 82,  0,    { defaultGrams: 21,  unit: 'cda', unitGrams: 21, emoji: '🍯' }),
  F('sugar',          'Azúcar',                   'Sugar',                       'snack', 387, 0,   100, 0,    { defaultGrams: 4,   unit: 'cdita', unitGrams: 4, emoji: '🍬' }),
  F('cookie',         'Galleta',                  'Cookie',                      'snack', 484, 5.7, 64,  22,   { defaultGrams: 16,  unit: 'galleta', unitGrams: 16, emoji: '🍪' }),

  // ─── FAST / RESTAURANT (approx) ──────────────────────────────────────
  F('pizza_slice',    'Pizza',                    'Pizza slice',                 'meal', 266, 11,  33,  10,   { unit: 'rebanada', unitGrams: 100, defaultGrams: 100, emoji: '🍕' }),
  F('burger',         'Hamburguesa',              'Cheeseburger',                'meal', 295, 17,  30,  14,   { unit: 'burger', unitGrams: 200, defaultGrams: 200, emoji: '🍔' }),
  F('taco_carne',     'Taco de carne',            'Beef taco',                   'meal', 226, 9,   20,  12,   { unit: 'taco', unitGrams: 90, defaultGrams: 180, emoji: '🌮' }),
  F('taco_pollo',     'Taco de pollo',            'Chicken taco',                'meal', 200, 12,  19,  9,    { unit: 'taco', unitGrams: 90, defaultGrams: 180, emoji: '🌮' }),
  F('burrito_carne',  'Burrito de carne',         'Beef burrito',                'meal', 215, 11,  27,  8,    { unit: 'burrito', unitGrams: 250, defaultGrams: 250, emoji: '🌯' }),
  F('quesadilla',     'Quesadilla',               'Quesadilla',                  'meal', 264, 11,  22,  15,   { unit: 'quesadilla', unitGrams: 120, defaultGrams: 120, emoji: '🫓' }),
  F('enchilada',      'Enchilada',                'Enchilada',                   'meal', 220, 9,   22,  12,   { unit: 'enchilada', unitGrams: 130, defaultGrams: 260, emoji: '🌮' }),
  F('chilaquiles',    'Chilaquiles',              'Chilaquiles',                 'meal', 200, 7,   24,  10,   { defaultGrams: 250, emoji: '🍳' }),
  F('huevos_rancheros','Huevos rancheros',        'Huevos rancheros',            'meal', 168, 9,   12,  9,    { defaultGrams: 250, emoji: '🍳' }),

  F('protein_shake',  'Batido de proteína',       'Protein shake',               'protein', 130, 24, 5,   1.5,  { defaultGrams: 300, unit: 'shake', unitGrams: 300, emoji: '🥛' }),
  F('mass_gainer',    'Mass gainer',              'Mass gainer',                 'protein', 380, 15, 70,  3,    { defaultGrams: 100, unit: 'scoop', unitGrams: 100, emoji: '💪' }),
  F('creatine',       'Creatina',                 'Creatine',                    'protein', 0,   0,  0,   0,    { defaultGrams: 5,   unit: 'scoop', unitGrams: 5, emoji: '💪' }),
]

// ─── Search helpers ──────────────────────────────────────────────────────
const STRIP_DIACRITICS = (s) => (s || '')
  .toString()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()

const FOODS_INDEX = FOODS.map((f) => ({
  ...f,
  _searchKey: STRIP_DIACRITICS(`${f.name} ${f.nameEn} ${f.category}`),
}))

export function searchFoods(query, limit = 12) {
  const q = STRIP_DIACRITICS(query.trim())
  if (!q) return []
  const tokens = q.split(/\s+/).filter(Boolean)
  const scored = []
  for (const f of FOODS_INDEX) {
    let score = 0
    for (const t of tokens) {
      const idx = f._searchKey.indexOf(t)
      if (idx === -1) { score = -1; break }
      // Higher score for prefix match in name
      if (STRIP_DIACRITICS(f.name).startsWith(t)) score += 100
      else if (STRIP_DIACRITICS(f.nameEn).startsWith(t)) score += 80
      else if (idx === 0) score += 60
      else score += 30 - Math.min(20, idx)
    }
    if (score > 0) scored.push({ f, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((x) => x.f)
}

// Compute macros for a given food + grams
export function macrosFor(food, grams) {
  const g = Math.max(0, Number(grams) || 0)
  const factor = g / 100
  return {
    grams: g,
    kcal: Math.round(food.per100.kcal * factor),
    p:    Math.round(food.per100.p    * factor * 10) / 10,
    c:    Math.round(food.per100.c    * factor * 10) / 10,
    f:    Math.round(food.per100.f    * factor * 10) / 10,
  }
}

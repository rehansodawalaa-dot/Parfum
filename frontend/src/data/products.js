/**
 * Sample product catalogue.
 * In production these come from the backend API.
 * Images use Unsplash for demo — replace with your CDN URLs.
 */
export const PRODUCTS = [
  {
    id: '1',
    slug: 'noir-absolu',
    name: 'Noir Absolu',
    brand: 'Maison Élite',
    category: 'men',
    fragranceType: 'woody',
    price: 8500,
    originalPrice: 10000,
    rating: 4.8,
    reviewCount: 124,
    isBestSeller: true,
    isNew: false,
    sizes: ['30ml', '50ml', '100ml'],
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    ],
    notes: {
      top:    ['Bergamot', 'Black Pepper', 'Cardamom'],
      middle: ['Oud', 'Vetiver', 'Leather'],
      base:   ['Sandalwood', 'Musk', 'Amber'],
    },
    description:
      'A bold, commanding fragrance that opens with spiced citrus and settles into a rich, smoky oud heart. Noir Absolu is the scent of quiet confidence.',
    brandStory:
      'Maison Élite was founded in Grasse, France in 1987 by master perfumer Étienne Moreau. Every bottle is hand-filled and numbered.',
  },
  {
    id: '2',
    slug: 'rose-eternelle',
    name: 'Rose Éternelle',
    brand: 'Fleur de Paris',
    category: 'women',
    fragranceType: 'floral',
    price: 7200,
    originalPrice: 7200,
    rating: 4.9,
    reviewCount: 218,
    isBestSeller: true,
    isNew: false,
    sizes: ['30ml', '50ml', '100ml'],
    images: [
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80',
      'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80',
    ],
    notes: {
      top:    ['Lychee', 'Peach', 'Pink Pepper'],
      middle: ['Bulgarian Rose', 'Peony', 'Jasmine'],
      base:   ['White Musk', 'Cedarwood', 'Vanilla'],
    },
    description:
      'An ode to the eternal rose. Delicate yet enduring, Rose Éternelle captures the dewy freshness of a rose garden at dawn.',
    brandStory:
      'Fleur de Paris sources its roses exclusively from the Vallée de la Rose in Bulgaria, harvested by hand each May.',
  },
  {
    id: '3',
    slug: 'soleil-dore',
    name: 'Soleil Doré',
    brand: 'Lumière',
    category: 'unisex',
    fragranceType: 'citrus',
    price: 6400,
    originalPrice: 8000,
    rating: 4.7,
    reviewCount: 89,
    isBestSeller: false,
    isNew: true,
    sizes: ['50ml', '100ml'],
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
      'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80',
    ],
    notes: {
      top:    ['Sicilian Lemon', 'Grapefruit', 'Neroli'],
      middle: ['Ylang-Ylang', 'Iris', 'White Tea'],
      base:   ['Vetiver', 'Benzoin', 'Cashmeran'],
    },
    description:
      'Sunlight bottled. A radiant citrus fragrance that evolves into a warm, powdery drydown — perfect for any season.',
    brandStory:
      'Lumière was born from a desire to capture fleeting moments of beauty. Each fragrance is a snapshot of a specific time and place.',
  },
  {
    id: '4',
    slug: 'velvet-oud',
    name: 'Velvet Oud',
    brand: 'Maison Élite',
    category: 'premium',
    fragranceType: 'woody',
    price: 18500,
    originalPrice: 18500,
    rating: 5.0,
    reviewCount: 47,
    isBestSeller: false,
    isNew: false,
    sizes: ['50ml', '100ml'],
    images: [
      'https://images.unsplash.com/photo-1590156562745-5d5e0a5e5e5e?w=800&q=80',
      'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80',
    ],
    notes: {
      top:    ['Saffron', 'Rose', 'Cinnamon'],
      middle: ['Agarwood (Oud)', 'Patchouli', 'Labdanum'],
      base:   ['Ambergris', 'Benzoin', 'Sandalwood'],
    },
    description:
      'The pinnacle of our collection. Velvet Oud uses rare Cambodian agarwood aged for over a decade, resulting in an unparalleled depth and complexity.',
    brandStory:
      'Maison Élite was founded in Grasse, France in 1987 by master perfumer Étienne Moreau. Every bottle is hand-filled and numbered.',
  },
  {
    id: '5',
    slug: 'jardin-blanc',
    name: 'Jardin Blanc',
    brand: 'Fleur de Paris',
    category: 'women',
    fragranceType: 'floral',
    price: 5900,
    originalPrice: 5900,
    rating: 4.6,
    reviewCount: 156,
    isBestSeller: false,
    isNew: true,
    sizes: ['30ml', '50ml', '100ml'],
    images: [
      'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80',
    ],
    notes: {
      top:    ['Aldehydes', 'Bergamot', 'Green Leaves'],
      middle: ['Gardenia', 'Tuberose', 'Lily of the Valley'],
      base:   ['Musk', 'Oakmoss', 'Tonka Bean'],
    },
    description:
      'A walk through a white garden in full bloom. Clean, luminous, and effortlessly elegant.',
    brandStory:
      'Fleur de Paris sources its roses exclusively from the Vallée de la Rose in Bulgaria, harvested by hand each May.',
  },
  {
    id: '6',
    slug: 'bois-sacre',
    name: 'Bois Sacré',
    brand: 'Lumière',
    category: 'unisex',
    fragranceType: 'woody',
    price: 9800,
    originalPrice: 12000,
    rating: 4.8,
    reviewCount: 73,
    isBestSeller: true,
    isNew: false,
    sizes: ['50ml', '100ml'],
    images: [
      'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    ],
    notes: {
      top:    ['Juniper Berry', 'Elemi', 'Pink Pepper'],
      middle: ['Cedarwood', 'Guaiac Wood', 'Incense'],
      base:   ['Labdanum', 'Vetiver', 'Castoreum'],
    },
    description:
      'Sacred woods from four continents converge in this meditative, grounding fragrance. Wear it as armour or as prayer.',
    brandStory:
      'Lumière was born from a desire to capture fleeting moments of beauty. Each fragrance is a snapshot of a specific time and place.',
  },
  {
    id: '7',
    slug: 'aqua-imperiale',
    name: 'Aqua Impériale',
    brand: 'Maison Élite',
    category: 'men',
    fragranceType: 'citrus',
    price: 7600,
    originalPrice: 7600,
    rating: 4.5,
    reviewCount: 92,
    isBestSeller: false,
    isNew: false,
    sizes: ['30ml', '50ml', '100ml'],
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
      'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80',
    ],
    notes: {
      top:    ['Yuzu', 'Mandarin', 'Sea Salt'],
      middle: ['Aquatic Notes', 'Geranium', 'Lavender'],
      base:   ['Driftwood', 'Ambrette', 'White Musk'],
    },
    description:
      'Crisp, marine, and effortlessly refined. Aqua Impériale is the scent of a Mediterranean morning.',
    brandStory:
      'Maison Élite was founded in Grasse, France in 1987 by master perfumer Étienne Moreau. Every bottle is hand-filled and numbered.',
  },
  {
    id: '8',
    slug: 'ambre-royal',
    name: 'Ambre Royal',
    brand: 'Lumière',
    category: 'premium',
    fragranceType: 'oriental',
    price: 14200,
    originalPrice: 16000,
    rating: 4.9,
    reviewCount: 61,
    isBestSeller: true,
    isNew: false,
    sizes: ['50ml', '100ml'],
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
      'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80',
    ],
    notes: {
      top:    ['Bergamot', 'Cardamom', 'Coriander'],
      middle: ['Amber', 'Rose', 'Jasmine'],
      base:   ['Benzoin', 'Vanilla', 'Musk'],
    },
    description:
      'Warm, opulent, and deeply sensual. Ambre Royal is a golden embrace that lingers long after you leave the room.',
    brandStory:
      'Lumière was born from a desire to capture fleeting moments of beauty. Each fragrance is a snapshot of a specific time and place.',
  },
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'Noir Absolu is unlike anything I have ever worn. The oud is rich without being overwhelming. I receive compliments every single time.',
    product: 'Noir Absolu',
    avatar: 'PS',
  },
  {
    id: 2,
    name: 'Arjun Mehta',
    location: 'Delhi',
    rating: 5,
    text: 'The packaging alone is worth the price. But the fragrance — Rose Éternelle — is genuinely one of the most beautiful things I have ever smelled.',
    product: 'Rose Éternelle',
    avatar: 'AM',
  },
  {
    id: 3,
    name: 'Kavya Nair',
    location: 'Bangalore',
    rating: 5,
    text: 'Velvet Oud is my signature scent now. The longevity is incredible — 12+ hours on skin. Worth every rupee.',
    product: 'Velvet Oud',
    avatar: 'KN',
  },
  {
    id: 4,
    name: 'Rohan Desai',
    location: 'Pune',
    rating: 4,
    text: 'Soleil Doré is my go-to for summer. Light, fresh, and sophisticated. The citrus opening is absolutely stunning.',
    product: 'Soleil Doré',
    avatar: 'RD',
  },
];

export const CATEGORIES = [
  { id: 'men',     label: 'For Him',    description: 'Bold, refined masculinity', emoji: '♂' },
  { id: 'women',   label: 'For Her',    description: 'Delicate, enduring femininity', emoji: '♀' },
  { id: 'unisex',  label: 'Unisex',     description: 'Beyond boundaries', emoji: '◎' },
  { id: 'premium', label: 'Premium',    description: 'Rare & exceptional', emoji: '✦' },
];

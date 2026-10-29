/* =============================================================
   DATA — единственный источник правды для проектов.
   Правишь здесь → обновляется главная, архив и модалки.

   Поля:
     slug      — URL-идентификатор (?project=slug), латиница, без пробелов
     cat       — 'branding' | 'illustration' | 'web'  (можно массив)
     year      — год
     featured  — true → попадает в блок Top Projects на главной
     title     — { ru, en }
     client    — { ru, en }
     role      — { ru, en }
     desc      — { ru, en }  краткое описание, 1–3 предложения
     external  — ссылка «подробнее» (Behance / Dprofile / сайт)
     cover     — обложка для карточки
     images    — массив визуалов кейса (masonry)
   ============================================================= */

const IMG = (slug, n) =>
  Array.from({ length: n }, (_, i) => `assets/img/projects/${slug}/${String(i).padStart(2, '0')}.jpg`);

const PROJECTS = [
  {
    slug: 'nocturne-label',
    cat: 'branding',
    year: 2026,
    featured: true,
    title: { ru: 'NOCTURNE', en: 'NOCTURNE' },
    subtitle: { ru: 'Аудиолейбл · айдентика', en: 'Audio label · identity' },
    client: { ru: 'Nocturne Records', en: 'Nocturne Records' },
    role: { ru: 'Арт-дирекшн, айдентика, обложки', en: 'Art direction, identity, covers' },
    desc: {
      ru: 'Айдентика для лейбла экспериментальной электроники. Готический леттеринг, неоновая палитра и система обложек, которая держит узнаваемость на любом носителе — от релизов до сцены.',
      en: 'Identity for an experimental electronic label. Gothic lettering, a neon palette, and a cover system that stays recognisable on every surface — from releases to stage.'
    },
    external: 'https://www.behance.net/nnzuzu5f5d',
    cover: 'assets/img/projects/nocturne-label/00.jpg',
    images: IMG('nocturne-label', 10)
  },
  {
    slug: 'hyperline-fest',
    cat: 'branding',
    year: 2025,
    featured: true,
    title: { ru: 'HYPERLINE', en: 'HYPERLINE' },
    subtitle: { ru: 'Фестиваль · визуальная система', en: 'Festival · visual system' },
    client: { ru: 'Hyperline Festival', en: 'Hyperline Festival' },
    role: { ru: 'Концепция, типографика, poster-система', en: 'Concept, typography, poster system' },
    desc: {
      ru: 'Визуальный язык фестиваля, построенный на столкновении хрома и фиолетового свечения. Один модуль — десятки постеров, которые работают и в сторис, и на билборде.',
      en: 'A festival visual language built on the collision of chrome and violet glow. One module — dozens of posters that work in stories and on billboards alike.'
    },
    external: 'https://www.behance.net/nnzuzu5f5d',
    cover: 'assets/img/projects/hyperline-fest/00.jpg',
    images: IMG('hyperline-fest', 9)
  },
  {
    slug: 'snor-miracle',
    cat: 'illustration',
    year: 2026,
    featured: true,
    title: { ru: 'SNOR: MIRACLE', en: 'SNOR: MIRACLE' },
    subtitle: { ru: 'Серия плакатов', en: 'Poster series' },
    client: { ru: 'Snor Studio', en: 'Snor Studio' },
    role: { ru: 'Иллюстрация, 3D, композиция', en: 'Illustration, 3D, composition' },
    desc: {
      ru: 'Серия из шести плакатов о мифических существах в жидком металле. Хромированная скульптура, ледяная палитра и типографика как часть изображения, а не подпись к нему.',
      en: 'Six posters about mythical creatures in liquid metal. Chrome sculpture, an ice palette, and typography treated as part of the image rather than a caption.'
    },
    external: 'https://dprofile.ru/nat_slatvitskaya',
    cover: 'assets/img/projects/snor-miracle/00.jpg',
    images: IMG('snor-miracle', 10)
  },
  {
    slug: 'liquid-glass-ui',
    cat: 'web',
    year: 2025,
    featured: true,
    title: { ru: 'LIQUID GLASS', en: 'LIQUID GLASS' },
    subtitle: { ru: 'UI-кит · дизайн-система', en: 'UI kit · design system' },
    client: { ru: 'Self-initiated', en: 'Self-initiated' },
    role: { ru: 'Продуктовый дизайн, компоненты', en: 'Product design, components' },
    desc: {
      ru: 'Исследование стеклянных поверхностей в интерфейсе: как не превратить аккуратную систему в кашу из блюров. 40+ компонентов, состояния, токены.',
      en: 'A study of glass surfaces in interfaces: how not to turn a tidy system into a blurry mess. 40+ components, states, tokens.'
    },
    external: 'https://dprofile.ru/nat_slatvitskaya',
    cover: 'assets/img/projects/liquid-glass-ui/00.jpg',
    images: IMG('liquid-glass-ui', 8)
  },
  {
    slug: 'midnight-door',
    cat: 'illustration',
    year: 2024,
    featured: true,
    title: { ru: 'MIDNIGHT', en: 'MIDNIGHT' },
    subtitle: { ru: 'Плакат-серия для клуба', en: 'Poster series for a club' },
    client: { ru: 'Midnight Club', en: 'Midnight Club' },
    role: { ru: 'Иллюстрация, леттеринг', en: 'Illustration, lettering' },
    desc: {
      ru: 'Хэллоуин-кампания клуба: готическая арка, розово-фиолетовый неон и ручной леттеринг. Серия, которую узнают по силуэту даже без логотипа.',
      en: 'The club\u2019s Halloween campaign: a gothic arch, pink-violet neon, and hand lettering. A series recognised by silhouette alone, no logo needed.'
    },
    external: 'https://www.behance.net/nnzuzu5f5d',
    cover: 'assets/img/projects/midnight-door/01.jpg',
    images: IMG('midnight-door', 9)
  },
  {
    slug: 'atlas-mobility',
    cat: 'web',
    year: 2026,
    featured: true,
    title: { ru: 'ATLAS', en: 'ATLAS' },
    subtitle: { ru: 'Сайт сервиса мобильности', en: 'Mobility service site' },
    client: { ru: 'Atlas Mobility', en: 'Atlas Mobility' },
    role: { ru: 'UX/UI, арт-дирекшн, прототип', en: 'UX/UI, art direction, prototype' },
    desc: {
      ru: 'Промо-сайт транспортного сервиса: холодный металл, строгая сетка и один акцент, который ведёт по странице. Без стоковых улыбок и без инфографики из шаблона.',
      en: 'A promo site for a transport service: cold metal, a strict grid, and a single accent that guides you down the page. No stock smiles, no template infographics.'
    },
    external: 'https://dprofile.ru/nat_slatvitskaya',
    cover: 'assets/img/projects/atlas-mobility/00.jpg',
    images: IMG('atlas-mobility', 9)
  },

  /* ---------- архив: проекты вне Top-6 ---------- */
  {
    slug: 'brunswick-coffee',
    cat: 'branding',
    year: 2024,
    featured: false,
    title: { ru: 'BRUNSWICK', en: 'BRUNSWICK' },
    subtitle: { ru: 'Кофейня · айдентика', en: 'Coffee roasters · identity' },
    client: { ru: 'Brunswick Coffee', en: 'Brunswick Coffee' },
    role: { ru: 'Айдентика, упаковка', en: 'Identity, packaging' },
    desc: {
      ru: 'Айдентика обжарочной кофейни: глубокий зелёный, плотная типографика и упаковка, которую хочется держать в руках.',
      en: 'Identity for a coffee roastery: deep green, dense typography, and packaging you want to hold.'
    },
    external: 'https://www.behance.net/nnzuzu5f5d',
    cover: 'assets/img/projects/brunswick-coffee/00.jpg',
    images: IMG('brunswick-coffee', 7)
  },
  {
    slug: 'polar-materials',
    cat: 'branding',
    year: 2023,
    featured: false,
    title: { ru: 'POLAR', en: 'POLAR' },
    subtitle: { ru: 'Материалы · фирменный стиль', en: 'Materials · brand system' },
    client: { ru: 'Polar Materials', en: 'Polar Materials' },
    role: { ru: 'Бренд-система, гайдлайн', en: 'Brand system, guidelines' },
    desc: {
      ru: 'Холодная айдентика для производителя материалов: ледяная шкала, металлические градиенты и строгая сетка для каталогов.',
      en: 'A cold identity for a materials manufacturer: an ice scale, metallic gradients, and a strict grid for catalogues.'
    },
    external: 'https://dprofile.ru/nat_slatvitskaya',
    cover: 'assets/img/projects/polar-materials/00.jpg',
    images: IMG('polar-materials', 7)
  },
  {
    slug: 'chrome-oracle',
    cat: 'illustration',
    year: 2025,
    featured: false,
    title: { ru: 'CHROME ORACLE', en: 'CHROME ORACLE' },
    subtitle: { ru: 'Обложки для релизов', en: 'Release covers' },
    client: { ru: 'Various', en: 'Various' },
    role: { ru: 'Иллюстрация, 3D', en: 'Illustration, 3D' },
    desc: {
      ru: 'Серия обложек, где жидкий металл становится персонажем. Один материал, разная температура — от ледяной до раскалённой.',
      en: 'A cover series where liquid metal becomes the character. One material, different temperatures — from icy to molten.'
    },
    external: 'https://www.behance.net/nnzuzu5f5d',
    cover: 'assets/img/projects/chrome-oracle/00.jpg',
    images: IMG('chrome-oracle', 7)
  },
  {
    slug: 'orbital-archive',
    cat: 'illustration',
    year: 2023,
    featured: false,
    title: { ru: 'ORBITAL', en: 'ORBITAL' },
    subtitle: { ru: 'Архив иллюстраций', en: 'Illustration archive' },
    client: { ru: 'Personal', en: 'Personal' },
    role: { ru: 'Иллюстрация', en: 'Illustration' },
    desc: {
      ru: 'Личный архив орбитальных форм: кольца, спирали и фиолетовое свечение. Исследование того, как простая геометрия держит взгляд.',
      en: 'A personal archive of orbital forms: rings, spirals, and violet glow. A study of how simple geometry holds attention.'
    },
    external: 'https://dprofile.ru/nat_slatvitskaya',
    cover: 'assets/img/projects/orbital-archive/00.jpg',
    images: IMG('orbital-archive', 7)
  },
  {
    slug: 'syntax-zero',
    cat: 'web',
    year: 2025,
    featured: false,
    title: { ru: 'SYNTAX ZERO', en: 'SYNTAX ZERO' },
    subtitle: { ru: 'Промо-сайт продукта', en: 'Product promo site' },
    client: { ru: 'Syntax Zero', en: 'Syntax Zero' },
    role: { ru: 'Веб-дизайн, лэндинг', en: 'Web design, landing' },
    desc: {
      ru: 'Одностраничник для dev-инструмента: терминальная эстетика, кислотный акцент и почти нулевой вес.',
      en: 'A one-pager for a dev tool: terminal aesthetics, an acid accent, and near-zero weight.'
    },
    external: 'https://dprofile.ru/nat_slatvitskaya',
    cover: 'assets/img/projects/syntax-zero/00.jpg',
    images: IMG('syntax-zero', 7)
  },
  {
    slug: 'neon-botany',
    cat: 'illustration',
    year: 2024,
    featured: false,
    title: { ru: 'NEON BOTANY', en: 'NEON BOTANY' },
    subtitle: { ru: 'Ботаническая серия', en: 'Botanical series' },
    client: { ru: 'Personal', en: 'Personal' },
    role: { ru: 'Иллюстрация, композиция', en: 'Illustration, composition' },
    desc: {
      ru: 'Растения, которых не существует: металлические лепестки, розовое свечение и симметрия, доведённая до предела.',
      en: 'Plants that don\u2019t exist: metallic petals, pink glow, and symmetry pushed to the limit.'
    },
    external: 'https://www.behance.net/nnzuzu5f5d',
    cover: 'assets/img/projects/neon-botany/00.jpg',
    images: IMG('neon-botany', 7)
  },
  {
    slug: 'arcade-desk',
    cat: 'web',
    year: 2024,
    featured: false,
    title: { ru: 'ARCADE DESK', en: 'ARCADE DESK' },
    subtitle: { ru: 'Интерфейс-концепт', en: 'Interface concept' },
    client: { ru: 'Concept', en: 'Concept' },
    role: { ru: 'UI-концепт, прототип', en: 'UI concept, prototype' },
    desc: {
      ru: 'Концепт рабочего стола в эстетике аркадного автомата: окна, вкладки и жёсткие тени как интерфейсный язык.',
      en: 'A desktop concept in arcade-cabinet aesthetics: windows, tabs, and hard shadows as an interface language.'
    },
    external: 'https://dprofile.ru/nat_slatvitskaya',
    cover: 'assets/img/projects/arcade-desk/00.jpg',
    images: IMG('arcade-desk', 7)
  },
  {
    slug: 'emerald-riot',
    cat: 'branding',
    year: 2023,
    featured: false,
    title: { ru: 'EMERALD RIOT', en: 'EMERALD RIOT' },
    subtitle: { ru: 'Айдентика', en: 'Identity' },
    client: { ru: 'Emerald Riot', en: 'Emerald Riot' },
    role: { ru: 'Айдентика, типографика', en: 'Identity, typography' },
    desc: {
      ru: 'Айдентика для музыкального коллектива: изумрудный неон, кислотная зелень и намеренная грубость форм.',
      en: 'Identity for a music collective: emerald neon, acid green, and deliberately rough forms.'
    },
    external: 'https://www.behance.net/nnzuzu5f5d',
    cover: 'assets/img/projects/emerald-riot/00.jpg',
    images: IMG('emerald-riot', 7)
  },
  {
    slug: 'signal-decay',
    cat: 'web',
    year: 2026,
    featured: false,
    title: { ru: 'SIGNAL DECAY', en: 'SIGNAL DECAY' },
    subtitle: { ru: 'Цифровой опыт', en: 'Digital experience' },
    client: { ru: 'Signal Decay', en: 'Signal Decay' },
    role: { ru: 'Дизайн, интерактив', en: 'Design, interaction' },
    desc: {
      ru: 'Экспериментальный цифровой опыт о потере сигнала: глитчи, распад формы и типографика, которая не держится на месте.',
      en: 'An experimental digital piece about signal loss: glitches, form decay, and type that refuses to stay put.'
    },
    external: 'https://dprofile.ru/nat_slatvitskaya',
    cover: 'assets/img/projects/signal-decay/00.jpg',
    images: IMG('signal-decay', 7)
  },
  {
    slug: 'velvet-circuit',
    cat: 'branding',
    year: 2022,
    featured: false,
    title: { ru: 'VELVET CIRCUIT', en: 'VELVET CIRCUIT' },
    subtitle: { ru: 'Айдентика студии', en: 'Studio identity' },
    client: { ru: 'Velvet Circuit', en: 'Velvet Circuit' },
    role: { ru: 'Айдентика, арт-дирекшн', en: 'Identity, art direction' },
    desc: {
      ru: 'Мягкая, но технологичная айдентика студии: бордовый с магентой, тонкие линии и ощущение дорогого пластика.',
      en: 'A soft yet technological studio identity: burgundy with magenta, thin lines, and the feel of expensive plastic.'
    },
    external: 'https://www.behance.net/nnzuzu5f5d',
    cover: 'assets/img/projects/velvet-circuit/00.jpg',
    images: IMG('velvet-circuit', 7)
  },
  {
    slug: 'monolith-type',
    cat: 'illustration',
    year: 2022,
    featured: false,
    title: { ru: 'MONOLITH', en: 'MONOLITH' },
    subtitle: { ru: 'Шрифтовые композиции', en: 'Type compositions' },
    client: { ru: 'Personal', en: 'Personal' },
    role: { ru: 'Леттеринг, композиция', en: 'Lettering, composition' },
    desc: {
      ru: 'Серия шрифтовых плакатов: тяжёлые формы, минимум цвета и максимум давления на букву.',
      en: 'A series of type posters: heavy forms, minimal colour, and maximum pressure on the letter.'
    },
    external: 'https://dprofile.ru/nat_slatvitskaya',
    cover: 'assets/img/projects/monolith-type/00.jpg',
    images: IMG('monolith-type', 7)
  }
];

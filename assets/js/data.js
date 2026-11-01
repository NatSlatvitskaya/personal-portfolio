/* =============================================================
   DATA — единственный источник правды для проектов.
   Правишь здесь → обновляется главная, архив и модалки.

   Поля:
     slug      — URL-идентификатор (?project=slug)
     cat       — 'branding' | 'illustration' | 'web'
     year      — год
     featured  — true → попадает в кольцо на главной (8 мест)
     title     — { ru, en }  короткое имя для карточки, до ~14 знаков
     full      — { ru, en }  полное название для модалки (опционально)
     desc      — { ru, en }  краткое описание, 1–3 предложения
     external  — ссылка «Подробнее» (Behance / Dprofile)
     cover     — обложка; null → рисуется типографическая заглушка
     images    — массив визуалов кейса (masonry)
   ============================================================= */

const IMG = (slug, n) =>
  Array.from({ length: n }, (_, i) => `assets/img/projects/${slug}/${String(i).padStart(2, '0')}.jpg`);

const PROJECTS = [
  /* ---------- кольцо на главной (порядок = порядок в кольце) ---------- */
  {
    slug: 'nocturne',
    cat: 'branding',
    year: 2026,
    featured: true,
    title: { ru: 'NOCTURNE', en: 'NOCTURNE' },
    full: { ru: 'NOCTURNE — аудиолейбл', en: 'NOCTURNE — Audio Label' },
    desc: {
      ru: 'Айдентика для лейбла экспериментальной электроники. Готический леттеринг, неоновая палитра и система обложек, которая держит узнаваемость на любом носителе.',
      en: 'Identity for an experimental electronic label. Gothic lettering, a neon palette, and a cover system that stays recognisable on every surface.'
    },
    external: 'https://www.behance.net/nnzuzu5f5d',
    cover: 'assets/img/projects/nocturne-label/00.jpg',
    images: IMG('nocturne-label', 10)
  },
  {
    slug: 'name-8',
    cat: 'branding',
    year: 2026,
    featured: true,
    title: { ru: 'NAME 8', en: 'NAME 8' },
    full: { ru: 'NAME 8', en: 'NAME 8' },
    desc: { ru: 'Проект в работе. Описание появится позже.', en: 'Work in progress. Description coming soon.' },
    external: 'https://www.behance.net/nnzuzu5f5d',
    cover: null,
    images: []
  },
  {
    slug: 'name-1',
    cat: 'branding',
    year: 2025,
    featured: true,
    title: { ru: 'NAME 1', en: 'NAME 1' },
    full: { ru: 'NAME 1', en: 'NAME 1' },
    desc: { ru: 'Проект в работе. Описание появится позже.', en: 'Work in progress. Description coming soon.' },
    external: 'https://www.behance.net/nnzuzu5f5d',
    cover: null,
    images: []
  },
  {
    slug: 'memoria',
    cat: 'illustration',
    year: 2025,
    featured: true,
    title: { ru: 'MEMORIA', en: 'MEMORIA' },
    full: { ru: 'MEMORIA — серия обложек', en: 'MEMORIA — Cover Series' },
    desc: {
      ru: 'Серия обложек о памяти как о физическом объекте: книги, архив, пыль. Монохром, тяжёлый свет и ощущение бумаги на экране.',
      en: 'A cover series about memory as a physical object: books, archive, dust. Monochrome, heavy light, and the feel of paper on a screen.'
    },
    external: 'https://www.behance.net/nnzuzu5f5d',
    cover: 'assets/img/projects/midnight-door/01.jpg',
    images: IMG('midnight-door', 9)
  },
  {
    slug: 'smarty',
    cat: 'illustration',
    year: 2025,
    featured: true,
    title: { ru: 'SMARTY', en: 'SMARTY' },
    full: { ru: 'SMARTY — иллюстрации', en: 'SMARTY — Illustrations' },
    desc: {
      ru: 'Иллюстративный набор для бренда: предметы, у которых есть характер. Светлая графика с плотной тенью и точным юмором.',
      en: 'An illustration set for a brand: objects with attitude. Light graphics with dense shadow and precise humour.'
    },
    external: 'https://dprofile.ru/nat_slatvitskaya',
    cover: 'assets/img/projects/snor-miracle/00.jpg',
    images: IMG('snor-miracle', 10)
  },
  {
    slug: 'slet',
    cat: 'branding',
    year: 2024,
    featured: true,
    title: { ru: 'СЛЕТ', en: 'SLET' },
    full: { ru: 'СЛЕТ — айдентика фестиваля', en: 'SLET — Festival Identity' },
    desc: {
      ru: 'Айдентика фестиваля на стыке хрома и фиолетового свечения. Один модуль — десятки носителей, от билборда до сторис.',
      en: 'Festival identity at the junction of chrome and violet glow. One module — dozens of surfaces, from billboard to stories.'
    },
    external: 'https://www.behance.net/nnzuzu5f5d',
    cover: 'assets/img/projects/hyperline-fest/01.jpg',
    images: IMG('hyperline-fest', 9)
  },
  {
    slug: 'name-4',
    cat: 'web',
    year: 2024,
    featured: true,
    title: { ru: 'NAME 4', en: 'NAME 4' },
    full: { ru: 'NAME 4', en: 'NAME 4' },
    desc: { ru: 'Проект в работе. Описание появится позже.', en: 'Work in progress. Description coming soon.' },
    external: 'https://dprofile.ru/nat_slatvitskaya',
    cover: null,
    images: []
  },
  {
    slug: 'name-7',
    cat: 'web',
    year: 2024,
    featured: true,
    title: { ru: 'NAME 7', en: 'NAME 7' },
    full: { ru: 'NAME 7', en: 'NAME 7' },
    desc: { ru: 'Проект в работе. Описание появится позже.', en: 'Work in progress. Description coming soon.' },
    external: 'https://dprofile.ru/nat_slatvitskaya',
    cover: null,
    images: []
  },

  /* ---------- архив: проекты вне кольца ---------- */
  {
    slug: 'liquid-glass',
    cat: 'web',
    year: 2025,
    featured: false,
    title: { ru: 'LIQUID GLASS', en: 'LIQUID GLASS' },
    full: { ru: 'LIQUID GLASS — UI-кит', en: 'LIQUID GLASS — UI Kit' },
    desc: {
      ru: 'Исследование стеклянных поверхностей в интерфейсе: как не превратить аккуратную систему в кашу из блюров. 40+ компонентов, состояния, токены.',
      en: 'A study of glass surfaces in interfaces: how not to turn a tidy system into a blurry mess. 40+ components, states, tokens.'
    },
    external: 'https://dprofile.ru/nat_slatvitskaya',
    cover: 'assets/img/projects/liquid-glass-ui/00.jpg',
    images: IMG('liquid-glass-ui', 8)
  },
  {
    slug: 'atlas',
    cat: 'web',
    year: 2026,
    featured: false,
    title: { ru: 'ATLAS', en: 'ATLAS' },
    full: { ru: 'ATLAS — сайт мобильности', en: 'ATLAS — Mobility Site' },
    desc: {
      ru: 'Промо-сайт транспортного сервиса: холодный металл, строгая сетка и один акцент, который ведёт по странице.',
      en: 'A promo site for a transport service: cold metal, a strict grid, and a single accent that guides you down the page.'
    },
    external: 'https://dprofile.ru/nat_slatvitskaya',
    cover: 'assets/img/projects/atlas-mobility/00.jpg',
    images: IMG('atlas-mobility', 9)
  },
  {
    slug: 'brunswick',
    cat: 'branding',
    year: 2024,
    featured: false,
    title: { ru: 'BRUNSWICK', en: 'BRUNSWICK' },
    full: { ru: 'BRUNSWICK — кофейня', en: 'BRUNSWICK — Coffee Roasters' },
    desc: {
      ru: 'Айдентика обжарочной кофейни: глубокий зелёный, плотная типографика и упаковка, которую хочется держать в руках.',
      en: 'Identity for a coffee roastery: deep green, dense typography, and packaging you want to hold.'
    },
    external: 'https://www.behance.net/nnzuzu5f5d',
    cover: 'assets/img/projects/brunswick-coffee/00.jpg',
    images: IMG('brunswick-coffee', 7)
  },
  {
    slug: 'polar',
    cat: 'branding',
    year: 2023,
    featured: false,
    title: { ru: 'POLAR', en: 'POLAR' },
    full: { ru: 'POLAR — материалы', en: 'POLAR — Materials' },
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
    full: { ru: 'CHROME ORACLE — обложки', en: 'CHROME ORACLE — Covers' },
    desc: {
      ru: 'Серия обложек, где жидкий металл становится персонажем. Один материал, разная температура — от ледяной до раскалённой.',
      en: 'A cover series where liquid metal becomes the character. One material, different temperatures — from icy to molten.'
    },
    external: 'https://www.behance.net/nnzuzu5f5d',
    cover: 'assets/img/projects/chrome-oracle/00.jpg',
    images: IMG('chrome-oracle', 7)
  },
  {
    slug: 'orbital',
    cat: 'illustration',
    year: 2023,
    featured: false,
    title: { ru: 'ORBITAL', en: 'ORBITAL' },
    full: { ru: 'ORBITAL — архив иллюстраций', en: 'ORBITAL — Illustration Archive' },
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
    full: { ru: 'SYNTAX ZERO — промо-сайт', en: 'SYNTAX ZERO — Promo Site' },
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
    full: { ru: 'NEON BOTANY — ботаническая серия', en: 'NEON BOTANY — Botanical Series' },
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
    full: { ru: 'ARCADE DESK — интерфейс-концепт', en: 'ARCADE DESK — Interface Concept' },
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
    full: { ru: 'EMERALD RIOT — айдентика', en: 'EMERALD RIOT — Identity' },
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
    full: { ru: 'SIGNAL DECAY — цифровой опыт', en: 'SIGNAL DECAY — Digital Experience' },
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
    full: { ru: 'VELVET CIRCUIT — айдентика', en: 'VELVET CIRCUIT — Identity' },
    desc: {
      ru: 'Мягкая, но технологичная айдентика студии: бордовый с магентой, тонкие линии и ощущение дорогого пластика.',
      en: 'A soft yet technological studio identity: burgundy with magenta, thin lines, and the feel of expensive plastic.'
    },
    external: 'https://www.behance.net/nnzuzu5f5d',
    cover: 'assets/img/projects/velvet-circuit/00.jpg',
    images: IMG('velvet-circuit', 7)
  },
  {
    slug: 'monolith',
    cat: 'illustration',
    year: 2022,
    featured: false,
    title: { ru: 'MONOLITH', en: 'MONOLITH' },
    full: { ru: 'MONOLITH — шрифтовые композиции', en: 'MONOLITH — Type Compositions' },
    desc: {
      ru: 'Серия шрифтовых плакатов: тяжёлые формы, минимум цвета и максимум давления на букву.',
      en: 'A series of type posters: heavy forms, minimal colour, and maximum pressure on the letter.'
    },
    external: 'https://dprofile.ru/nat_slatvitskaya',
    cover: 'assets/img/projects/monolith-type/00.jpg',
    images: IMG('monolith-type', 7)
  }
];

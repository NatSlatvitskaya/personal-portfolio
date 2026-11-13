/* =============================================================
   I18N — тексты интерфейса (данные проектов живут в data.js)
   ============================================================= */

const I18N = {
  ru: {
    'meta.title': 'Наталья Слатвицкая — графический и бренд-дизайнер',
    'meta.desc': 'Портфолио: брендинг, иллюстрация, веб-дизайн. 6 лет опыта.',

    /* верхняя строка */
    'top.all': 'Все проекты',
    'top.hello': 'Привет, Я — Наташа',
    'top.role': '{графический и бренд-дизайнер}',
    'top.exp': '6 лет опыта',

    /* телефон */
    'phone.msg1': 'Connect...',
    'phone.msg2': 'Text me',
    'phone.msg3': 'Say hi!',
    'phone.msg4': 'Link up',
    'phone.msg5': 'Hit me up',
    'phone.msg6': 'Boot console',

    /* теги */
    'tag.branding': '{брендинг}',
    'tag.web': '{вэб-дизайн}',
    'tag.comm': '{коммуникация}',
    'tag.illu': '{иллюстрация}',

    /* футер */
    'foot.rights': '© 2026 Наталья Слатвицкая',
    'foot.built': 'Собрано вручную · HTML / CSS / JS',
    'foot.console': 'v1.2 / console',
    'about.hello': 'Привет, Я — Наташа,<br>мультидисциплинарный дизайнер',
    'foot.cv': 'CV',
    'foot.dprofile': 'Dprofile',
    'foot.behance': 'Behance',
    'foot.telegram': 'Telegram',
    'foot.email': 'E-mail',
    'foot.theme': 'Сменить тему',
    'foot.lang': 'Язык',

    /* карточки */
    'card.open': 'Открыть кейс',
    'card.stub': 'скоро',

    /* архив */
    'archive.meta.title': 'Архив — Наталья Слатвицкая',
    'archive.eyebrow': 'Архив',
    'archive.title': 'Все проекты',
    'archive.lede': 'Сквозной архив за всё время. Фильтр по направлению.',
    'archive.all': 'Все',
    'archive.branding': 'Брендинг',
    'archive.illustration': 'Иллюстрация',
    'archive.web': 'Вэб-дизайн',
    'archive.count': 'проектов',
    'archive.empty.t': 'Пусто',
    'archive.empty.d': 'В этом направлении пока нет проектов.',
    'archive.back': 'На главную',

    /* модалка */
    'modal.client': 'Направление',
    'modal.year': 'Год',
    'modal.role': 'Роль',
    'modal.tools': 'Инструменты',
    'modal.more': 'Подробнее о проекте →',
    'modal.note': 'полный кейс на внешней платформе',
    'modal.close': 'Закрыть',
    'modal.soon': 'Визуалы появятся позже',

    /* 404 */
    'e404.title': 'Страница в разработке',
    'e404.text': 'Этого раздела пока нет. Дизайн страницы «Обо мне» ещё в работе — совсем скоро она появится здесь.',
    'e404.code': '404',
    'e404.h': '404 Not found',
    'e404.sub': '{страница в разработке}',

    /* тема */
    'theme.light': 'Цветная',
    'theme.dark': 'Ночь',

    'cat.branding': 'Брендинг',
    'cat.illustration': 'Иллюстрация',
    'cat.web': 'Вэб-дизайн',

    /* терминал */
    'term.title': 'nnz://terminal',
    'term.hint': 'Введи help и нажми Enter',
    'term.help': 'Доступно: projects · archive · cv · contact · theme · stamp · clear',
    'term.secret': 'Скрытые: stamp · destruct · geek · exit',
    'term.unknown': 'команда не найдена'
  },

  en: {
    'meta.title': 'Natalia Slatvitskaya — graphic & brand designer',
    'meta.desc': 'Portfolio: branding, illustration, web design. 6 years of experience.',

    'top.all': 'All projects',
    'top.hello': 'Hi, I\u2019m Natasha',
    'top.role': '{graphic & brand designer}',
    'top.exp': '6 years of experience',

    'phone.msg1': 'Connect...',
    'phone.msg2': 'Text me',
    'phone.msg3': 'Say hi!',
    'phone.msg4': 'Link up',
    'phone.msg5': 'Hit me up',
    'phone.msg6': 'Boot console',

    'tag.branding': '{branding}',
    'tag.web': '{web design}',
    'tag.comm': '{communication}',
    'tag.illu': '{illustration}',

    'foot.rights': '© 2026 Natalia Slatvitskaya',
    'foot.built': 'Hand-built · HTML / CSS / JS',
    'foot.console': 'v1.2 / console',
    'about.hello': 'Hi, I’m Natasha,<br>a multidisciplinary designer',
    'foot.cv': 'CV',
    'foot.dprofile': 'Dprofile',
    'foot.behance': 'Behance',
    'foot.telegram': 'Telegram',
    'foot.email': 'E-mail',
    'foot.theme': 'Change theme',
    'foot.lang': 'Language',

    'card.open': 'Open case',
    'card.stub': 'soon',

    'archive.meta.title': 'Archive — Natalia Slatvitskaya',
    'archive.eyebrow': 'Archive',
    'archive.title': 'All projects',
    'archive.lede': 'A full archive across the years. Filter by discipline.',
    'archive.all': 'All',
    'archive.branding': 'Branding',
    'archive.illustration': 'Illustration',
    'archive.web': 'Web design',
    'archive.count': 'projects',
    'archive.empty.t': 'Nothing here',
    'archive.empty.d': 'No projects in this discipline yet.',
    'archive.back': 'Back home',

    'modal.client': 'Discipline',
    'modal.year': 'Year',
    'modal.role': 'Role',
    'modal.tools': 'Tools',
    'modal.more': 'View full case →',
    'modal.note': 'full case on an external platform',
    'modal.close': 'Close',
    'modal.soon': 'Visuals coming soon',

    'e404.title': 'Page in progress',
    'e404.text': 'This section doesn\u2019t exist yet. The About page is still in design — it will land here soon.',
    'e404.code': '404',
    'e404.h': '404 Not found',
    'e404.sub': '{page in progress}',

    'theme.light': 'Colour',
    'theme.dark': 'Night',

    'cat.branding': 'Branding',
    'cat.illustration': 'Illustration',
    'cat.web': 'Web design',

    'term.title': 'nnz://terminal',
    'term.hint': 'Type help and press Enter',
    'term.help': 'Available: projects · archive · cv · contact · theme · stamp · clear',
    'term.secret': 'Hidden: stamp · destruct · geek · exit',
    'term.unknown': 'command not found'
  }
};

/* ---------- контакты ---------- */
const CONTACTS = {
  behance: 'https://www.behance.net/nnzuzu5f5d',
  dprofile: 'https://dprofile.ru/nat_slatvitskaya',
  telegram: 'https://t.me/natslatvitskaya',
  email: 'natslatvitskaya@gmail.com',
  cv: 'https://disk.yandex.ru/'
};

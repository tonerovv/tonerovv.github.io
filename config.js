// =====================================================================
//  НАСТРОЙКИ САЙТА. Меняй только этот файл.
//  Текст пиши внутри кавычек "...". После каждого блока ставь запятую.
//  Сохрани файл и обнови страницу в браузере (F5).
// =====================================================================

window.SITE = {
  // --- Шапка ---
  name: "toner",
  handle: "@tonerovv",               // строчка под именем (можно удалить)
  bio: "музыка · видео · всякое",    // ← пара слов о себе
  avatar: "img/avatar.jpg",          // ← положи фото в папку img под именем avatar.jpg. Нет фото — будет буква
  verified: true,                    // галочка у имени (true / false)
  marquee: "TONER",                  // большая бегущая надпись на фоне ("" — убрать)

  // --- Музыка на сайте: внизу кнопка «включить / выключить». ---
  // url — ссылка на трек в SoundCloud ИЛИ свой mp3 из папки music, например "music/track.mp3".
  // title и artist — что написать рядом с кнопкой (если пусто, для SoundCloud возьмётся само).
  bgMusic: {
    url: "https://soundcloud.com/foidslayer333larp/just-staring-sophie-vyzee",
    title: "Just Staring / VYZEE",
    artist: "SOPHIE · melodic edit",
    loop: true,                                     // играть по кругу
  },

  // --- Цвета. Сейчас чёрно-белые. Можно вписать любые, например "#ff3d81" ---
  colors: {
    accent1: "#ffffff",
    accent2: "#cfcfcf",
    accent3: "#6b6b6b",
  },

  // --- Соцсети (иконки под именем). Ненужные просто удали ---
  // Доступно: telegram, instagram, tiktok, youtube, vk, discord, twitch, github, spotify, email
  socials: [
    { type: "telegram", url: "https://t.me/blazenew" },
    { type: "youtube",  url: "https://youtube.com/@tonerly" },
    { type: "tiktok",   url: "https://tiktok.com/@tonerovv" },
  ],

  // --- Блоки на странице (идут сверху вниз) ---
  // icon — эмодзи или название иконки: ai, telegram, youtube, tiktok, instagram, vk, discord, twitch, github, spotify, email
  // Типы: embed (плеер SoundCloud/Spotify/YouTube/Яндекс по ссылке), music (свои mp3), link (кнопка), header (заголовок), text (текст), grid (плитки по 2)
  blocks: [
    {
      type: "link",
      icon: "telegram",
      title: "Написать мне",
      subtitle: "Личка в Telegram · @tonerovv",
      url: "https://t.me/tonerovv",
      highlight: true,               // true = белая выделенная кнопка
    },
    {
      type: "link",
      icon: "ai",
      title: "Обучение ИИ",
      subtitle: "В закрепе канала @blazenew",
      url: "https://t.me/blazenew",   // ← сюда можно вставить ссылку на сам закреп, например https://t.me/blazenew/5
    },
    {
      type: "link",
      icon: "telegram",
      title: "Telegram-канал",
      subtitle: "@blazenew",
      url: "https://t.me/blazenew",
    },
    {
      type: "grid",
      items: [
        { icon: "youtube", title: "YouTube", url: "https://youtube.com/@tonerly" },
        { icon: "tiktok", title: "TikTok",  url: "https://tiktok.com/@tonerovv" },
      ],
    },

    // Свои mp3 (если появятся). Убери // в начале строк, положи файлы в папку music.
    // {
    //   type: "music",
    //   title: "Плейлист",
    //   tracks: [
    //     { title: "Трек", artist: "Автор", src: "music/track1.mp3", cover: "img/cover1.jpg" },
    //   ],
    // },

  ],

  footer: "© 2026 toner",
};

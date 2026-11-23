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

  // --- Музыка на сайте: внизу кнопка «включить / выключить» и «следующий трек». ---
  // Каждый трек: ссылка на SoundCloud ИЛИ свой mp3 из папки music, например "music/track.mp3".
  bgMusic: {
    tracks: [
      { url: "https://soundcloud.com/foidslayer333larp/just-staring-sophie-vyzee", title: "Just Staring / VYZEE", artist: "SOPHIE · melodic edit" },
      { url: "https://soundcloud.com/snowzyzz/all-i-need-clams-casino-bass", title: "All I Need", artist: "Clams Casino · bass boosted" },
    ],
    loop: true,
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
  // Типы: 3d (3D-анимация), embed (плеер SoundCloud/Spotify/YouTube/Яндекс по ссылке), music (свои mp3), link (кнопка), header (заголовок), text (текст), grid (плитки по 2)
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

    // 3D-анимация. background: true — большая фигура на заднем плане всего сайта.
    // background: false — маленькая карточка между блоками (её можно крутить пальцем), text — подпись.
    { type: "3d", background: true, text: "toner" },

    // Свои mp3 (если появятся). Убери // в начале строк, положи файлы в папку music.
    // {
    //   type: "music",
    //   title: "Плейлист",
    //   tracks: [
    //     { title: "Трек", artist: "Автор", src: "music/track1.mp3", cover: "img/cover1.jpg" },
    //   ],
    // },

  ],

  // --- Комментарии внизу сайта (ссылки и @ники запрещены) ---
  comments: {
    title: "Напиши мне",
    reserved: ["toner"],  // имена с этим словом (toner, tonerov, tonerovv, т0нер...) может писать только владелец
    placeholder: "Оставь комментарий…",
    supabaseUrl: "https://knzhaqttibsiyczpfveb.supabase.co",
    supabaseKey: "sb_publishable_N59Y2_KXDcB9xbmVXrjHMA_Yn3yG_qZ",   // публичный ключ, его можно показывать
  },

  footer: "© 2026 toner",
};

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
  linksAvatar: false,                // аватарка на странице «Переходник» (true — показать)
  marquee: "TONER",                  // большая бегущая надпись на фоне ("" — убрать)
  views: false,                      // счётчик просмотров под соцсетями (false — убрать)
  secret: "ты нашёл пасхалку 👀 привет от toner",  // текст пасхалки (5 быстрых нажатий на аватарку)

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
  socials: [],

  // --- Блоки на странице (идут сверху вниз) ---
  // icon — эмодзи или название иконки: ai, telegram, youtube, tiktok, instagram, vk, discord, twitch, github, spotify, email
  // Типы: 3d (3D-анимация), youtube (последнее видео канала), embed (плеер SoundCloud/Spotify/YouTube/Яндекс по ссылке), music (свои mp3), link (кнопка), header (заголовок), text (текст), grid (плитки по 2)
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
      icon: "telegram",
      title: "Telegram-канал",
      subtitle: "@blazenew",
      url: "https://t.me/blazenew",
    },
    {
      type: "link",
      icon: "youtube",
      title: "YouTube",
      subtitle: "@tonerly",
      url: "https://youtube.com/@tonerly",
    },
    {
      type: "link",
      icon: "tiktok",
      title: "TikTok",
      subtitle: "@tonerovv",
      url: "https://tiktok.com/@tonerovv",
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
    show: false,          // false — не показывать старые комментарии на «Переходнике» (база нужна соцсети, не удалять)
    title: "Напиши мне",
    reserved: ["toner"],  // имена с этим словом (toner, tonerov, tonerovv, т0нер...) может писать только владелец
    placeholder: "Оставь комментарий…",
    supabaseUrl: "https://knzhaqttibsiyczpfveb.supabase.co",
    supabaseKey: "sb_publishable_N59Y2_KXDcB9xbmVXrjHMA_Yn3yG_qZ",   // публичный ключ, его можно показывать
  },

  footer: "© 2026 toner",
};

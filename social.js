// =====================================================================
//  Соцсеть сайта: меню, аккаунты, лента, посты, подписки, люди, отзывы, чат.
//  Секретов тут нет: только публичный ключ из config.js. Все права
//  проверяет база (RLS и функции sn_*), сайт их обойти не может.
// =====================================================================
(() => {
  const S = window.SITE || {}, C = S.comments || {};
  const app = document.getElementById("app"), soc = document.getElementById("soc");
  if (!soc) return;
  const BASE_URL = (C.supabaseUrl || "").replace(/\/$/, "");
  const SITE_URL = location.origin + location.pathname;
  const OWNER = "toner";   // ник владельца сайта
  const sb = window.supabase && BASE_URL && C.supabaseKey
    ? window.supabase.createClient(BASE_URL, C.supabaseKey, {
        auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "toner-auth" },
        realtime: { params: { eventsPerSecond: 5 } },
      })
    : null;

  // ---------- мелочи ----------
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const svg = (p, extra = "") => `<svg viewBox="0 0 24 24" aria-hidden="true" ${extra}>${p}</svg>`;
  const I = {
    back: svg('<path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'),
    user: svg('<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    link: svg('<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'),
    post: svg('<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
    feed: svg('<path d="M4 6h16M4 12h16M4 18h10"/>'),
    star: svg('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/>'),
    chat: svg('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.8A8 8 0 1 1 21 12z"/>'),
    people: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.6c2.6 0 4.6 1.7 5.5 4.4"/>'),
    search: svg('<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    cam: svg('<path fill="currentColor" d="M9 4 7.5 6H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2.5L15 4H9zm3 4.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/>'),
    heart: svg('<path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.1 1.7-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21z"/>'),
    bubble: svg('<path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.8A8 8 0 1 1 21 12z"/>'),
    pin: svg('<path fill="currentColor" d="M16 3H8v2l1 1v5l-3 3v2h5v5l1 1 1-1v-5h5v-2l-3-3V6l1-1z"/>', 'width="12" height="12"'),
    fstar: svg('<path fill="currentColor" d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z"/>'),
    badge: svg('<path fill="#fff" d="m12 1 2.6 2 3.2-.3 1 3.1 2.8 1.6-.9 3.1 1.3 3-2.6 1.9-.4 3.2-3.2.5L14 22.6l-2-1.2-2 1.2-1.8-2.7-3.2-.5-.4-3.2L2 14.3l1.3-3-.9-3.1 2.8-1.6 1-3.1 3.2.3z"/><path d="m8 12 2.7 2.7L16.3 9" fill="none" stroke="#000" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>', 'class="sn-badge"'),
  };
  const ago = t => {
    const s = (Date.now() - new Date(t)) / 1000;
    return s < 60 ? "только что" : s < 3600 ? Math.floor(s / 60) + " мин" : s < 86400 ? Math.floor(s / 3600) + " ч" : new Date(t).toLocaleDateString("ru-RU");
  };
  const hhmm = t => new Date(t).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };
  // ссылки кликабельны только в постах админа и только https
  const linkify = s => esc(s).replace(/https:\/\/[^\s<]+[^\s<.,!?;:)]/g, u => `<a href="${u}" target="_blank" rel="noopener noreferrer nofollow">${u}</a>`);
  const avUrl = p => p && p.avatar && /^[0-9a-f-]{36}\/[0-9]{10,14}\.(webp|jpg)$/.test(p.avatar) ? `${BASE_URL}/storage/v1/object/public/avatars/${p.avatar}` : "";
  const av = (p, cls = "") => {
    const u = avUrl(p);
    return `<span class="sn-av${p && p.is_admin ? " adm" : ""}${cls ? " " + cls : ""}">${u ? `<img alt="" loading="lazy" src="${esc(u)}">` : esc(((p && p.username) || "?")[0])}</span>`;
  };
  const badges = p => `${p.verified ? I.badge : ""}${p.is_admin ? ' <i class="sn-tag">админ</i>' : ""}${p.banned ? ' <i class="sn-tag ban">бан</i>' : ""}`;
  const name = (p, plain) => !p ? `<span class="sn-n">удалён</span>`
    : plain ? `<span class="sn-n">@${esc(p.username)}${badges(p)}</span>` : `<a class="sn-n" href="#u/${esc(p.username)}">@${esc(p.username)}${badges(p)}</a>`;
  const stars = n => `<span class="sn-stars" aria-label="${n} из 5">${[1, 2, 3, 4, 5].map(i => `<span class="${i <= n ? "" : "off"}">${I.fstar}</span>`).join("")}</span>`;
  const PROF = "id,username,verified,is_admin,banned,avatar";
  const errText = e => {
    const m = String((e && (e.message || e.error_description)) || e || "");
    if (/too fast/i.test(m)) return "Слишком часто, подожди немного";
    if (/no links/i.test(m)) return "Ссылки и @ники писать нельзя";
    if (/banned/i.test(m)) return "Твой аккаунт заблокирован";
    if (/not signed|JWT|401/i.test(m)) return "Нужно войти в аккаунт";
    if (/admin only/i.test(m)) return "Только для админа";
    if (/bad length/i.test(m)) return "Пусто или слишком длинно";
    if (/row-level security|bad avatar|mime|size|exceeded/i.test(m)) return "Не получилось загрузить фото, попробуй другое";
    if (/Invalid login credentials/i.test(m)) return "Неверная почта или пароль";
    if (/Email not confirmed/i.test(m)) return "Сначала подтверди почту по ссылке из письма";
    if (/already registered|already been registered/i.test(m)) return "Эта почта уже зарегистрирована. Войди";
    if (/rate limit|too many/i.test(m)) return "Слишком много попыток. Попробуй позже";
    if (/password/i.test(m) && /least|short|weak|characters/i.test(m)) return "Пароль слишком простой: минимум 8 символов, латинские буквы и цифры";
    if (/Database error saving new user/i.test(m)) return "Этот ник занят или запрещён, выбери другой";
    if (/invalid.*email|email.*invalid/i.test(m)) return "Проверь адрес почты";
    return "Не получилось, попробуй позже";
  };
  const rpc = async (fn, args) => { const { data, error } = await sb.rpc(fn, args); if (error) throw error; return data; };
  const say = (el, t, kind) => { if (!el) return; el.textContent = t; el.className = "msg" + (kind ? " " + kind : ""); };
  const toast = t => {
    let el = document.querySelector(".toast"); if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.append(el); }
    el.textContent = t; el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), 2600);
  };
  const counter = (ta, out, max) => { const f = () => out.textContent = ta.value.length + "/" + max; ta.addEventListener("input", f); f(); };
  const countOf = async (col, id) => { const { count } = await sb.from("follows").select("*", { count: "exact", head: true }).eq(col, id); return count || 0; };

  // ---------- состояние ----------
  let session = null, ME = null, RECOVERY = false, cleanup = () => {}, OWNER_P = null, FOLLOWING = new Set();
  const loadMe = async () => {
    if (!sb) return;
    session = (await sb.auth.getSession()).data.session;
    ME = null; FOLLOWING = new Set();
    if (session) {
      const { data } = await sb.from("profiles").select(PROF + ",bio,created_at").eq("id", session.user.id).maybeSingle();
      ME = data || null;
      if (ME) { const r = await sb.from("follows").select("following").eq("follower", ME.id); FOLLOWING = new Set((r.data || []).map(x => x.following)); }
    }
    top();
  };
  const loadOwner = async () => {
    if (!sb) return null;
    if (!OWNER_P) { const { data } = await sb.from("profiles").select(PROF + ",bio").eq("username", OWNER).maybeSingle(); OWNER_P = data || null; }
    return OWNER_P;
  };
  // кнопка «Подписаться» (одна функция для всех мест)
  const followBtn = p => !p || (ME && ME.id === p.id) ? "" : `<button class="sn-follow${FOLLOWING.has(p.id) ? " on" : ""}" data-uid="${esc(p.id)}">${FOLLOWING.has(p.id) ? "Вы подписаны" : "Подписаться"}</button>`;
  const bindFollow = (root, after) => root.querySelectorAll(".sn-follow").forEach(b => b.onclick = async e => {
    e.preventDefault(); e.stopPropagation();
    if (!ME) { toast("Войди, чтобы подписываться"); location.hash = "#me"; return; }
    b.disabled = true;
    try {
      const on = await rpc("sn_toggle_follow", { p_user: b.dataset.uid });
      on ? FOLLOWING.add(b.dataset.uid) : FOLLOWING.delete(b.dataset.uid);
      root.querySelectorAll(`.sn-follow[data-uid="${b.dataset.uid}"]`).forEach(x => { x.classList.toggle("on", on); x.textContent = on ? "Вы подписаны" : "Подписаться"; });
      if (after) after(on);
    } catch (er) { toast(errText(er)); }
    b.disabled = false;
  });

  // ---------- верхняя панель ----------
  const nav = document.createElement("nav"); nav.className = "sn-top";
  document.body.append(nav);
  const top = () => {
    const h = location.hash.slice(1);
    nav.innerHTML = `<a href="#" class="${h === "" ? "ghost" : ""}">${I.back}Меню</a>
      <a href="#me" class="sn-me">${ME ? av(ME, "xs") + "@" + esc(ME.username) : I.user + "Войти"}</a>`;
  };

  // ---------- меню при входе ----------
  const heroAvatar = o => {
    const u = avUrl(o) || S.avatar || "";
    return `<div class="avatar-wrap"><div class="avatar">${u ? `<img alt="" src="${esc(u)}">` : ""}<span ${u ? "hidden" : ""}>${esc((S.name || "?")[0])}</span></div></div>`;
  };
  async function hub() {
    const o = OWNER_P;
    soc.innerHTML = `<section class="sn-hero reveal">
        ${heroAvatar(o)}
        <h1>${esc(S.name || "")}${S.verified ? I.badge : ""}</h1>
        <p>${esc((o && o.bio) || "Куда идём?")}</p>
      </section>
      <div class="sn-grid">
        <a class="card sn-tile hl wide reveal" href="#links"><span class="ic">${I.link}</span><span><b>Переходник</b><small>все мои ссылки и музыка</small></span></a>
        <a class="card sn-tile reveal" href="#feed"><span class="ic">${I.feed}</span><span><b>Лента</b><small>посты всех людей</small></span></a>
        <a class="card sn-tile reveal" href="#posts"><span class="ic">${I.post}</span><span><b>Посты</b><small>новости от ${esc(S.name || "меня")}</small></span></a>
        <a class="card sn-tile reveal" href="#chat"><span class="ic">${I.chat}</span><span><b>Общий чат</b><small>пиши всем сразу</small></span></a>
        <a class="card sn-tile reveal" href="#people"><span class="ic">${I.people}</span><span><b>Люди</b><small>поиск и подписки</small></span></a>
        <a class="card sn-tile reveal" href="#reviews"><span class="ic">${I.star}</span><span><b>Отзывы</b><small>оценки и мнения</small></span></a>
        <a class="card sn-tile reveal" href="#me"><span class="ic">${ME ? av(ME, "tl") : I.user}</span><span><b>${ME ? "@" + esc(ME.username) : "Аккаунт"}</b><small>${ME ? "мой профиль" : "войти или создать"}</small></span></a>
      </div>`;
    soc.querySelectorAll(".reveal").forEach((el, i) => el.style.animationDelay = i * 50 + "ms");
    const im = soc.querySelector(".avatar img");
    if (im) im.addEventListener("error", () => { im.remove(); soc.querySelector(".avatar span").hidden = false; });
  }

  const needLogin = what => `<div class="sn-note">Чтобы ${what}, <a href="#me">войди или создай аккаунт</a>.</div>`;
  const offline = () => { soc.innerHTML = `<div class="card sn-box sn-note">Сейчас не получается подключиться. Обнови страницу чуть позже.</div>`; };

  // ---------- аватарка: обрезаем в квадрат 320×320 прямо в браузере ----------
  const makeAvatar = file => new Promise((res, rej) => {
    if (!file || !/^image\//.test(file.type) || file.size > 15e6) return rej(new Error("bad avatar"));
    const img = new Image(), fr = new FileReader();   // data: — blob: запрещён политикой CSP
    img.onload = () => {
      const n = 320, s = Math.min(img.naturalWidth, img.naturalHeight), cv = document.createElement("canvas");
      cv.width = cv.height = n;
      cv.getContext("2d").drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, n, n);
      cv.toBlob(b => b && b.type === "image/webp" ? res({ blob: b, ext: "webp", type: "image/webp" })
        : cv.toBlob(j => j ? res({ blob: j, ext: "jpg", type: "image/jpeg" }) : rej(new Error("bad avatar")), "image/jpeg", .85), "image/webp", .85);
    };
    img.onerror = fr.onerror = () => rej(new Error("bad avatar"));
    fr.onload = () => { img.src = fr.result; };
    fr.readAsDataURL(file);
  });
  async function uploadAvatar(file) {
    const { blob, ext, type } = await makeAvatar(file);
    const path = `${ME.id}/${Date.now()}.${ext}`, old = ME.avatar;
    const up = await sb.storage.from("avatars").upload(path, blob, { contentType: type, upsert: false, cacheControl: "31536000" });
    if (up.error) throw up.error;
    await rpc("sn_set_avatar", { p_path: path });
    if (old) sb.storage.from("avatars").remove([old]).catch(() => {});
    ME.avatar = path; if (OWNER_P && OWNER_P.id === ME.id) OWNER_P.avatar = path;
  }

  // ---------- мой профиль ----------
  async function me() {
    if (!sb) return offline();
    if (!session) return authForms();
    if (RECOVERY) return newPassword();
    if (!ME) { soc.innerHTML = `<div class="card sn-box sn sn-note">Профиль не найден. <button class="linkb" id="lo">Выйти</button></div>`; soc.querySelector("#lo").onclick = logout; return; }
    soc.innerHTML = `<div class="sn-h"><h2>Мой профиль</h2><a class="sn-t" href="#u/${esc(ME.username)}">как видят другие →</a></div>
      <section class="card sn-box sn reveal">
        ${ME.banned ? `<div class="sn-ban">Аккаунт заблокирован: писать нельзя, читать можно.</div>` : ""}
        <div class="sn-prof">
          <label class="sn-avpick" title="Сменить аватарку">${av(ME, "big")}<span class="cam">${I.cam}</span><input type="file" accept="image/*" hidden></label>
          <div>${name(ME)}<div class="sn-t" id="cnts">с нами с ${new Date(ME.created_at).toLocaleDateString("ru-RU")}</div>
            ${ME.avatar ? `<button class="linkb" id="avdel" type="button">убрать фото</button>` : `<div class="sn-t">нажми на круг, чтобы поставить фото</div>`}</div>
        </div>
        <form id="bio" class="sn-bio"><textarea name="b" maxlength="160" rows="2" placeholder="О себе: кто ты и чем занимаешься">${esc(ME.bio || "")}</textarea>
          <div class="row"><span class="msg"></span><span class="cnt"></span><button class="btn" type="submit">Сохранить</button></div></form>
      </section>
      <section class="card sn-box sn reveal"><h3>Пароль</h3>
        <form id="pw" class="sn-inline"><input name="p" type="password" minlength="8" maxlength="72" autocomplete="new-password" placeholder="Новый пароль" required><button class="btn alt" type="submit">Сменить</button></form>
        <span class="msg" id="pwm"></span>
      </section>
      ${ME.is_admin ? `<section class="card sn-box sn reveal"><h3>Админ</h3>
        <form id="adm" class="sn-inline"><input name="u" maxlength="20" placeholder="ник без @" autocomplete="off" required>
          <button class="btn" type="submit" data-a="ban">Бан</button><button class="btn alt" type="button" data-a="unban">Разбан</button><button class="btn alt" type="button" data-a="clear">Убрать фото</button></form>
        <span class="msg" id="admm"></span>
      </section>` : ""}
      <div class="sn" style="display:flex;justify-content:center"><button class="btn alt" id="lo">Выйти из аккаунта</button></div>`;
    Promise.all([countOf("following", ME.id), countOf("follower", ME.id)]).then(([a, b]) => {
      const el = soc.querySelector("#cnts"); if (el) el.textContent = `${a} ${plural(a, "подписчик", "подписчика", "подписчиков")} · ${b} ${plural(b, "подписка", "подписки", "подписок")}`;
    });
    const pick = soc.querySelector(".sn-avpick input");
    pick.onchange = async () => {
      const f = pick.files[0]; if (!f) return;
      const box = soc.querySelector(".sn-avpick"); box.classList.add("busy");
      try { await uploadAvatar(f); toast("Аватарка обновлена"); top(); me(); } catch (er) { toast(errText(er)); box.classList.remove("busy"); }
    };
    const avdel = soc.querySelector("#avdel");
    if (avdel) avdel.onclick = async () => {
      try { const old = ME.avatar; await rpc("sn_set_avatar", { p_path: null }); ME.avatar = null; if (old) sb.storage.from("avatars").remove([old]).catch(() => {}); top(); me(); } catch (er) { toast(errText(er)); }
    };
    const bio = soc.querySelector("#bio");
    counter(bio.b, bio.querySelector(".cnt"), 160);
    bio.onsubmit = async e => {
      e.preventDefault(); const m = bio.querySelector(".msg");
      try { await rpc("sn_update_bio", { p_bio: bio.b.value }); await loadMe(); bio.b.value = ME.bio || ""; say(m, "Сохранено", "ok"); } catch (er) { say(m, errText(er), "err"); }
    };
    const pw = soc.querySelector("#pw");
    pw.onsubmit = async e => {
      e.preventDefault(); const m = soc.querySelector("#pwm");
      const { error } = await sb.auth.updateUser({ password: pw.p.value });
      error ? say(m, errText(error), "err") : (say(m, "Пароль изменён", "ok"), pw.reset());
    };
    const adm = soc.querySelector("#adm");
    if (adm) {
      const go = async a => {
        const m = soc.querySelector("#admm"), u = adm.u.value.trim().replace(/^@/, "");
        if (!u) return;
        try {
          const ok = a === "clear" ? await rpc("sn_clear_avatar", { p_username: u }) : await rpc("sn_set_ban", { p_username: u, p_ban: a === "ban" });
          say(m, ok ? ({ ban: "Забанен", unban: "Разбанен", clear: "Фото убрано" })[a] : "Ник не найден (или это админ)", ok ? "ok" : "err");
        } catch (er) { say(m, errText(er), "err"); }
      };
      adm.onsubmit = e => { e.preventDefault(); go("ban"); };
      adm.querySelectorAll("[data-a]").forEach(b => { if (b.type === "button") b.onclick = () => go(b.dataset.a); });
    }
    soc.querySelector("#lo").onclick = logout;
  }
  async function logout() { await sb.auth.signOut(); session = null; ME = null; FOLLOWING = new Set(); top(); location.hash = "#"; }

  function authForms(mode = "in") {
    soc.innerHTML = `<div class="sn-h"><h2>${mode === "up" ? "Регистрация" : mode === "fg" ? "Забыл пароль" : "Вход"}</h2></div>
      <section class="card sn-box sn reveal">
        ${mode !== "fg" ? `<div class="tabs"><button data-m="in" class="${mode === "in" ? "on" : ""}">Войти</button><button data-m="up" class="${mode === "up" ? "on" : ""}">Создать аккаунт</button></div>` : ""}
        <form novalidate>
          ${mode === "up" ? `<input name="u" maxlength="20" autocomplete="username" placeholder="Ник: латиница, цифры, _ (3–20)" required>` : ""}
          <input name="e" type="email" maxlength="254" autocomplete="email" placeholder="Почта" required>
          ${mode !== "fg" ? `<input name="p" type="password" minlength="8" maxlength="72" autocomplete="${mode === "up" ? "new-password" : "current-password"}" placeholder="Пароль${mode === "up" ? " (8+ символов, латиница и цифры)" : ""}" required>` : ""}
          <span class="msg"></span>
          <button class="btn" type="submit">${mode === "up" ? "Создать аккаунт" : mode === "fg" ? "Прислать ссылку" : "Войти"}</button>
          ${mode === "in" ? `<button class="linkb" type="button" data-m="fg">Забыл пароль?</button>` : mode === "fg" ? `<button class="linkb" type="button" data-m="in">Назад ко входу</button>` : ""}
        </form>
        ${mode === "up" ? `<p class="sn-note" style="margin-top:12px">Пароль хранится в зашифрованном виде, его не видит даже владелец сайта. Твою почту не видят другие пользователи.</p>` : ""}
      </section>`;
    soc.querySelectorAll("[data-m]").forEach(b => b.onclick = () => authForms(b.dataset.m));
    const f = soc.querySelector("form"), m = f.querySelector(".msg"), btn = f.querySelector(".btn");
    f.onsubmit = async e => {
      e.preventDefault();
      const email = f.e.value.trim(), pass = f.p ? f.p.value : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return say(m, "Проверь адрес почты", "err");
      if (mode !== "fg" && (pass.length < 8 || (mode === "up" && !(/[a-z]/i.test(pass) && /\d/.test(pass))))) return say(m, "Пароль: минимум 8 символов, латинские буквы и цифры", "err");
      btn.disabled = true; say(m, "Секунду…");
      try {
        if (mode === "up") {
          const u = f.u.value.trim().toLowerCase();
          if (!/^[a-z0-9_]{3,20}$/.test(u)) throw { message: "Ник: 3–20 символов, только латиница, цифры и _", custom: 1 };
          if (!(await rpc("sn_username_free", { p_name: u }))) throw { message: "Этот ник занят или запрещён", custom: 1 };
          const { data, error } = await sb.auth.signUp({ email, password: pass, options: { data: { username: u }, emailRedirectTo: SITE_URL + "?go=me" } });
          if (error) throw error;
          if (data.session) { await loadMe(); toast("Аккаунт создан!"); return me(); }
          soc.innerHTML = `<div class="card sn-box sn-note reveal"><h3 style="color:var(--text)">Проверь почту</h3>Мы отправили письмо на <b>${esc(email)}</b>. Открой его и нажми ссылку, потом войди здесь. Письма нет? Загляни в «Спам».</div>`;
        } else if (mode === "fg") {
          const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: SITE_URL + "?reset=1" });
          if (error) throw error;
          say(m, "Если такая почта есть, мы отправили на неё ссылку", "ok");
        } else {
          const { error } = await sb.auth.signInWithPassword({ email, password: pass });
          if (error) throw error;
          await loadMe(); toast("Привет, @" + (ME ? ME.username : "")); me();
        }
      } catch (er) { say(m, er && er.custom ? er.message : errText(er), "err"); }
      btn.disabled = false;
    };
  }

  function newPassword() {
    soc.innerHTML = `<div class="sn-h"><h2>Новый пароль</h2></div><section class="card sn-box sn reveal"><form>
      <input name="p" type="password" minlength="8" maxlength="72" autocomplete="new-password" placeholder="Новый пароль (8+ символов, латиница и цифры)" required>
      <span class="msg"></span><button class="btn" type="submit">Сохранить</button></form></section>`;
    const f = soc.querySelector("form"), m = f.querySelector(".msg");
    f.onsubmit = async e => {
      e.preventDefault();
      const { error } = await sb.auth.updateUser({ password: f.p.value });
      if (error) return say(m, errText(error), "err");
      RECOVERY = false; toast("Пароль изменён"); me();
    };
  }

  // ---------- посты (общий код для ленты, новостей и профиля) ----------
  const POST_SEL = `id,text,pinned,kind,created_at,author,a:profiles!posts_author_fkey(${PROF}),post_likes(count),post_comments(count)`;
  function composer(kind) {
    if (!ME || ME.banned) return "";
    if (kind === "news" && !ME.is_admin) return "";
    const max = ME.is_admin ? 4000 : 1000;
    return `<section class="card sn-box sn reveal"><form id="np" class="sn-compose">
      <div class="sn-cwho">${av(ME)}<textarea name="t" maxlength="${max}" rows="2" placeholder="${kind === "news" ? "Новость для всех…" : "Что у тебя нового?"}" required></textarea></div>
      <div class="row"><span class="msg"></span><span class="cnt"></span><button class="btn" type="submit">Опубликовать</button></div></form></section>`;
  }
  function bindComposer(kind, reload) {
    const np = soc.querySelector("#np"); if (!np) return;
    counter(np.t, np.querySelector(".cnt"), np.t.maxLength);
    np.onsubmit = async e => {
      e.preventDefault(); const m = np.querySelector(".msg"), b = np.querySelector(".btn"); b.disabled = true;
      try { await rpc("sn_create_post", { p_text: np.t.value, p_kind: kind }); np.reset(); np.t.dispatchEvent(new Event("input")); say(m, "Опубликовано", "ok"); reload(); }
      catch (er) { say(m, errText(er), "err"); }
      b.disabled = false;
    };
  }
  async function renderPosts(box, q, opts = {}) {
    if (!box) return;
    const { data, error } = await q;
    if (!box.isConnected) return;
    if (error) { box.innerHTML = `<div class="sn-empty">Не удалось загрузить посты</div>`; return; }
    let liked = new Set();
    if (ME && data.length) { const r = await sb.from("post_likes").select("post_id").eq("user_id", ME.id).in("post_id", data.map(p => p.id)); liked = new Set((r.data || []).map(x => x.post_id)); }
    const adm = ME && ME.is_admin;
    box.innerHTML = data.length ? data.map(p => `<article class="card sn-post${p.pinned && opts.pins ? " pin" : ""}" data-id="${p.id}" data-pin="${p.pinned ? 1 : 0}">
        ${p.pinned && opts.pins ? `<div class="sn-pl">${I.pin}закреплено</div>` : ""}
        <div class="sn-ph">${av(p.a)}<div class="who">${name(p.a)}<span class="sn-t">${ago(p.created_at)}${p.kind === "news" && opts.mark ? " · новость" : ""}</span></div>${opts.follow ? followBtn(p.a) : ""}</div>
        <div class="sn-text">${p.a && p.a.is_admin ? linkify(p.text) : esc(p.text)}</div>
        <div class="sn-acts">
          <button class="sn-pill lk${liked.has(p.id) ? " on" : ""}" aria-label="лайк">${I.heart}<span>${(p.post_likes[0] || {}).count || 0}</span></button>
          <button class="sn-pill cm" aria-label="комментарии">${I.bubble}<span>${(p.post_comments[0] || {}).count || 0}</span></button>
          <span class="sp"></span>
          ${adm && opts.pins ? `<button class="mini-b pn">${p.pinned ? "открепить" : "закрепить"}</button>` : ""}
          ${ME && (adm || ME.id === p.author) ? `<button class="mini-b del dp">удалить</button>` : ""}
        </div></article>`).join("") : `<div class="card sn-empty">${opts.empty || "Постов пока нет"}</div>`;
    bindFollow(box);
    box.querySelectorAll(".sn-post").forEach(el => {
      const id = +el.dataset.id, q = s => el.querySelector(s);
      q(".lk").onclick = async () => {
        if (!ME) return toast("Войди, чтобы ставить лайки");
        const b = q(".lk"), n = b.querySelector("span");
        try {
          const on = await rpc("sn_toggle_like", { p_post: id });
          b.classList.toggle("on", on); n.textContent = Math.max(0, +n.textContent + (on ? 1 : -1));
          b.classList.remove("pop"); void b.offsetWidth; if (on) b.classList.add("pop");
        } catch (er) { toast(errText(er)); }
      };
      q(".cm").onclick = () => { const c = q(".sn-cm"); c ? c.remove() : openComments(el, id); };
      if (q(".pn")) q(".pn").onclick = async () => { try { await rpc("sn_pin_post", { p_id: id, p_pin: el.dataset.pin !== "1" }); opts.reload && opts.reload(); } catch (er) { toast(errText(er)); } };
      if (q(".dp")) q(".dp").onclick = async () => {
        const b = q(".dp"); if (b.dataset.sure !== "1") { b.dataset.sure = "1"; b.textContent = "точно удалить?"; return; }
        try { await rpc("sn_delete_post", { p_id: id }); el.remove(); } catch (er) { toast(errText(er)); }
      };
    });
  }
  async function openComments(el, id) {
    const wrap = document.createElement("div"); wrap.className = "sn-cm"; wrap.innerHTML = `<div class="sn-empty">Загрузка…</div>`;
    el.append(wrap);
    const draw = async () => {
      const { data, error } = await sb.from("post_comments").select(`id,text,created_at,author,a:profiles!post_comments_author_fkey(${PROF})`).eq("post_id", id).order("created_at").limit(200);
      if (error) { wrap.innerHTML = `<div class="sn-empty">Не удалось загрузить</div>`; return; }
      wrap.innerHTML = (data.length ? data.map(c => `<div class="sn-c" data-id="${c.id}">${av(c.a)}<div class="bd"><div class="hd">${name(c.a)}<span class="sn-t">${ago(c.created_at)}</span>
          ${ME && (ME.is_admin || ME.id === c.author) ? `<button class="mini-b del">удалить</button>` : ""}</div><div class="sn-text">${esc(c.text)}</div></div></div>`).join("") : `<div class="sn-note">Комментариев пока нет.</div>`)
        + (ME && !ME.banned ? `<form class="sn-inline"><input name="t" maxlength="500" placeholder="Комментарий…" autocomplete="off" required><button class="btn" type="submit">→</button></form><span class="msg"></span>` : ME ? "" : needLogin("комментировать"));
      wrap.querySelectorAll(".sn-c .del").forEach(b => b.onclick = async () => {
        try { await rpc("sn_delete_comment", { p_id: +b.closest(".sn-c").dataset.id }); draw(); setCount(-1); } catch (er) { toast(errText(er)); }
      });
      const f = wrap.querySelector("form");
      if (f) f.onsubmit = async e => {
        e.preventDefault(); const m = wrap.querySelector(".msg"), b = f.querySelector(".btn"); b.disabled = true;
        try { await rpc("sn_add_comment", { p_post: id, p_text: f.t.value }); await draw(); setCount(1); } catch (er) { say(m, errText(er), "err"); }
        b.disabled = false;
      };
    };
    const setCount = d => { const n = el.querySelector(".cm span"); n.textContent = Math.max(0, +n.textContent + d); };
    draw();
  }

  // ---------- новости владельца ----------
  async function posts() {
    if (!sb) return offline();
    soc.innerHTML = `<div class="sn-h"><h2>Посты</h2><span>от ${esc(S.name || "автора")}</span></div>
      ${composer("news")}
      <div id="pl" class="sn sn-list"><div class="sn-empty">Загрузка…</div></div>`;
    const reload = () => renderPosts(soc.querySelector("#pl"),
      sb.from("posts").select(POST_SEL).eq("kind", "news").order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(30), { pins: true, reload });
    bindComposer("news", reload); reload();
  }

  // ---------- общая лента ----------
  async function feed(tab = "all") {
    if (!sb) return offline();
    soc.innerHTML = `<div class="sn-h"><h2>Лента</h2><span>посты всех людей</span></div>
      ${composer("feed") || (ME ? "" : `<section class="card sn-box">${needLogin("публиковать посты")}</section>`)}
      ${ME ? `<div class="tabs sn"><button data-t="all" class="${tab === "all" ? "on" : ""}">Все</button><button data-t="sub" class="${tab === "sub" ? "on" : ""}">Мои подписки</button></div>` : ""}
      <div id="pl" class="sn sn-list"><div class="sn-empty">Загрузка…</div></div>`;
    soc.querySelectorAll("[data-t]").forEach(b => b.onclick = () => feed(b.dataset.t));
    const reload = () => {
      let q = sb.from("posts").select(POST_SEL).eq("kind", "feed");
      if (tab === "sub") {
        const ids = [...FOLLOWING];
        if (!ids.length) { soc.querySelector("#pl").innerHTML = `<div class="card sn-empty">Ты пока ни на кого не подписан. <a href="#people">Найти людей →</a></div>`; return; }
        q = q.in("author", ids);
      }
      renderPosts(soc.querySelector("#pl"), q.order("created_at", { ascending: false }).limit(40), { follow: true, empty: "В ленте пока пусто. Напиши первый пост!" });
    };
    bindComposer("feed", reload); reload();
  }

  // ---------- страница человека ----------
  async function profile(username) {
    if (!sb) return offline();
    const u = String(username || "").toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(u)) { soc.innerHTML = `<div class="card sn-empty">Такого человека нет</div>`; return; }
    soc.innerHTML = `<div class="sn-empty">Загрузка…</div>`;
    const { data: p } = await sb.from("profiles").select(PROF + ",bio,created_at").eq("username", u).maybeSingle();
    if (!p) { soc.innerHTML = `<div class="card sn-empty">Такого человека нет. <a href="#people">Искать людей →</a></div>`; return; }
    const self = ME && ME.id === p.id;
    soc.innerHTML = `<section class="card sn-box sn sn-pcard reveal">
        <div class="sn-pc-top">${av(p, "big")}<div class="sn-stats"><div><b id="c-posts">·</b><span>постов</span></div><div><b id="c-fol">·</b><span>подписчиков</span></div><div><b id="c-sub">·</b><span>подписок</span></div></div></div>
        <div class="sn-pc-name">${name(p)}</div>
        ${p.bio ? `<div class="sn-pc-bio">${esc(p.bio)}</div>` : ""}
        <div class="sn-pc-act">${self ? `<a class="btn alt" href="#me">Редактировать профиль</a>` : followBtn(p)}</div>
      </section>
      <div class="sn-h"><h2 style="font-size:18px">Посты</h2></div>
      <div id="pl" class="sn sn-list"><div class="sn-empty">Загрузка…</div></div>`;
    const setFol = async () => { const n = await countOf("following", p.id); const el = soc.querySelector("#c-fol"); if (el) el.textContent = n; };
    setFol(); countOf("follower", p.id).then(n => { const el = soc.querySelector("#c-sub"); if (el) el.textContent = n; });
    sb.from("posts").select("id", { count: "exact", head: true }).eq("author", p.id).then(r => { const el = soc.querySelector("#c-posts"); if (el) el.textContent = r.count || 0; });
    bindFollow(soc.querySelector(".sn-pcard"), setFol);
    renderPosts(soc.querySelector("#pl"), sb.from("posts").select(POST_SEL).eq("author", p.id).order("created_at", { ascending: false }).limit(40), { mark: true, empty: self ? "У тебя пока нет постов. Напиши в Ленту!" : "Постов пока нет" });
  }

  // ---------- люди: поиск и подписки ----------
  async function people() {
    if (!sb) return offline();
    soc.innerHTML = `<div class="sn-h"><h2>Люди</h2></div>
      <label class="card sn-search sn reveal">${I.search}<input type="search" maxlength="20" placeholder="Поиск по нику" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
      <div id="ul" class="sn sn-list"><div class="sn-empty">Загрузка…</div></div>`;
    const inp = soc.querySelector(".sn-search input"), box = soc.querySelector("#ul");
    let seq = 0, t = null;
    const run = async () => {
      const qv = inp.value.trim().toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_]/g, ""), my = ++seq;
      let q = sb.from("profiles").select(PROF + ",bio");
      if (qv) q = q.ilike("username", `%${qv}%`);
      const { data, error } = await q.order("verified", { ascending: false }).order("created_at", { ascending: false }).limit(40);
      if (my !== seq || !box.isConnected) return;
      if (error) { box.innerHTML = `<div class="sn-empty">Не удалось загрузить</div>`; return; }
      box.innerHTML = data.length ? data.map(p => `<a class="card sn-urow" href="#u/${esc(p.username)}">${av(p)}<div class="who">${name(p, true)}<span class="sn-t">${esc(p.bio || "")}</span></div>${followBtn(p)}</a>`).join("")
        : `<div class="card sn-empty">Никого не нашли</div>`;
      bindFollow(box);
    };
    inp.oninput = () => { clearTimeout(t); t = setTimeout(run, 250); };
    run();
  }

  // ---------- отзывы ----------
  async function reviews() {
    if (!sb) return offline();
    soc.innerHTML = `<div class="sn-h"><h2>Отзывы</h2></div>
      <section class="card sn-box sn reveal" id="ravg"><div class="sn-empty">Загрузка…</div></section>
      <section class="card sn-box sn reveal" id="rf"></section>
      <div id="rl" class="sn sn-list"></div>`;
    const { data, error } = await sb.from("reviews").select(`id,rating,text,reply,pinned,created_at,author,a:profiles!reviews_author_fkey(${PROF})`)
      .order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(100);
    if (!soc.querySelector("#rl")) return;
    if (error) { soc.querySelector("#ravg").innerHTML = `<div class="sn-empty">Не удалось загрузить отзывы</div>`; return; }
    const avg = data.length ? data.reduce((s, r) => s + r.rating, 0) / data.length : 0;
    soc.querySelector("#ravg").innerHTML = data.length
      ? `<div class="sn-avg"><b>${avg.toFixed(1)}</b><div>${stars(Math.round(avg))}<div class="sn-t">${data.length} ${plural(data.length, "отзыв", "отзыва", "отзывов")}</div></div></div>`
      : `<div class="sn-note">Отзывов пока нет. Будь первым!</div>`;
    const mine = ME && data.find(r => r.author === ME.id);
    const rf = soc.querySelector("#rf");
    if (!ME) rf.innerHTML = needLogin("оставить отзыв");
    else if (ME.banned) rf.remove();
    else {
      let val = mine ? mine.rating : 5;
      rf.innerHTML = `<h3>${mine ? "Твой отзыв" : "Оставить отзыв"}</h3><form>
        <div class="sn-pick">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-v="${i}" aria-label="${i}">${I.fstar}</button>`).join("")}</div>
        <textarea name="t" maxlength="600" rows="2" placeholder="Что думаешь?" required>${esc(mine ? mine.text : "")}</textarea>
        <div class="row"><span class="msg"></span>${mine ? `<button class="btn alt" type="button" id="rdel">Удалить</button>` : ""}<button class="btn" type="submit">${mine ? "Обновить" : "Отправить"}</button></div></form>`;
      const paint = () => rf.querySelectorAll(".sn-pick button").forEach(b => b.classList.toggle("on", +b.dataset.v <= val));
      rf.querySelectorAll(".sn-pick button").forEach(b => b.onclick = () => { val = +b.dataset.v; paint(); }); paint();
      const f = rf.querySelector("form");
      f.onsubmit = async e => {
        e.preventDefault(); const m = f.querySelector(".msg");
        try { await rpc("sn_save_review", { p_rating: val, p_text: f.t.value }); toast("Спасибо за отзыв!"); reviews(); } catch (er) { say(m, errText(er), "err"); }
      };
      const del = rf.querySelector("#rdel");
      if (del) del.onclick = async () => { try { await rpc("sn_delete_review", { p_id: mine.id }); reviews(); } catch (er) { toast(errText(er)); } };
    }
    const adm = ME && ME.is_admin;
    const owner = OWNER_P || { username: OWNER, verified: true, is_admin: true };
    soc.querySelector("#rl").innerHTML = data.map(r => `<article class="card sn-post${r.pinned ? " pin" : ""}" data-id="${r.id}">
        ${r.pinned ? `<div class="sn-pl">${I.pin}закреплено</div>` : ""}
        <div class="sn-ph">${av(r.a)}<div class="who">${name(r.a)}<span class="sn-t">${ago(r.created_at)}</span></div>${stars(r.rating)}</div>
        <div class="sn-text">${esc(r.text)}</div>
        ${r.reply ? `<div class="sn-rp">${name(owner)}<div class="sn-text">${esc(r.reply)}</div></div>` : ""}
        ${adm ? `<div class="sn-acts"><button class="mini-b rp">${r.reply ? "изменить ответ" : "ответить"}</button><button class="mini-b pn">${r.pinned ? "открепить" : "закрепить"}</button><span class="sp"></span><button class="mini-b del">удалить</button></div>` : ""}
      </article>`).join("");
    if (adm) soc.querySelectorAll("#rl .sn-post").forEach(el => {
      const id = +el.dataset.id, r = data.find(x => x.id === id), q = s => el.querySelector(s);
      q(".pn").onclick = async () => { try { await rpc("sn_pin_review", { p_id: id, p_pin: !r.pinned }); reviews(); } catch (er) { toast(errText(er)); } };
      q(".del").onclick = async () => { try { await rpc("sn_delete_review", { p_id: id }); reviews(); } catch (er) { toast(errText(er)); } };
      q(".rp").onclick = () => {
        if (q("form")) return q("form").remove();
        const f = document.createElement("form"); f.style.marginTop = "10px";
        f.innerHTML = `<textarea name="t" maxlength="600" placeholder="Ответ (пусто = убрать)" style="min-height:60px"></textarea><div class="row"><span class="msg"></span><button class="btn" type="submit">Сохранить</button></div>`;
        f.t.value = r.reply || ""; el.append(f); f.t.focus();
        f.onsubmit = async e => { e.preventDefault(); try { await rpc("sn_reply_review", { p_id: id, p_text: f.t.value }); reviews(); } catch (er) { say(f.querySelector(".msg"), errText(er), "err"); } };
      };
    });
  }

  // ---------- общий чат ----------
  async function chat() {
    if (!sb) return offline();
    soc.innerHTML = `<div class="sn-h"><h2>Общий чат</h2><span id="on">подключаюсь…</span></div>
      <section class="card sn-chat sn reveal"><div class="list"><div class="sn-empty">Загрузка…</div></div>
        ${ME && !ME.banned ? `<form><input name="t" maxlength="400" autocomplete="off" placeholder="Сообщение…" required><button class="btn" type="submit">→</button></form>`
          : `<div class="lock">${ME ? `<span class="sn-note">Аккаунт заблокирован</span>` : needLogin("писать в чат")}</div>`}
      </section>`;
    const list = soc.querySelector(".sn-chat .list"), shown = new Map(), profs = new Map();
    let lastId = 0, alive = true, poll = null;
    const atBottom = () => list.scrollHeight - list.scrollTop - list.clientHeight < 80;
    const getProfs = async ids => {
      const need = [...new Set(ids)].filter(i => !profs.has(i));
      if (need.length) { const { data } = await sb.from("profiles").select(PROF).in("id", need); (data || []).forEach(p => profs.set(p.id, p)); }
    };
    const add = (m, force) => {
      if (shown.has(m.id)) return;
      if (list.querySelector(".sn-empty")) list.innerHTML = "";
      const p = profs.get(m.author), mine = ME && m.author === ME.id, stick = force || atBottom();
      const el = document.createElement("div"); el.className = "sn-m" + (mine ? " me" : ""); el.dataset.id = m.id;
      el.innerHTML = `${av(p)}<div class="bb"><div class="hd">${name(p)}<span class="sn-t">${hhmm(m.created_at)}</span>
        ${ME && (ME.is_admin || mine) ? `<button class="x" title="удалить" aria-label="удалить">×</button>` : ""}</div><div class="sn-text">${esc(m.text)}</div></div>`;
      const x = el.querySelector(".x");
      if (x) x.onclick = async () => { try { await rpc("sn_delete_chat", { p_id: m.id }); el.remove(); shown.delete(m.id); } catch (er) { toast(errText(er)); } };
      list.append(el); shown.set(m.id, el); lastId = Math.max(lastId, m.id);
      if (stick) list.scrollTop = list.scrollHeight;
    };
    const fetchNew = async () => {
      const { data } = await sb.from("chat_messages").select("id,author,text,created_at").gt("id", lastId).order("id").limit(50);
      if (!alive || !data) return; await getProfs(data.map(m => m.author)); data.forEach(m => add(m));
    };
    const { data, error } = await sb.from("chat_messages").select("id,author,text,created_at").order("id", { ascending: false }).limit(80);
    if (!alive) return;
    if (error) { list.innerHTML = `<div class="sn-empty">Не удалось загрузить чат</div>`; return; }
    await getProfs(data.map(m => m.author));
    list.innerHTML = data.length ? "" : `<div class="sn-empty">Тут пока тихо. Напиши первым!</div>`;
    data.reverse().forEach(m => add(m, true));
    const onEl = soc.querySelector("#on");
    const ch = sb.channel("chat-room")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, async pl => { await getProfs([pl.new.author]); if (alive) add(pl.new); })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "chat_messages" }, pl => { const el = shown.get(pl.old && pl.old.id); if (el) { el.remove(); shown.delete(pl.old.id); } })
      .subscribe(st => {
        if (!alive) return;
        if (st === "SUBSCRIBED") { if (onEl) onEl.textContent = "в реальном времени"; clearInterval(poll); poll = null; }
        else if (!poll && (st === "CHANNEL_ERROR" || st === "TIMED_OUT" || st === "CLOSED")) { if (onEl) onEl.textContent = "обновляется"; poll = setInterval(fetchNew, 6000); }
      });
    cleanup = () => { alive = false; clearInterval(poll); sb.removeChannel(ch); };
    const f = soc.querySelector(".sn-chat form");
    if (f) f.onsubmit = async e => {
      e.preventDefault(); const t = f.t.value.trim(); if (!t) return;
      const b = f.querySelector(".btn"); b.disabled = true;
      try { await rpc("sn_send_chat", { p_text: t }); f.reset(); await fetchNew(); list.scrollTop = list.scrollHeight; } catch (er) { toast(errText(er)); }
      b.disabled = false; f.t.focus();
    };
  }

  // ---------- переходник: аватарка владельца, подписка, быстрые входы ----------
  let linksDone = false;
  function decorateLinks() {
    if (linksDone || !app) return;
    const prof = app.querySelector(".profile"); if (!prof) return;
    linksDone = true;
    const o = OWNER_P, u = avUrl(o);
    if (u) { const a = app.querySelector(".profile .avatar"); if (a) { a.innerHTML = ""; const im = new Image(); im.alt = ""; im.src = u; a.append(im); } }
    const card = document.createElement("div"); card.className = "sn-lk reveal";
    card.innerHTML = `${o ? `<div class="sn-lk-row"><span class="sn-t" id="lk-fol">·</span>${followBtn(o)}</div>` : ""}
      <div class="sn-lk-nav">
        <a href="#feed">${I.feed}<span>Лента</span></a><a href="#chat">${I.chat}<span>Чат</span></a>
        <a href="#people">${I.people}<span>Люди</span></a><a href="#reviews">${I.star}<span>Отзывы</span></a>
      </div>`;
    prof.after(card);
    if (o) {
      const setFol = async () => { const n = await countOf("following", o.id); const el = card.querySelector("#lk-fol"); if (el) el.textContent = `${n} ${plural(n, "подписчик", "подписчика", "подписчиков")}`; };
      setFol(); bindFollow(card, setFol);
    }
  }

  // ---------- переходы ----------
  const ROUTES = { "": hub, feed, posts, people, reviews, chat, me };
  function route() {
    cleanup(); cleanup = () => {};
    const h = decodeURIComponent(location.hash.slice(1));
    top();
    if (h === "links" || h === "admin") { soc.hidden = true; app.hidden = false; decorateLinks(); scrollTo(0, 0); return; }
    app.hidden = true; soc.hidden = false;
    if (h.startsWith("u/")) profile(h.slice(2));
    else (ROUTES[h] || hub)();
    scrollTo(0, 0);
  }

  (async () => {
    const qs = new URLSearchParams(location.search);
    app.hidden = true; top();
    if (sb) {
      try { await Promise.all([loadMe(), loadOwner()]); } catch {}
      sb.auth.onAuthStateChange((ev, s) => {
        if (ev === "PASSWORD_RECOVERY") RECOVERY = true;
        if (ev === "SIGNED_OUT" || (ev === "SIGNED_IN" && (!session || !s || s.user.id !== session.user.id)))
          setTimeout(async () => { await loadMe(); route(); }, 0);
        else session = s;
      });
    }
    let jump = null;
    if (qs.has("reset") && session) { RECOVERY = true; jump = "#me"; }
    else if (qs.get("go") === "me") { jump = "#me"; if (!session) setTimeout(() => toast("Почта подтверждена. Теперь войди"), 400); }
    if (qs.get("error_description")) setTimeout(() => toast("Ссылка устарела или уже использована"), 400);
    if (location.search) history.replaceState(null, "", location.pathname + (jump || location.hash));
    addEventListener("hashchange", route);
    route();
  })();
})();

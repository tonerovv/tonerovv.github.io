// =====================================================================
//  Соцсеть сайта: меню при входе, аккаунты, посты, отзывы, общий чат.
//  Секретов тут нет: только публичный ключ из config.js. Все права
//  проверяет база (RLS и функции sn_*), сайт их обойти не может.
// =====================================================================
(() => {
  const S = window.SITE || {}, C = S.comments || {};
  const app = document.getElementById("app"), soc = document.getElementById("soc");
  if (!soc) return;
  const BASE_URL = (C.supabaseUrl || "").replace(/\/$/, "");
  const SITE_URL = location.origin + location.pathname;
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
    star: svg('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/>'),
    chat: svg('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.8A8 8 0 1 1 21 12z"/>'),
    heart: svg('<path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.1 1.7-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21z"/>'),
    bubble: svg('<path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.8A8 8 0 1 1 21 12z"/>'),
    pin: svg('<path fill="currentColor" d="M16 3H8v2l1 1v5l-3 3v2h5v5l1 1 1-1v-5h5v-2l-3-3V6l1-1z"/>', 'width="12" height="12"'),
    fstar: svg('<path fill="currentColor" d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z"/>'),
    badge: svg('<path fill="#fff" d="m12 1 2.6 2 3.2-.3 1 3.1 2.8 1.6-.9 3.1 1.3 3-2.6 1.9-.4 3.2-3.2.5L14 22.6l-2-1.2-2 1.2-1.8-2.7-3.2-.5-.4-3.2L2 14.3l1.3-3-.9-3.1 2.8-1.6 1-3.1 3.2.3z"/><path d="m8 12 2.7 2.7L16.3 9" fill="none" stroke="#000" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>'),
  };
  const ago = t => {
    const s = (Date.now() - new Date(t)) / 1000;
    return s < 60 ? "только что" : s < 3600 ? Math.floor(s / 60) + " мин" : s < 86400 ? Math.floor(s / 3600) + " ч" : new Date(t).toLocaleDateString("ru-RU");
  };
  const hhmm = t => new Date(t).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  // ссылки кликабельны только в постах админа и только https
  const linkify = s => esc(s).replace(/https:\/\/[^\s<]+[^\s<.,!?;:)]/g, u => `<a href="${u}" target="_blank" rel="noopener noreferrer nofollow">${u}</a>`);
  const av = p => `<span class="sn-av${p && p.is_admin ? " adm" : ""}">${esc(((p && p.username) || "?")[0])}</span>`;
  const name = p => p ? `<span class="sn-n">@${esc(p.username)}${p.verified ? I.badge : ""}${p.is_admin ? ' <i class="sn-tag">админ</i>' : ""}${p.banned ? ' <i class="sn-tag ban">бан</i>' : ""}</span>` : `<span class="sn-n">удалён</span>`;
  const stars = n => `<span class="sn-stars" aria-label="${n} из 5">${[1, 2, 3, 4, 5].map(i => `<span class="${i <= n ? "" : "off"}">${I.fstar}</span>`).join("")}</span>`;
  const PROF = "id,username,verified,is_admin,banned";
  const errText = e => {
    const m = String((e && (e.message || e.error_description)) || e || "");
    if (/too fast/i.test(m)) return "Слишком часто, подожди пару секунд";
    if (/no links/i.test(m)) return "Ссылки и @ники писать нельзя";
    if (/banned/i.test(m)) return "Твой аккаунт заблокирован";
    if (/not signed|JWT|401/i.test(m)) return "Нужно войти в аккаунт";
    if (/admin only/i.test(m)) return "Только для админа";
    if (/bad length/i.test(m)) return "Пусто или слишком длинно";
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

  // ---------- состояние ----------
  let session = null, ME = null, RECOVERY = false, cleanup = () => {};
  const loadMe = async () => {
    if (!sb) return;
    session = (await sb.auth.getSession()).data.session;
    ME = null;
    if (session) {
      const { data } = await sb.from("profiles").select(PROF + ",bio,created_at").eq("id", session.user.id).maybeSingle();
      ME = data || null;
    }
    top();
  };

  // ---------- верхняя панель ----------
  const nav = document.createElement("nav"); nav.className = "sn-top";
  document.body.append(nav);
  const top = () => {
    const h = location.hash.slice(1);
    nav.innerHTML = `<a href="#" class="${h === "" ? "ghost" : ""}">${I.back}Меню</a>
      <a href="#me">${I.user}${ME ? "@" + esc(ME.username) : "Войти"}</a>`;
  };

  // ---------- меню при входе ----------
  function hub() {
    const letter = esc((S.name || "?")[0]);
    soc.innerHTML = `<section class="sn-hero reveal">
        <div class="avatar-wrap"><div class="avatar">${S.avatar ? `<img alt="" src="${esc(S.avatar)}">` : ""}<span ${S.avatar ? "hidden" : ""}>${letter}</span></div></div>
        <h1>${esc(S.name || "")}${S.verified ? `<span class="verified">${I.badge}</span>` : ""}</h1>
        <p>Куда идём?</p>
      </section>
      <div class="sn-grid">
        <a class="card sn-tile hl reveal" href="#links"><span class="ic">${I.link}</span><span><b>Переходник</b><small>все мои ссылки и музыка</small></span></a>
        <a class="card sn-tile reveal" href="#posts"><span class="ic">${I.post}</span><span><b>Посты</b><small>новости от ${esc(S.name || "меня")}</small></span></a>
        <a class="card sn-tile reveal" href="#reviews"><span class="ic">${I.star}</span><span><b>Отзывы</b><small>оценки и мнения</small></span></a>
        <a class="card sn-tile reveal" href="#chat"><span class="ic">${I.chat}</span><span><b>Общий чат</b><small>пиши всем сразу</small></span></a>
        <a class="card sn-tile wide reveal" href="#me"><span class="ic">${I.user}</span><span><b>${ME ? "@" + esc(ME.username) : "Аккаунт"}</b><small>${ME ? "твой профиль" : "войти или зарегистрироваться"}</small></span></a>
      </div>`;
    soc.querySelectorAll(".reveal").forEach((el, i) => el.style.animationDelay = i * 60 + "ms");
    const im = soc.querySelector(".avatar img");
    if (im) im.addEventListener("error", () => { im.remove(); soc.querySelector(".avatar span").hidden = false; });
  }

  const needLogin = what => `<div class="sn-note">Чтобы ${what}, <a href="#me">войди или создай аккаунт</a>.</div>`;
  const offline = () => { soc.innerHTML = `<div class="card sn-box sn-note">Сейчас не получается подключиться. Обнови страницу чуть позже.</div>`; };

  // ---------- аккаунт ----------
  function me() {
    if (!sb) return offline();
    if (!session) return authForms();
    if (RECOVERY) return newPassword();
    if (!ME) { soc.innerHTML = `<div class="card sn-box sn sn-note">Профиль не найден. <button class="linkb" id="lo">Выйти</button></div>`; soc.querySelector("#lo").onclick = logout; return; }
    soc.innerHTML = `<div class="sn-h"><h2>Профиль</h2></div>
      <section class="card sn-box sn reveal">
        ${ME.banned ? `<div class="sn-ban">Аккаунт заблокирован: писать нельзя, читать можно.</div>` : ""}
        <div class="sn-prof"><span class="sn-av big${ME.is_admin ? " adm" : ""}">${esc(ME.username[0])}</span>
          <div>${name(ME)}<div class="sn-t">с нами с ${new Date(ME.created_at).toLocaleDateString("ru-RU")}</div></div></div>
        <form id="bio"><textarea name="b" maxlength="160" placeholder="Пара слов о себе">${esc(ME.bio || "")}</textarea>
          <div class="row"><span class="msg"></span><button class="btn" type="submit">Сохранить</button></div></form>
      </section>
      <section class="card sn-box sn reveal"><h3>Сменить пароль</h3>
        <form id="pw"><input name="p" type="password" minlength="8" maxlength="72" autocomplete="new-password" placeholder="Новый пароль (8+ символов, латиница и цифры)" required>
          <div class="row"><span class="msg"></span><button class="btn alt" type="submit">Сменить</button></div></form>
      </section>
      ${ME.is_admin ? `<section class="card sn-box sn reveal"><h3>Админ: бан</h3>
        <form id="ban"><input name="u" maxlength="20" placeholder="ник без @" autocomplete="off" required>
          <div class="row"><span class="msg"></span><button class="btn alt" type="button" data-b="0">Разбанить</button><button class="btn" type="submit">Забанить</button></div></form>
      </section>` : ""}
      <div class="sn" style="display:flex;justify-content:center"><button class="btn alt" id="lo">Выйти из аккаунта</button></div>`;
    const bio = soc.querySelector("#bio");
    bio.onsubmit = async e => {
      e.preventDefault(); const m = bio.querySelector(".msg");
      try { await rpc("sn_update_bio", { p_bio: bio.b.value }); say(m, "Сохранено", "ok"); } catch (er) { say(m, errText(er), "err"); }
    };
    const pw = soc.querySelector("#pw");
    pw.onsubmit = async e => {
      e.preventDefault(); const m = pw.querySelector(".msg");
      const { error } = await sb.auth.updateUser({ password: pw.p.value });
      error ? say(m, errText(error), "err") : (say(m, "Пароль изменён", "ok"), pw.reset());
    };
    const ban = soc.querySelector("#ban");
    if (ban) {
      const go = async on => {
        const m = ban.querySelector(".msg"), u = ban.u.value.trim().replace(/^@/, "");
        if (!u) return;
        try { const ok = await rpc("sn_set_ban", { p_username: u, p_ban: on }); say(m, ok ? (on ? "Забанен" : "Разбанен") : "Ник не найден", ok ? "ok" : "err"); }
        catch (er) { say(m, errText(er), "err"); }
      };
      ban.onsubmit = e => { e.preventDefault(); go(true); };
      ban.querySelector("[data-b]").onclick = () => go(false);
    }
    soc.querySelector("#lo").onclick = logout;
  }
  async function logout() { await sb.auth.signOut(); session = null; ME = null; top(); location.hash = "#"; }

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
          if (!/^[a-z0-9_]{3,20}$/.test(u)) throw { message: "Ник: 3–20 символов, только латиница, цифры и _" , custom: 1 };
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

  // ---------- посты ----------
  async function posts() {
    if (!sb) return offline();
    soc.innerHTML = `<div class="sn-h"><h2>Посты</h2><span>от ${esc(S.name || "автора")}</span></div>
      ${ME && ME.is_admin && !ME.banned ? `<section class="card sn-box sn reveal"><form id="np">
        <textarea name="t" maxlength="4000" placeholder="Что нового?" required></textarea>
        <div class="row"><span class="msg"></span><span class="cnt">0/4000</span><button class="btn" type="submit">Опубликовать</button></div></form></section>` : ""}
      <div id="pl" class="sn" style="display:flex;flex-direction:column;gap:14px"><div class="sn-empty">Загрузка…</div></div>`;
    const np = soc.querySelector("#np");
    if (np) {
      np.t.oninput = () => np.querySelector(".cnt").textContent = np.t.value.length + "/4000";
      np.onsubmit = async e => {
        e.preventDefault(); const m = np.querySelector(".msg");
        try { await rpc("sn_create_post", { p_text: np.t.value }); np.reset(); say(m, "Опубликовано", "ok"); loadPosts(); } catch (er) { say(m, errText(er), "err"); }
      };
    }
    loadPosts();
  }
  async function loadPosts() {
    const box = soc.querySelector("#pl"); if (!box) return;
    const { data, error } = await sb.from("posts").select(`id,text,pinned,created_at,a:profiles(${PROF}),post_likes(count),post_comments(count)`)
      .order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(30);
    if (error) { box.innerHTML = `<div class="sn-empty">Не удалось загрузить посты</div>`; return; }
    let liked = new Set();
    if (ME) { const r = await sb.from("post_likes").select("post_id").eq("user_id", ME.id); liked = new Set((r.data || []).map(x => x.post_id)); }
    const adm = ME && ME.is_admin;
    box.innerHTML = data.length ? data.map(p => `<article class="card sn-post${p.pinned ? " pin" : ""}" data-id="${p.id}">
        ${p.pinned ? `<div class="sn-pl">${I.pin}закреплено</div>` : ""}
        <div class="sn-ph">${av(p.a)}<div class="who">${name(p.a)}<span class="sn-t">${ago(p.created_at)}</span></div></div>
        <div class="sn-text">${p.a && p.a.is_admin ? linkify(p.text) : esc(p.text)}</div>
        <div class="sn-acts">
          <button class="sn-pill lk${liked.has(p.id) ? " on" : ""}">${I.heart}<span>${(p.post_likes[0] || {}).count || 0}</span></button>
          <button class="sn-pill cm">${I.bubble}<span>${(p.post_comments[0] || {}).count || 0}</span></button>
          <span class="sp"></span>
          ${adm ? `<button class="mini-b pn">${p.pinned ? "открепить" : "закрепить"}</button><button class="mini-b del dp">удалить</button>` : ""}
        </div></article>`).join("") : `<div class="card sn-empty">Постов пока нет</div>`;
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
      if (q(".pn")) q(".pn").onclick = async () => { try { await rpc("sn_pin_post", { p_id: id, p_pin: !el.classList.contains("pin") }); loadPosts(); } catch (er) { toast(errText(er)); } };
      if (q(".dp")) q(".dp").onclick = async () => {
        const b = q(".dp"); if (b.dataset.sure !== "1") { b.dataset.sure = "1"; b.textContent = "точно удалить?"; return; }
        try { await rpc("sn_delete_post", { p_id: id }); loadPosts(); } catch (er) { toast(errText(er)); }
      };
    });
  }
  async function openComments(el, id) {
    const wrap = document.createElement("div"); wrap.className = "sn-cm"; wrap.innerHTML = `<div class="sn-empty">Загрузка…</div>`;
    el.append(wrap);
    const draw = async () => {
      const { data, error } = await sb.from("post_comments").select(`id,text,created_at,author,a:profiles(${PROF})`).eq("post_id", id).order("created_at").limit(200);
      if (error) { wrap.innerHTML = `<div class="sn-empty">Не удалось загрузить</div>`; return; }
      wrap.innerHTML = (data.length ? data.map(c => `<div class="sn-c" data-id="${c.id}">${av(c.a)}<div class="bd"><div class="hd">${name(c.a)}<span class="sn-t">${ago(c.created_at)}</span>
          ${ME && (ME.is_admin || ME.id === c.author) ? `<button class="mini-b del">удалить</button>` : ""}</div><div class="sn-text">${esc(c.text)}</div></div></div>`).join("") : `<div class="sn-note">Комментариев пока нет.</div>`)
        + (ME && !ME.banned ? `<form><textarea name="t" maxlength="500" placeholder="Твой комментарий" required style="min-height:60px"></textarea>
            <div class="row"><span class="msg"></span><button class="btn" type="submit">Отправить</button></div></form>` : ME ? "" : needLogin("комментировать"));
      wrap.querySelectorAll(".sn-c .del").forEach(b => b.onclick = async () => {
        try { await rpc("sn_delete_comment", { p_id: +b.closest(".sn-c").dataset.id }); draw(); setCount(-1); } catch (er) { toast(errText(er)); }
      });
      const f = wrap.querySelector("form");
      if (f) f.onsubmit = async e => {
        e.preventDefault(); const m = f.querySelector(".msg"), b = f.querySelector(".btn"); b.disabled = true;
        try { await rpc("sn_add_comment", { p_post: id, p_text: f.t.value }); await draw(); setCount(1); } catch (er) { say(m, errText(er), "err"); }
        b.disabled = false;
      };
    };
    const setCount = d => { const n = el.querySelector(".cm span"); n.textContent = Math.max(0, +n.textContent + d); };
    draw();
  }

  // ---------- отзывы ----------
  async function reviews() {
    if (!sb) return offline();
    soc.innerHTML = `<div class="sn-h"><h2>Отзывы</h2></div>
      <section class="card sn-box sn reveal" id="ravg"><div class="sn-empty">Загрузка…</div></section>
      <section class="card sn-box sn reveal" id="rf"></section>
      <div id="rl" class="sn" style="display:flex;flex-direction:column;gap:12px"></div>`;
    const { data, error } = await sb.from("reviews").select(`id,rating,text,reply,pinned,created_at,author,a:profiles(${PROF})`)
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
        <textarea name="t" maxlength="600" placeholder="Что думаешь?" required>${esc(mine ? mine.text : "")}</textarea>
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
    const owner = { username: (S.name || "toner"), verified: true, is_admin: true };
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
  const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };

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

  // ---------- переходы ----------
  const ROUTES = { "": hub, posts, reviews, chat, me };
  function route() {
    cleanup(); cleanup = () => {};
    const h = location.hash.slice(1);
    const r = h === "links" || h === "admin" ? "links" : (h in ROUTES ? h : "");
    top();
    if (r === "links") { soc.hidden = true; app.hidden = false; }
    else { app.hidden = true; soc.hidden = false; ROUTES[r](); }
    scrollTo(0, 0);
  }

  (async () => {
    const qs = new URLSearchParams(location.search);
    app.hidden = true; top();
    if (sb) {
      try { await loadMe(); } catch {}
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

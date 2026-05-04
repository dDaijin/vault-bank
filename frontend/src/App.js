import { useState, useEffect } from "react";

const API = process.env.REACT_APP_API_URL || "https://vault-bank-production.up.railway.app/api";

const api = {
  post: async (url, body, token) => {
    const res = await fetch(`${API}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Помилка сервера");
    return data;
  },
  get: async (url, token) => {
    const res = await fetch(`${API}${url}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Помилка сервера");
    return data;
  },
  patch: async (url, body, token) => {
    const res = await fetch(`${API}${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Помилка сервера");
    return data;
  },
};

/* ─── Валідація ─── */
const validatePhone = (phone) => /^\+380\d{9}$/.test(phone);
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/* ─── Теми ─── */
const THEMES = {
  dark: {
    yellow: "#F5C400",
    red: "#D62828",
    black: "#0A0A0A",
    white: "#F5F0E8",
    gray2: "#1A1A1A",
    gray3: "#2A2A2A",
    gray4: "#F5F0E8",
    muted: "#F5F0E8",
    gridColor: "#222",
  },
  light: {
    yellow: "#A67C00",
    red: "#D62828",
    black: "#F0EDE6",
    white: "#0A0A0A",
    gray2: "#E2DDD6",
    gray3: "#0A0A0A",
    gray4: "#0A0A0A",
    muted: "#3A3530",
    gridColor: "#C8C4BC",
  },
};

// Глобальна змінна теми — оновлюється через ThemeContext
let C = THEMES.dark;

// Оновлює глобальний C — викликається на початку кожного компонента
const useTheme = (theme) => {
  C = THEMES[theme] || THEMES.dark;
};

const FONT = "Oxanium";

const fontUrl = `https://fonts.googleapis.com/css2?family=${FONT.replace(/ /g, "+")}:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap`;
if (!document.querySelector(`link[data-font="${FONT}"]`)) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = fontUrl;
  link.setAttribute("data-font", FONT);
  document.head.appendChild(link);
}

const GlobalStyle = ({ theme }) => {
  const t = THEMES[theme];
  return (
    <style>{`
      body { background: ${t.black}; color: ${t.white}; font-family: '${FONT}', sans-serif; transition: background 0.3s, color 0.3s; }
      .font-display { font-family: '${FONT}', sans-serif; letter-spacing: 0.04em; }
      .font-mono    { font-family: 'Space Mono', monospace; }
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: ${t.black}; }
      ::-webkit-scrollbar-thumb { background: ${t.yellow}; border-radius: 3px; }

      @keyframes fadeUp    { from { opacity:0; transform:translateY(20px);  } to { opacity:1; transform:translateY(0); } }
      @keyframes slideDown { from { opacity:0; transform:translateY(-40px); } to { opacity:1; transform:translateY(0); } }
      @keyframes slideUp   { from { opacity:0; transform:translateY(40px);  } to { opacity:1; transform:translateY(0); } }
      @keyframes shimmer   { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
      @keyframes toastIn   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes toastOut  { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(20px)} }

      .fade-up    { animation: fadeUp    0.4s ease both; }
      .slide-down { animation: slideDown 0.5s ease both; }
      .slide-up   { animation: slideUp   0.5s ease both; }

      .skeleton {
        background: linear-gradient(90deg, ${t.gray2} 25%, ${t.gray3} 50%, ${t.gray2} 75%);
        background-size: 400px 100%;
        animation: shimmer 1.4s infinite linear;
        border-radius: 4px;
      }

      select option { background: ${t.gray2}; color: ${t.white}; }
      li::marker { color: ${t.yellow}; }
    `}</style>
  );
};

/* --- Toast --- */
let _toastSetter = null;
const toast = (msg, type = "success") => { if (_toastSetter) _toastSetter({ msg, type, id: Date.now() }); };

const ToastContainer = () => {
  const [t, setT] = useState(null);
  _toastSetter = setT;
  useEffect(() => {
    if (!t) return;
    const id = setTimeout(() => setT(null), 3200);
    return () => clearTimeout(id);
  }, [t]);
  if (!t) return null;
  const bg  = t.type === "success" ? "rgba(76,175,80,0.12)" : t.type === "error" ? "rgba(214,40,40,0.12)" : "rgba(245,196,0,0.1)";
  const bdr = t.type === "success" ? "rgba(76,175,80,0.4)"  : t.type === "error" ? C.red : C.yellow;
  const icon= t.type === "success" ? "✓" : t.type === "error" ? "✕" : "i";
  return (
    <div style={{
      position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
      zIndex:9999, minWidth:280, maxWidth:420,
      background:bg, border:`1px solid ${bdr}`,
      padding:"12px 20px", display:"flex", alignItems:"center", gap:10,
      animation:"toastIn 0.3s ease both",
    }}>
      <span className="font-mono text-sm" style={{ color:bdr }}>{icon}</span>
      <span className="font-mono text-xs" style={{ color:C.white }}>{t.msg}</span>
    </div>
  );
};

/* --- Skeleton --- */
const Skeleton = ({ w="100%", h=16, mb=8 }) => (
  <div className="skeleton" style={{ width:w, height:h, marginBottom:mb }} />
);

const CardSkeleton = () => (
  <div className="relative p-6 sm:p-8 mb-6" style={{ background:C.black, border:`1px solid ${C.gray4}` }}>
    <Skeleton w="40px" h="28px" mb={20} />
    <Skeleton w="180px" h={10} mb={20} />
    <Skeleton w="80px"  h={10} mb={8}  />
    <Skeleton w="220px" h={48} mb={20} />
    <Skeleton w="160px" h={14} />
  </div>
);

/* --- Avatar --- */
const Avatar = ({ username }) => {
  const colors = ["#E53935","#8E24AA","#1E88E5","#00897B","#F4511E","#6D4C41","#546E7A"];
  const color  = colors[(username?.charCodeAt(0) || 0) % colors.length];
  const letter = (username || "?")[0].toUpperCase();
  return (
    <div style={{ width:38, height:38, borderRadius:"50%", background:color,
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <span className="font-display" style={{ color:"#fff", fontSize:16, fontWeight:700, lineHeight:1 }}>{letter}</span>
    </div>
  );
};

/* --- TxModal --- */
const TxModal = ({ tx, account, onClose }) => {
  if (!tx) return null;
  const incoming = account && tx.to_account_id === account.account_id;
  const color = incoming ? "#4caf50" : C.red;
  const sign  = incoming ? "+" : "−";
  const rows = [
    ["ID", tx.transaction_id],
    ["Тип", tx.type === "transfer" ? "Переказ" : tx.type],
    ["Статус", tx.status],
    ["Сума", `${sign}${Number(tx.amount).toFixed(2)} UAH`],
    ["Від рахунку", tx.from_account_id || "—"],
    ["На рахунок",  tx.to_account_id   || "—"],
    ["Призначення", tx.description     || "—"],
    ["Дата", new Date(tx.created_at).toLocaleString("uk-UA")],
  ];
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:999,
      background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", padding:16,
    }}>
      <div onClick={e => e.stopPropagation()} className="fade-up w-full"
        style={{ maxWidth:480, background:C.gray2, border:`1px solid ${C.yellow}`, padding:24 }}>
        <div className="flex justify-between items-center mb-4">
          <p className="font-mono text-xs tracking-widest uppercase" style={{ color:C.yellow }}>Деталі транзакції</p>
          <button onClick={onClose} className="font-mono text-xs"
            style={{ color:C.muted, background:"none", border:"none", cursor:"pointer" }}>✕ закрити</button>
        </div>
        <div className="mb-4 p-3 text-center" style={{ background:C.black, border:`1px solid ${color}` }}>
          <p className="font-display text-3xl" style={{ color }}>
            {sign}{Number(tx.amount).toFixed(2)} <span style={{ fontSize:16, color:C.muted }}>UAH</span>
          </p>
          <p className="font-mono text-xs mt-1" style={{ color:C.muted }}>
            {incoming ? "Вхідний переказ" : "Вихідний переказ"}
          </p>
        </div>
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between py-2" style={{ borderBottom:`1px solid ${C.gray4}` }}>
            <span className="font-mono text-xs" style={{ color:C.muted }}>{label}</span>
            <span className="font-mono text-xs text-right" style={{ color:C.white, maxWidth:"60%", wordBreak:"break-all" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* --- PasswordStrength --- */
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8)           score++;
  if (/[A-Z]/.test(password))         score++;
  if (/[0-9]/.test(password))         score++;
  if (/[^A-Za-z0-9]/.test(password))  score++;
  const levels = [
    { label:"Дуже слабкий", color:"#D62828" },
    { label:"Слабкий",      color:"#E57C00" },
    { label:"Середній",     color:"#F5C400" },
    { label:"Сильний",      color:"#4CAF50" },
    { label:"Дуже сильний", color:"#2E7D32" },
  ];
  const lvl = levels[score];
  return (
    <div className="mb-4">
      <div style={{ display:"flex", gap:4, marginBottom:4 }}>
        {levels.map((l, i) => (
          <div key={i} style={{ flex:1, height:3, background: i <= score ? lvl.color : C.gray4, transition:"background 0.3s" }} />
        ))}
      </div>
      <p className="font-mono text-xs" style={{ color:lvl.color }}>{lvl.label}</p>
    </div>
  );
};

/* ─── Перемикач теми ─── */
const ThemeToggle = ({ theme, setTheme }) => {
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="font-mono text-xs tracking-widest uppercase px-3 py-2 border transition-all duration-200"
      style={{ borderColor: C.gray4, color: C.muted, background: "transparent", cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.yellow; e.currentTarget.style.color = C.yellow; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.gray4; e.currentTarget.style.color = C.muted; }}
      title={isDark ? "Світла тема" : "Темна тема"}>
      {isDark ? "☀" : "☾"}
    </button>
  );
};

/* ─── UI primitives ─── */
const Input = ({ label, error, disabled, ...props }) => (
  <div className="mb-4">
    {label && (
      <label className="font-mono block text-xs tracking-widest uppercase mb-2" style={{ color: C.muted }}>
        {label}
      </label>
    )}
    <input
      {...props}
      disabled={disabled}
      className="w-full px-4 py-3 text-sm outline-none border transition-colors duration-150"
      style={{
        background: C.black,
        border: `1px solid ${error ? C.red : C.gray4}`,
        color: disabled ? C.gray4 : C.white,
        fontFamily: `'${FONT}', sans-serif`,
        cursor: disabled ? "not-allowed" : "text",
      }}
      onFocus={e => { if (!disabled && !error) e.target.style.borderColor = C.yellow; }}
      onBlur={e => { e.target.style.borderColor = error ? C.red : C.gray4; }}
    />
    {error && <p className="font-mono text-xs mt-1" style={{ color: C.red }}>✕ {error}</p>}
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div className="mb-4">
    {label && (
      <label className="font-mono block text-xs tracking-widest uppercase mb-2" style={{ color: C.muted }}>
        {label}
      </label>
    )}
    <select {...props}
      className="w-full px-4 py-3 text-sm outline-none border"
      style={{
        background: C.black, border: `1px solid ${C.gray4}`,
        color: C.white, fontFamily: `'${FONT}', sans-serif`,
        cursor: "pointer", appearance: "none",
      }}
      onFocus={e => (e.target.style.borderColor = C.yellow)}
      onBlur={e => (e.target.style.borderColor = C.gray4)}>
      {children}
    </select>
  </div>
);

const BtnPrimary = ({ children, loading, className = "", style = {}, ...props }) => (
  <button {...props}
    disabled={props.disabled || loading}
    className={`font-mono text-xs tracking-widest uppercase px-6 py-3 w-full transition-all duration-150 ${className}`}
    style={{
      background: (props.disabled || loading) ? C.gray3 : C.yellow,
      color: (props.disabled || loading) ? C.muted : C.black,
      fontWeight: 700,
      cursor: (props.disabled || loading) ? "not-allowed" : "pointer",
      ...style,
    }}>
    {loading ? "Завантаження..." : children}
  </button>
);

const BtnOutline = ({ children, className = "", ...props }) => (
  <button {...props}
    className={`font-mono text-xs tracking-widest uppercase px-6 py-3 transition-all duration-150 border ${className}`}
    style={{ borderColor: C.gray4, color: C.muted, background: "transparent" }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = C.white; e.currentTarget.style.color = C.white; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.gray4; e.currentTarget.style.color = C.muted; }}>
    {children}
  </button>
);

const Notice = ({ children }) => (
  <div className="mt-4 p-4 text-xs leading-relaxed font-mono"
    style={{ background: "rgba(245,196,0,0.05)", border: `1px solid rgba(245,196,0,0.2)`, color: C.muted }}>
    {children}
  </div>
);

const BgGrid = () => (
  <div className="fixed inset-0 z-0 pointer-events-none" style={{
    backgroundImage: `linear-gradient(${C.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${C.gridColor} 1px, transparent 1px)`,
    backgroundSize: "40px 40px", opacity: 0.2,
  }} />
);

/* ═══════════════════════════════════════
   PAGE 1 — WARNING
═══════════════════════════════════════ */
function WarningPage({ onContinue, theme }) {
  useTheme(theme);
  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
      <BgGrid />
      <div className="fade-up w-full max-w-xl relative p-8 sm:p-12"
        style={{ background: C.gray2, border: `2px solid ${C.yellow}` }}>
        <div className="absolute pointer-events-none"
          style={{ top: -8, left: -8, right: 8, bottom: 8, border: `1px solid ${C.red}` }} />
        <div className="flex items-center gap-4 mb-8">
          <span className="text-4xl">⚠</span>
          <h1 className="font-display text-5xl sm:text-7xl leading-none" style={{ color: C.yellow }}>УВАГА</h1>
        </div>
        <div className="h-px mb-6" style={{ background: C.red }} />
        <p className="text-sm leading-relaxed mb-4" style={{ color: "#c8c2b4" }}>
          <span className="font-semibold" style={{ color: C.white }}>Це навчальний проєкт.</span>{" "}
          Застосунок розроблений виключно в освітніх цілях у рамках лабораторної роботи.
        </p>
        <ul className="list-disc ml-5 text-sm leading-loose mb-4" style={{ color: "#c8c2b4" }}>
          {[
            "Не є реальним банківським застосунком",
            "Не виконує жодних реальних фінансових операцій",
            "Не зберігає і не обробляє реальні фінансові дані",
            "Не несе жодної юридичної відповідальності",
          ].map(item => <li key={item}>{item}</li>)}
        </ul>
        <p className="text-sm leading-relaxed" style={{ color: "#c8c2b4" }}>
          Продовжуючи, ви підтверджуєте, що розумієте навчальний характер проєкту.
        </p>
        <BtnPrimary className="mt-8" onClick={onContinue}>Я розумію — Продовжити →</BtnPrimary>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   PAGE 2 — AUTH
═══════════════════════════════════════ */
function AuthPage({ onLogin, theme }) {
  useTheme(theme);
  const [tab, setTab] = useState("login");

  // Login
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("+380");
  const [regPassword, setRegPassword] = useState("");
  const [regErrors, setRegErrors] = useState({});
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLogin = async () => {
    setLoginError("");
    if (!loginUsername || !loginPassword) { setLoginError("Заповніть всі поля"); return; }
    setLoginLoading(true);
    try {
      const data = await api.post("/auth/login", { username: loginUsername, password: loginPassword });
      localStorage.setItem("token", data.access_token);
      onLogin(data.access_token);
    } catch (e) {
      setLoginError(e.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const validateRegister = () => {
    const errors = {};
    if (!regUsername || regUsername.length < 3) errors.username = "Мінімум 3 символи";
    if (!validateEmail(regEmail)) errors.email = "Невірний формат email";
    if (!validatePhone(regPhone)) errors.phone = "Формат: +380XXXXXXXXX (13 символів)";
    if (!regPassword || regPassword.length < 6) errors.password = "Мінімум 6 символів";
    return errors;
  };

  const handleRegister = async () => {
    const errors = validateRegister();
    setRegErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setRegLoading(true);
    try {
      await api.post("/auth/register", {
        username: regUsername,
        email: regEmail,
        phone_number: regPhone,
        password: regPassword,
      });
      setRegSuccess(true);
      setTimeout(() => {
        setTab("login");
        setRegSuccess(false);
        setLoginUsername(regUsername);
      }, 2000);
    } catch (e) {
      setRegErrors({ general: e.message });
    } finally {
      setRegLoading(false);
    }
  };

  const handlePhoneChange = (val) => {
    if (!val.startsWith("+380")) { setRegPhone("+380"); return; }
    const digits = val.slice(4).replace(/\D/g, "");
    setRegPhone("+380" + digits.slice(0, 9));
  };

  const switchTab = (t) => { setTab(t); setLoginError(""); setRegErrors({}); setRegSuccess(false); };

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
      <BgGrid />
      <div className="fade-up w-full max-w-3xl" style={{ border: `1px solid ${C.gray4}`, background: C.gray2 }}>
        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* LEFT */}
          <div className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden"
            style={{ background: C.black, borderRight: `1px solid ${C.gray4}` }}>
            <div className="absolute -bottom-4 -left-2 font-display text-9xl pointer-events-none leading-none select-none"
              style={{ color: "rgba(245,196,0,0.04)" }}>БАНК</div>
            <div>
              <div className="font-display text-5xl leading-none mb-2" style={{ color: C.yellow }}>
                VAULT<br />BANK
              </div>
              <div className="font-mono text-xs tracking-widest" style={{ color: C.gray4 }}>
                НАВЧАЛЬНИЙ ПРОЄКТ · v0.1
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
              Демонстраційний банківський<br />
              застосунок для лабораторної роботи.<br />
              Жодних реальних операцій.
            </p>
          </div>

          {/* RIGHT */}
          <div className="p-8 sm:p-10">
            <div className="md:hidden mb-8 text-center">
              <div className="font-display text-4xl" style={{ color: C.yellow }}>VAULT BANK</div>
              <div className="font-mono text-xs tracking-widest mt-1" style={{ color: C.gray4 }}>НАВЧАЛЬНИЙ ПРОЄКТ</div>
            </div>

            {/* Tabs */}
            <div className="flex mb-8" style={{ borderBottom: `1px solid ${C.gray4}` }}>
              {[["login", "Вхід"], ["register", "Реєстрація"]].map(([t, label]) => (
                <button key={t} onClick={() => switchTab(t)}
                  className="font-mono text-xs tracking-widest uppercase px-4 py-3"
                  style={{
                      border: "none",
                      borderBottom: `2px solid ${tab === t ? C.yellow : "transparent"}`,
                      background: "transparent",
                      color: tab === t ? C.yellow : C.muted,
                      cursor: "pointer",
                    }}>
                  {label}
                </button>
              ))}
            </div>

            {/* LOGIN */}
            {tab === "login" && (
              <div>
                <Input label="Логін" placeholder="Введіть логін"
                  value={loginUsername} onChange={e => setLoginUsername(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()} />
                <Input label="Пароль" type="password" placeholder="Введіть пароль"
                  value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()} />
                {loginError && <ErrorBox>{loginError}</ErrorBox>}
                <BtnPrimary onClick={handleLogin} loading={loginLoading}>Увійти →</BtnPrimary>
              </div>
            )}

            {/* REGISTER */}
            {tab === "register" && (
              <div>
                {regSuccess && <SuccessBox>Реєстрація успішна! Переходимо до входу...</SuccessBox>}
                {regErrors.general && <ErrorBox>{regErrors.general}</ErrorBox>}
                <Input label="Логін" placeholder="Мінімум 3 символи"
                  value={regUsername} onChange={e => setRegUsername(e.target.value)}
                  error={regErrors.username} />
                <Input label="Email" type="email" placeholder="example@mail.com"
                  value={regEmail} onChange={e => setRegEmail(e.target.value)}
                  error={regErrors.email} />
                <Input label="Телефон" placeholder="+380XXXXXXXXX"
                  value={regPhone} onChange={e => handlePhoneChange(e.target.value)}
                  error={regErrors.phone} />
                <Input label="Пароль" type="password" placeholder="Мінімум 6 символів"
                  value={regPassword} onChange={e => setRegPassword(e.target.value)}
                  error={regErrors.password} />
                <BtnPrimary onClick={handleRegister} loading={regLoading}>
                  Зареєструватись
                </BtnPrimary>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   PAGE 3 — DASHBOARD
═══════════════════════════════════════ */

/* Хук для таймера зворотнього відліку */
function useCountdown(dueDate) {
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!dueDate) return;
    const target = new Date(dueDate).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft("ТЕРМІН ВИЙШОВ");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${d}д ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dueDate]);

  return { timeLeft, expired };
}

/* ─── Форматування дати транзакції ─── */
function formatTxDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("uk-UA", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function DashboardPage({ onNavigate, onLogout, token, theme, setTheme }) {
  useTheme(theme);
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loan, setLoan] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  // Курси валют НБУ
  const [rates, setRates] = useState({ usd: null, eur: null });
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const data = await api.get("/currency/rates", token);
        setRates({
          usd: data.usd ?? null,
          eur: data.eur ?? null,
        });
      } catch (e) {
        console.log("Помилка завантаження курсів НБУ", e);
      } finally {
        setRatesLoading(false);
      }
    };
    fetchRates();
  }, []);

  const copyCard = () => {
    if (!account?.card_number) return;
    navigator.clipboard.writeText(account.card_number).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const [txHistory, setTxHistory] = useState([]);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, accountData] = await Promise.all([
          api.get("/auth/me", token),
          api.get("/accounts/my", token),
        ]);
        setUser(userData);
        setAccount(accountData);
      } catch (e) {
        onLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        const response = await api.get("/loans/my", token);
        setLoan(response);
      } catch (e) {
        console.log("Кредитів не знайдено або помилка", e);
      }
    };
    if (token) fetchLoanData();
  }, [token]);

  // Завантаження історії транзакцій
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.get("/transactions/history", token);
        setTxHistory(data);
      } catch (e) {
        console.log("Помилка завантаження історії", e);
      } finally {
        setTxLoading(false);
      }
    };
    if (token) fetchHistory();
  }, [token]);

  const handleRepay = async (loanId) => {
    try {
      await api.post(`/loans/${loanId}/repay`, {}, token);
      const [updatedAccount, updatedHistory] = await Promise.all([
        api.get("/accounts/my", token),
        api.get("/transactions/history", token),
      ]);
      setLoan(null);
      setAccount(updatedAccount);
      setTxHistory(updatedHistory);
    } catch (e) {
      alert(`Помилка погашення: ${e.message}`);
    }
  };

  const { timeLeft, expired } = useCountdown(loan?.due_date);
  const isBlocked = loan?.status === "active" && (loan?.is_overdue || expired);

  const actions = [
    { id: "credit",   icon: "◈", label: "Кредит",   blocked: isBlocked },
    { id: "transfer", icon: "⇄", label: "Переказ",  blocked: isBlocked },
    { id: "support",  icon: "?", label: "Підтримка", blocked: false },
  ];

  // Визначаємо чи транзакція вхідна для поточного рахунку
  const isIncoming = (tx) =>
    account && tx.to_account_id === account.account_id;

  const txLabel = (tx) => {
    if (tx.type === "transfer") return isIncoming(tx) ? "Переказ отримано" : "Переказ відправлено";
    if (tx.type === "deposit") return "Поповнення";
    return tx.type;
  };

  return (
    <div className="relative z-10 min-h-screen flex items-start justify-center p-6 pb-16">
      <BgGrid />
      <div className="fade-up w-full max-w-sm sm:max-w-md">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase mb-1" style={{ color: C.muted }}>Вітаємо</p>
            <h2 className="text-2xl font-semibold">
              {loading ? "..." : user?.username} <span style={{ color: C.yellow }}>●</span>
            </h2>
          </div>
          <div className="flex gap-2 items-center">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <button onClick={() => onNavigate("profile")}
              className="font-mono text-xs tracking-widest uppercase px-3 py-2 transition-all duration-150 border"
              style={{ borderColor: C.gray4, color: C.muted, background: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.yellow; e.currentTarget.style.color = C.yellow; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.gray4; e.currentTarget.style.color = C.muted; }}>
              ⚙ Профіль
            </button>
            <button onClick={onLogout}
              className="font-mono text-xs tracking-widest uppercase px-3 py-2 transition-all duration-150 border"
              style={{ borderColor: C.gray4, color: C.muted, background: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.gray4; e.currentTarget.style.color = C.muted; }}>
              Вийти ↩
            </button>
          </div>
        </div>

        {/* Bank Card */}
        <div className="relative p-6 sm:p-8 mb-6 overflow-hidden"
          style={{ background: C.black, border: `1px solid ${C.yellow}` }}>
          <div className="absolute right-6 top-4 text-6xl pointer-events-none select-none"
            style={{ color: "rgba(245,196,0,0.06)" }}>◈</div>
          <div className="w-9 h-6 rounded mb-5 relative overflow-hidden"
            style={{ background: C.gray3, border: `1px solid ${C.gray4}` }}>
            <div className="absolute inset-y-0 left-0 right-0 my-auto h-px" style={{ background: C.gray4 }} />
          </div>
          <p className="font-mono text-xs tracking-widest uppercase mb-5" style={{ color: C.yellow }}>
            VAULT BANK · Дебетова картка
          </p>
          <p className="font-mono text-xs tracking-wider mb-2" style={{ color: C.muted }}>Поточний баланс</p>
          <p className="font-display leading-none mb-6" style={{ fontSize: "clamp(42px, 10vw, 56px)", color: C.white }}>
            {loading ? "..." : Number(account?.balance || 0).toFixed(2)}
            <span className="text-2xl" style={{ color: C.muted }}> UAH</span>
          </p>
          <p className="font-mono text-sm tracking-widest cursor-pointer select-none transition-colors duration-150"
            style={{ color: copied ? C.yellow : C.gray4 }}
            onClick={copyCard}
            title="Натисніть щоб скопіювати">
            {loading ? "**** **** **** ****" : (account?.card_number ? account.card_number.replace(/(.{4})(?=.)/g, "$1 ") : "**** **** **** ****")}
            {copied && <span className="ml-2 text-xs" style={{ color: C.yellow }}>✓ скопійовано</span>}
          </p>
        </div>

        {/* Блок курсів валют НБУ */}
        <div className="mb-6 p-4"
          style={{ background: C.gray2, border: `1px solid ${C.gray4}` }}>
          <p className="font-mono text-xs tracking-widest uppercase mb-3"
            style={{ color: C.muted }}>
            Курс НБУ · {new Date().toLocaleDateString("uk-UA")}
          </p>
          {ratesLoading ? (
            <div className="flex gap-4">
              <Skeleton w="120px" h={20} />
              <Skeleton w="120px" h={20} />
            </div>
          ) : (
            <div className="flex gap-4 flex-wrap">
              {/* USD */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs" style={{ color: C.muted }}>USD</span>
                <span className="font-display text-lg" style={{ color: C.white }}>
                  {rates.usd ? Number(rates.usd).toFixed(2) : "—"}
                </span>
                <span className="font-mono text-xs" style={{ color: C.muted }}>₴</span>
              </div>
              <div style={{ width: 1, background: C.gray4 }} />
              {/* EUR */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs" style={{ color: C.muted }}>EUR</span>
                <span className="font-display text-lg" style={{ color: C.white }}>
                  {rates.eur ? Number(rates.eur).toFixed(2) : "—"}
                </span>
                <span className="font-mono text-xs" style={{ color: C.muted }}>₴</span>
              </div>
            </div>
          )}
        </div>

        {/* Блок активного кредиту з таймером */}
        {loan && loan.status === "active" ? (
          <div className="mb-6 p-5"
            style={{ background: C.gray2, border: `1px solid ${isBlocked ? "#8B0000" : C.red}` }}>
            <p className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: C.red }}>
              ◈ Активний кредит
            </p>
            <p className="font-mono text-xs mb-1" style={{ color: C.muted }}>Залишок до сплати</p>
            <p className="font-display text-3xl mb-4" style={{ color: C.white }}>
              {Number(loan.remaining_amount).toFixed(2)}
              <span className="text-base" style={{ color: C.muted }}> UAH</span>
            </p>
            <div className="mb-4 p-3"
              style={{ background: C.black, border: `1px solid ${isBlocked ? "#8B0000" : C.gray4}` }}>
              <p className="font-mono text-xs mb-1" style={{ color: C.muted }}>
                {isBlocked ? "⚠ ОПЕРАЦІЇ ЗАБЛОКОВАНО" : "Залишилось часу"}
              </p>
              <p className="font-mono text-lg tracking-widest"
                style={{ color: isBlocked ? C.red : C.yellow }}>
                {timeLeft || "..."}
              </p>
              {isBlocked && (
                <p className="font-mono text-xs mt-2" style={{ color: C.red }}>
                  Погасіть кредит щоб розблокувати переказ та новий кредит
                </p>
              )}
            </div>
            <BtnPrimary
              style={{ background: C.red, color: C.white }}
              onClick={() => handleRepay(loan.loan_id)}>
              Погасити достроково
            </BtnPrimary>
          </div>
        ) : (
          <div className="mb-6 p-4"
            style={{ background: C.gray2, border: `1px solid ${C.gray4}` }}>
            <p className="font-mono text-xs" style={{ color: C.muted }}>
              ✓ У вас немає активних заборгованостей
            </p>
          </div>
        )}

        {/* Кнопки дій */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {actions.map(a => (
            <button key={a.id}
              onClick={() => !a.blocked && onNavigate(a.id)}
              disabled={a.blocked}
              className="flex flex-col items-center gap-2 py-4 px-2 transition-all duration-150 border"
              style={{
                background: a.blocked ? C.black : C.gray2,
                borderColor: a.blocked ? "#3D0000" : C.gray4,
                cursor: a.blocked ? "not-allowed" : "pointer",
                opacity: a.blocked ? 0.4 : 1,
              }}
              onMouseEnter={e => {
                if (!a.blocked) {
                  e.currentTarget.style.borderColor = C.yellow;
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.background = C.gray3;
                }
              }}
              onMouseLeave={e => {
                if (!a.blocked) {
                  e.currentTarget.style.borderColor = C.gray4;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = C.gray2;
                }
              }}>
              <span className="text-xl">{a.icon}</span>
              <span className="font-mono text-xs tracking-wider" style={{ color: a.blocked ? "#3D0000" : C.muted }}>
                {a.label}
              </span>
            </button>
          ))}
        </div>

        {/* ─── Історія операцій ─── */}
        <div>
          <p className="font-mono text-xs tracking-widest uppercase mb-4"
            style={{ color: C.muted }}>
            Історія операцій
          </p>

          {txLoading ? (
            <p className="font-mono text-xs" style={{ color: C.muted }}>Завантаження...</p>
          ) : txHistory.length === 0 ? (
            <div className="p-4" style={{ background: C.gray2, border: `1px solid ${C.gray4}` }}>
              <p className="font-mono text-xs" style={{ color: C.muted }}>
                Операцій ще немає
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {txHistory.map(tx => {
                const incoming = isIncoming(tx);
                const color = incoming ? "#4caf50" : C.red;
                const sign  = incoming ? "+" : "−";
                return (
                  <div key={tx.transaction_id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ background: C.gray2, border: `1px solid ${C.yellow}` }}>

                    {/* Іконка напрямку */}
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      background: incoming ? "rgba(76,175,80,0.12)" : "rgba(214,40,40,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, color,
                    }}>
                      {incoming ? "↑" : "↓"}
                    </div>

                    {/* Опис і дата */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="font-mono text-xs" style={{
                        color: C.white, margin: 0,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {txLabel(tx)}
                        {tx.description ? ` · ${tx.description}` : ""}
                      </p>
                      <p className="font-mono" style={{ fontSize: 10, color: C.muted, margin: 0, marginTop: 2 }}>
                        {formatTxDate(tx.created_at)}
                      </p>
                    </div>

                    {/* Сума */}
                    <span className="font-mono text-sm" style={{ color, flexShrink: 0, fontWeight: 600 }}>
                      {sign}{Number(tx.amount).toFixed(2)} ₴
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {txHistory.length > 0 && (
            <p className="font-mono text-center mt-3" style={{ fontSize: 10, color: C.muted }}>
              показано останні {txHistory.length} операцій
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SHARED FORM LAYOUT
═══════════════════════════════════════ */
function FormLayout({ title, subtitle, onBack, children, theme }) {
  useTheme(theme);
  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
      <BgGrid />
      <div className="fade-up w-full max-w-sm sm:max-w-md">
        <button onClick={onBack}
          className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase mb-8 transition-colors duration-150"
          style={{ color: C.muted, background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.color = C.yellow)}
          onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
          ← НАЗАД
        </button>
        <h1 className="font-display leading-none mb-2" style={{ fontSize: "clamp(40px, 8vw, 60px)", color: C.yellow }}>
          {title}
        </h1>
        <p className="font-mono text-xs tracking-widest mb-8" style={{ color: C.muted }}>{subtitle}</p>
        <div className="p-6 sm:p-8" style={{ background: C.gray2, border: `1px solid ${C.gray4}` }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Credit ─── */
function CreditPage({ onBack, token, theme }) {
  useTheme(theme);
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleApply = async () => {
    setError("");
    if (!amount || Number(amount) <= 0) { setError("Введіть коректну суму кредиту"); return; }
    if (!term || Number(term) <= 0) { setError("Введіть термін кредиту"); return; }
    setLoading(true);
    try {
      await api.post("/loans/apply", { amount: Number(amount), term_months: Number(term) }, token);
      setSuccess(true);
      setTimeout(() => onBack(), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormLayout title="КРЕДИТ" subtitle="Заявка на отримання кредиту" onBack={onBack}>
      {success && <SuccessBox>Кредит успішно оформлено! Повертаємось...</SuccessBox>}
      {error && <ErrorBox>{error}</ErrorBox>}
      <Input label="Сума кредиту (UAH)" type="number" placeholder="0.00"
        value={amount} onChange={e => setAmount(e.target.value)} />
      <Input label="Термін (місяців)" type="number" placeholder="12"
        value={term} onChange={e => setTerm(e.target.value)} />
      <Input label="Мета кредиту" placeholder="Опишіть мету (необов'язково)"
        value={purpose} onChange={e => setPurpose(e.target.value)} />
      <div className="flex gap-3 mt-6">
        <BtnOutline className="flex-1" onClick={onBack}>Скасувати</BtnOutline>
        <BtnPrimary style={{ width: "auto", flex: 2 }} loading={loading} onClick={handleApply}>
          Подати заявку
        </BtnPrimary>
      </div>
    </FormLayout>
  );
}

/* ─── Transfer ─── */
function TransferPage({ onBack, token, theme }) {
  useTheme(theme);
  const [mode, setMode] = useState("username"); // "username" | "card"
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const switchMode = (m) => {
    setMode(m);
    setQuery("");
    setSearchResult(null);
    setSearchError("");
  };

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearchError(""); setSearchResult(null); setSearching(true);
    try {
      let data;
      if (mode === "username") {
        data = await api.get(`/accounts/search?username=${encodeURIComponent(q)}`, token);
      } else {
        // Прибираємо пробіли якщо юзер вставив форматований номер
        const card = q.replace(/\s/g, "");
        if (card.length !== 16 || !/^\d+$/.test(card)) {
          setSearchError("Номер картки має містити рівно 16 цифр");
          setSearching(false);
          return;
        }
        data = await api.get(`/accounts/search?card_number=${card}`, token);
      }
      setSearchResult(data);
    } catch (e) {
      setSearchError(e.message);
    } finally {
      setSearching(false);
    }
  };

  const handleTransfer = async () => {
    setError("");
    if (!searchResult) { setError("Спочатку знайдіть отримувача"); return; }
    if (!amount || Number(amount) <= 0) { setError("Введіть коректну суму"); return; }
    setLoading(true);
    try {
      await api.post("/transactions/transfer", {
        to_card_number: searchResult.card_number,
        amount: Number(amount),
        description: desc || null,
      }, token);
      setSuccess(true);
      setTimeout(() => onBack(), 2000);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormLayout title="ПЕРЕКАЗ" subtitle="Переказ коштів на інший рахунок" onBack={onBack}>
      {success && <SuccessBox>Переказ успішно виконано! Повертаємось...</SuccessBox>}
      {error && <ErrorBox>{error}</ErrorBox>}

      {/* Перемикач режиму пошуку */}
      <div className="flex mb-5" style={{ borderBottom: `1px solid ${C.gray4}` }}>
        {[["username", "За логіном"], ["card", "За номером картки"]].map(([m, label]) => (
          <button key={m} onClick={() => switchMode(m)}
            className="font-mono text-xs tracking-widest uppercase px-4 py-3"
            style={{
              border: "none",
              borderBottom: `2px solid ${mode === m ? C.yellow : "transparent"}`,
              background: "transparent",
              color: mode === m ? C.yellow : C.muted,
              cursor: "pointer",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Поле пошуку */}
      <div className="mb-4">
        <label className="font-mono block text-xs tracking-widest uppercase mb-2" style={{ color: C.muted }}>
          {mode === "username" ? "Логін отримувача" : "Номер картки (16 цифр)"}
        </label>
        <div className="flex gap-2">
          <input
            placeholder={mode === "username" ? "Введіть логін" : "XXXX XXXX XXXX XXXX"}
            value={query}
            onChange={e => { setQuery(e.target.value); setSearchResult(null); setSearchError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            maxLength={mode === "card" ? 19 : undefined}
            className="flex-1 px-4 py-3 text-sm outline-none border"
            style={{
              background: C.black, border: `1px solid ${C.gray4}`,
              color: C.white, fontFamily: `'${FONT}', sans-serif`,
            }}
            onFocus={e => (e.target.style.borderColor = C.yellow)}
            onBlur={e => (e.target.style.borderColor = C.gray4)}
          />
          <button onClick={handleSearch} disabled={searching || !query.trim()}
            className="font-mono text-xs tracking-widest uppercase px-4 py-3 border transition-all"
            style={{
              borderColor: C.yellow, color: C.yellow,
              background: "transparent",
              cursor: (searching || !query.trim()) ? "not-allowed" : "pointer",
              opacity: !query.trim() ? 0.4 : 1,
            }}>
            {searching ? "..." : "Знайти"}
          </button>
        </div>
        {searchError && <p className="font-mono text-xs mt-1" style={{ color: C.red }}>✕ {searchError}</p>}
      </div>

      {/* Результат пошуку */}
      {searchResult && (
        <div className="mb-4 p-3" style={{ background: C.black, border: `1px solid ${C.yellow}` }}>
          <p className="font-mono text-xs mb-2" style={{ color: C.yellow }}>✓ Отримувач знайдений</p>
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs" style={{ color: C.muted }}>Логін</span>
            <span className="font-mono text-sm" style={{ color: C.white }}>{searchResult.username}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="font-mono text-xs" style={{ color: C.muted }}>Картка</span>
            <span className="font-mono text-xs" style={{ color: C.white }}>
              {searchResult.card_number.replace(/(.{4})(?=.)/g, "$1 ")}
            </span>
          </div>
        </div>
      )}

      <Input label="Сума (UAH)" type="number" placeholder="0.00"
        value={amount} onChange={e => setAmount(e.target.value)} />
      <Input label="Призначення платежу" placeholder="Опис переказу (необов'язково)"
        value={desc} onChange={e => setDesc(e.target.value)} />

      <div className="flex gap-3 mt-6">
        <BtnOutline className="flex-1" onClick={onBack}>Скасувати</BtnOutline>
        <BtnPrimary style={{ width: "auto", flex: 2 }} loading={loading}
          disabled={!searchResult} onClick={handleTransfer}>
          Переказати
        </BtnPrimary>
      </div>
    </FormLayout>
  );
}

/* ─── Deposit ─── */
/* ─── Support ─── */
function SupportPage({ onBack, token, theme }) {
  useTheme(theme);
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  // Завантажуємо дані користувача для автозаповнення
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const [me, acc] = await Promise.all([
          api.get("/auth/me", token),
          api.get("/accounts/my", token),
        ]);
        setUserInfo({ ...me, ...acc });
      } catch (e) {
        console.log("Помилка завантаження даних", e);
      }
    };
    if (token) fetchInfo();
  }, [token]);

  const handleSubmit = async () => {
    setError("");
    if (!problem.trim()) { setError("Опишіть вашу проблему"); return; }
    if (problem.trim().length < 10) { setError("Опис має містити щонайменше 10 символів"); return; }
    setLoading(true);
    try {
      await api.post("/support/send", { problem }, token);
      setSuccess(true);
      setTimeout(() => onBack(), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormLayout title="ПІДТРИМКА" subtitle="Опишіть вашу проблему — ми зв'яжемось з вами" onBack={onBack}>
      {success && <SuccessBox>Звернення надіслано! Очікуйте відповіді. Повертаємось...</SuccessBox>}
      {error && <ErrorBox>{error}</ErrorBox>}

      {/* Дані користувача — тільки для перегляду */}
      {userInfo && (
        <div className="mb-5 p-4" style={{ background: C.black, border: `1px solid ${C.gray4}` }}>
          <p className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: C.muted }}>
            Ваші дані
          </p>
          {[
            ["Користувач", userInfo.username],
            ["Email",      userInfo.email],
            ["Телефон",    userInfo.phone_number || "—"],
            ["Картка",     userInfo.card_number ? userInfo.card_number.replace(/(.{4})(?=.)/g, "$1 ") : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center py-1"
              style={{ borderBottom: `1px solid ${C.gray4}` }}>
              <span className="font-mono text-xs" style={{ color: C.muted }}>{label}</span>
              <span className="font-mono text-xs" style={{ color: C.white }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4">
        <label className="font-mono block text-xs tracking-widest uppercase mb-2" style={{ color: C.muted }}>
          Опис проблеми
        </label>
        <textarea
          rows={5}
          placeholder="Детально опишіть що сталось..."
          value={problem}
          onChange={e => setProblem(e.target.value)}
          className="w-full px-4 py-3 text-sm outline-none border transition-colors duration-150"
          style={{
            background: C.black, border: `1px solid ${C.gray4}`,
            color: C.white, fontFamily: `'Oxanium', sans-serif`,
            resize: "vertical", minHeight: 120,
          }}
          onFocus={e => (e.target.style.borderColor = C.yellow)}
          onBlur={e => (e.target.style.borderColor = C.gray4)}
        />
        <p className="font-mono text-xs mt-1 text-right" style={{ color: C.muted }}>
          {problem.length} символів
        </p>
      </div>

      <div className="flex gap-3 mt-2">
        <BtnOutline className="flex-1" onClick={onBack}>Скасувати</BtnOutline>
        <BtnPrimary style={{ width: "auto", flex: 2 }} loading={loading} onClick={handleSubmit}>
          Надіслати →
        </BtnPrimary>
      </div>
    </FormLayout>
  );
}

/* ─── Profile ─── */
function ProfilePage({ onBack, token, theme }) {
  useTheme(theme);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get("/auth/me", token).then(data => {
      setUser(data);
      setEmail(data.email || "");
      setPhone(data.phone_number || "");
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    const e = {};
    if (!validateEmail(email)) e.email = "Невірний формат email";
    if (phone && !validatePhone(phone)) e.phone = "Формат: +380XXXXXXXXX";
    if (newPassword && newPassword.length < 6) e.newPassword = "Мінімум 6 символів";
    if (newPassword && !oldPassword) e.oldPassword = "Введіть поточний пароль";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true); setError(""); setSuccess("");
    try {
      const payload = { email, phone_number: phone || null };
      if (newPassword) { payload.old_password = oldPassword; payload.new_password = newPassword; }
      await api.patch("/auth/profile", payload, token);
      setSuccess("Дані успішно збережено!");
      setOldPassword(""); setNewPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormLayout title="ПРОФІЛЬ" subtitle="Редагування особистих даних" onBack={onBack}>
      {loading ? <p className="font-mono text-xs" style={{ color: C.muted }}>Завантаження...</p> : (
        <>
          {success && <SuccessBox>{success}</SuccessBox>}
          {error && <ErrorBox>{error}</ErrorBox>}

          <div className="mb-5 p-3" style={{ background: C.black, border: `1px solid ${C.gray4}` }}>
            <p className="font-mono text-xs" style={{ color: C.muted }}>Логін (змінити неможливо)</p>
            <p className="font-mono text-sm mt-1" style={{ color: C.white }}>{user?.username}</p>
          </div>

          <Input label="Email" type="email" value={email}
            onChange={e => setEmail(e.target.value)} error={errors.email} />
          <Input label="Телефон" value={phone}
            onChange={e => setPhone(e.target.value)} error={errors.phone}
            placeholder="+380XXXXXXXXX" />

          <div className="h-px my-5" style={{ background: C.gray4 }} />
          <p className="font-mono text-xs tracking-widest uppercase mb-4" style={{ color: C.muted }}>
            Зміна пароля
          </p>
          <Input label="Поточний пароль" type="password" value={oldPassword}
            onChange={e => setOldPassword(e.target.value)} error={errors.oldPassword}
            placeholder="Введіть поточний пароль" />
          <Input label="Новий пароль" type="password" value={newPassword}
            onChange={e => setNewPassword(e.target.value)} error={errors.newPassword}
            placeholder="Мінімум 6 символів" />

          <div className="flex gap-3 mt-6">
            <BtnOutline className="flex-1" onClick={onBack}>Скасувати</BtnOutline>
            <BtnPrimary style={{ width: "auto", flex: 2 }} loading={saving} onClick={handleSave}>
              Зберегти
            </BtnPrimary>
          </div>
        </>
      )}
    </FormLayout>
  );
}

const SuccessBox = ({ children }) => (
  <div className="mb-4 p-3 text-xs font-mono"
    style={{ background: "rgba(0,200,0,0.08)", border: "1px solid rgba(0,200,0,0.3)", color: "#4caf50" }}>
    ✓ {children}
  </div>
);

const ErrorBox = ({ children }) => (
  <p className="font-mono text-xs mb-4" style={{ color: C.red }}>✕ {children}</p>
);

/* ═══════════════════════════════════════
   ROOT ROUTER
═══════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("warning");
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  // Оновлюємо глобальний C при зміні теми
  C = THEMES[theme];
  useEffect(() => { localStorage.setItem("theme", theme); }, [theme]);

  const handleLogin = (newToken) => {
    setToken(newToken);
    setScreen("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setScreen("auth");
  };

  return (
    <>
      <GlobalStyle theme={theme} />
      {screen === "warning"   && <WarningPage   onContinue={() => setScreen("auth")} theme={theme} />}
      {screen === "auth"      && <AuthPage      onLogin={handleLogin} theme={theme} />}
      {screen === "dashboard" && <DashboardPage onNavigate={s => setScreen(s)} onLogout={handleLogout} token={token} theme={theme} setTheme={setTheme} />}
      {screen === "credit"    && <CreditPage    onBack={() => setScreen("dashboard")} token={token} theme={theme} />}
      {screen === "transfer"  && <TransferPage  onBack={() => setScreen("dashboard")} token={token} theme={theme} />}
      {screen === "support"   && <SupportPage   onBack={() => setScreen("dashboard")} token={token} theme={theme} />}
      {screen === "profile"   && <ProfilePage   onBack={() => setScreen("dashboard")} token={token} theme={theme} />}
    </>
  );
}
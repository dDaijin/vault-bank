Ось відредагована версія вашого README.md.

Я повністю виправив розмітку, прибрав зайві блоки коду, що "зламалися", відформатував скріншоти в зручну сітку (галерею) для кращого вигляду на GitHub, виправив синтаксис `mermaid` та зберег **усі ваші посилання на зображення без змін**:

```markdown
<div align="center">

# 🏦 VAULT BANK

**Сучасний вебзастосунок для імітації банківських операцій та управління фінансами**

[![Project Version](https://img.shields.io/badge/version-v0.1-yellow.svg?style=for-the-badge)](https://github.com/dDaijin/vault-bank)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED.svg?style=for-the-badge&logo=docker&logoColor=white)](https://github.com/dDaijin/vault-bank)
[![Educational](https://img.shields.io/badge/status-educational-orange.svg?style=for-the-badge)](https://github.com/dDaijin/vault-bank)

---

> ⚠️ **УВАГА: Навчальний проєкт**  
> Застосунок розроблений виключно в освітніх цілях у рамках лабораторної роботи.  
> * Не є реальним банківським застосунком  
> * Не виконує жодних реальних фінансових операцій  
> * Не зберігає і не обробляє реальні фінансові дані  
> * Не несе жодної юридичної відповідальності  

---

</div>

## 📌 Про проєкт

**Vault Bank** — це навчальний вебзастосунок з відкритим вихідним кодом, створений для демонстрації принципів побудови банківських систем, обробки грошових переказів, обліку кредитів, логування аудиту та розрахунку кредитного рейтингу користувачів.

Інтерфейс виконано у стильному темному дизайні (*Dark Cyberpunk / Monospaced Aesthetic*) з яскравими жовтими та червоними акцентами.

---

## 🛠 Стек технологій

| Шар | Технології |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (React / Vanilla UI), Tailwind CSS / Custom CSS |
| **Backend** | Node.js / Python (FastAPI/Flask) / C# (.NET) / Go *(залежно від конфігурації)* |
| **Database** | PostgreSQL / MySQL |
| **DevOps & Tools** | Docker, Docker Compose, Git, GitHub Actions |

---

## ⚡ Можливості

* **🔐 Авторизація та безпека:**
  * Реєстрація та вхід за логіном/паролем
  * Двофакторне підтвердження та застереження при вході
  * Хешування паролів та безпечна сесійна аутентифікація
* **💳 Банківські картки та рахунки:**
  * Відображення балансу дебетової картки у реальному часі (UAH)
  * Інтеграція та відображення актуального офіційного курсу НБУ
* **💸 Грошові перекази:**
  * Переказ коштів за **логіном отримувача** або **номером картки**
  * Додавання опису та призначення платежу
* **📊 Кредитування:**
  * Оформлення заявки на кредит (сума, термін, мета)
  * Відстеження активного кредиту та зворотний відлік до сплати
  * Можливість дострокового погашення
* **📜 Історія транзакцій та аудит:**
  * Деталізована історія вхідних і вихідних переказів
  * Система логування дій користувача (`AuditLog`)

---

## 🏗 Архітектура системи

Застосунок побудований за класичною тришаровою архітектурою (*Client-Server-Database*):

```mermaid
flowchart TD
    Client[📱 Web Client / User UI]
    
    subgraph Server [Backend Application]
        API[🚀 REST API Controller]
        AuthService[🔑 Auth & User Service]
        BankService[💸 Transaction & Account Service]
        CreditService[📉 Loan & Credit Score Service]
        AuditService[📝 Audit Log Service]
    end
    
    subgraph Database [PostgreSQL / MySQL]
        DB[(Database Storage)]
    end

    Client <-->|HTTP / JSON Requests| API
    API --> AuthService
    API --> BankService
    API --> CreditService
    API --> AuditService

    AuthService <--> DB
    BankService <--> DB
    CreditService <--> DB
    AuditService <--> DB

```

---

## 🗄 ER Diagram (Схема бази даних)

Нижче представлена структура бази даних системи **Vault Bank**:

---

## 🔌 API Ендпоінти

### Auth & Users

* `POST /api/auth/register` — Реєстрація нового користувача
* `POST /api/auth/login` — Вхід у систему та отримання токена
* `GET /api/user/profile` — Отримання профілю поточного користувача

### Accounts & Balance

* `GET /api/accounts/me` — Інформація про баланс та картку користувача
* `GET /api/nbu-rates` — Отримання актуального курсу валют НБУ

### Transactions

* `POST /api/transactions/transfer` — Здійснення переказу коштів (за логіном або номером картки)
* `GET /api/transactions/history` — Отримання історії останніх операцій

### Loans

* `POST /api/loans/apply` — Подача заявки на кредит
* `POST /api/loans/repay` — Погашення активного кредиту (зокрема дострокове)
* `GET /api/loans/active` — Перегляд поточного кредитного стану

---

## 🐳 Docker Deployment

Проєкт повністю готовий до контейнеризації через Docker Compose.

### Крок 1: Клонування репозиторію

```bash
git clone [https://github.com/dDaijin/vault-bank.git](https://github.com/dDaijin/vault-bank.git)
cd vault-bank

```

### Крок 2: Запуск через Docker Compose

```bash
docker-compose up -d --build

```

Після успішного запуску застосунок буде доступний за адресою: `http://localhost:3000` (або `http://localhost:8080`).

---

## 💻 Покрокове встановлення (Local Setup)

Якщо ви бажаєте запустити проєкт без Docker:

1. **Клонуйте репозиторій:**
```bash
git clone [https://github.com/dDaijin/vault-bank.git](https://github.com/dDaijin/vault-bank.git)
cd vault-bank

```


2. **Налаштуйте змінні середовища:**
Створіть файл `.env` у кореневій директорії на основі `.env.example`:
```env
PORT=8080
DATABASE_URL=postgres://user:password@localhost:5432/vault_bank
JWT_SECRET=your_secret_key

```


3. **Встановіть залежності та запустіть:**
```bash
# Встановлення залежностей
npm install   # або pip install -r requirements.txt / dotnet restore

# Запуск у режимі розробки
npm run dev

```



---

## 🖼 Скріншоти інтерфейсу

| 

<br>1. Попередження (Освітній дисклеймер) | 

<br>2. Форма входу та реєстрації |
| --- | --- |
|  |  |

| 

<br>3. Головна панель (Dashboard) | 

<br>4. Активний кредит та історія |
| --- | --- |
|  |  |

| 

<br>5. Оформлення кредиту | 

<br>6. Переказ коштів |
| --- | --- |
|  |  |

---

## 🚀 Майбутні покращення (Future Improvements)

* [ ] **2FA підтвердження:** Додавання Google Authenticator / SMS OTP для підтвердження переказів.
* [ ] **Підтримка декількох валют (USD, EUR):** Конвертація коштів усередині застосунку за курсом НБУ.
* [ ] **Генерація PDF-квитанцій:** Завантаження офіційних виписок та квитанцій про перекази.
* [ ] **Адмін-панель:** Окремий кабінет для схвалення банківських кредитів та перегляду `AuditLog`.
* [ ] **Push-сповіщення:** Сповіщення у реальному часі про вхідні та вихідні перекази.

```

```

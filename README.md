# 🏦 VaultBank — Banking & Financial Management System

![VaultBank Header Banner](placeholder_banner.png) <!-- ПЛЕЙСХОЛДЕР ДЛЯ БАНЕРА -->

**VaultBank** — це сучасна веб-система для управління банківськими рахунками, фінансовими транзакціями та користувацькими профілями. Проєкт забезпечує високий рівень безпеки, зручний інтерфейс користувача та надійну логіку обробки транзакцій.

---

## <img width="548" height="877" alt="image" src="https://github.com/user-attachments/assets/0ced8ef0-98c5-4b3d-a89d-521a117aca54" />


<div align="center">

### Головна сторінка / Панель управління (Dashboard)
<!-- Вставте посилання на скріншот панелі управління замість placeholder_dashboard.png -->
![Dashboard Placeholder](https://via.placeholder.com/800x450/1e293b/ffffff?text=Dashboard+Screenshot+Here)

</div>

<details>
<summary>🔍 Натисніть, щоб переглянути додаткові скріншоти (Авторизація, Картки, Транзакції)</summary>

<br/>

<div align="center">

| Авторизація / Вхід | Управління картками |
| :---: | :---: |
| ![Auth Placeholder](https://via.placeholder.com/400x250/1e293b/ffffff?text=Login+/+Register) | ![Cards Placeholder](https://via.placeholder.com/400x250/1e293b/ffffff?text=Cards+Management) |

| Історія транзакцій | Перекази коштів |
| :---: | :---: |
| ![Transactions Placeholder](https://via.placeholder.com/400x250/1e293b/ffffff?text=Transaction+History) | ![Transfers Placeholder](https://via.placeholder.com/400x250/1e293b/ffffff?text=Money+Transfer) |

</div>

</details>

---

## 📐 ER-Діаграма бази даних (Entity-Relationship Diagram)

Нижче представлена концептуальна ER-діаграма зв'язків між сутностями системи (Users, Accounts, Cards, Transactions, Roles).

```mermaid
erDiagram
    USERS ||--o{ ACCOUNTS : "owns"
    USERS ||--o{ ROLES : "has"
    ACCOUNTS ||--o{ CARDS : "issues"
    ACCOUNTS ||--o{ TRANSACTIONS : "sender/receiver"

    USERS {
        uuid id PK
        string email
        string password_hash
        string first_name
        string last_name
        datetime created_at
    }

    ACCOUNTS {
        uuid id PK
        uuid user_id FK
        string account_number
        decimal balance
        string currency
        enum status
    }

    CARDS {
        uuid id PK
        uuid account_id FK
        string card_number
        string cvv
        date expiration_date
        enum card_type
    }

    TRANSACTIONS {
        uuid id PK
        uuid source_account_id FK
        uuid destination_account_id FK
        decimal amount
        string currency
        enum status
        datetime timestamp
    }

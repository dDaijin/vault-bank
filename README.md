# 🏦 VaultBank — Banking & Financial Management System

<img width="680" height="625" alt="image" src="https://github.com/user-attachments/assets/c7193620-fce6-4738-97aa-90c955ecc380" />
<!-- ПЛЕЙСХОЛДЕР ДЛЯ БАНЕРА -->

**VaultBank** — це сучасна веб-система для управління банківськими рахунками, фінансовими транзакціями та користувацькими профілями. Проєкт забезпечує високий рівень безпеки, зручний інтерфейс користувача та надійну логіку обробки транзакцій.

---

<img width="875" height="431" alt="image" src="https://github.com/user-attachments/assets/4723586c-8971-4743-a788-fd51bd5de5ce" />


<div align="center">

### Головна сторінка / Панель управління (Dashboard)
<img width="537" height="875" alt="image" src="https://github.com/user-attachments/assets/946b3c70-4440-4c89-b4ff-6e942a050d86" />


</div>

<details>
<summary>🔍 Натисніть, щоб переглянути додаткові скріншоти</summary>

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

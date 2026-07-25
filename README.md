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

| Credit| Transaction |
| :---: | :---: |
| <img width="536" height="627" alt="image" src="https://github.com/user-attachments/assets/1f1d593c-fe13-4c36-ae4e-6188cf05b28e" />
 |<img width="528" height="690" alt="image" src="https://github.com/user-attachments/assets/d99ea2b3-4961-408d-808a-049a8fbe5e7d" />
|

| Transaction History | Support |
| :---: | :---: |
| <img width="536" height="281" alt="image" src="https://github.com/user-attachments/assets/0cce081c-99f5-4fc8-82dc-1865c363553f" />
| <img width="547" height="749" alt="image" src="https://github.com/user-attachments/assets/3945b173-da00-4718-bb7d-5d8a274ad681" />
 |

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

# 📤 Push User Data to Kafka

This Node.js script pushes user data (along with organization, roles, and enriched location metadata) to a Kafka topic (`userEvents`) based on users updated within a specified date range.

---

## 🧾 Table of Contents

-   [📦 Prerequisites](#-prerequisites)
-   [⚙️ Configuration](#️-configuration)
-   [🚀 Usage](#-usage)
-   [📄 What the Script Does](#-what-the-script-does)
-   [📌 Notes](#-notes)
-   [📁 File Structure](#-file-structure)

---

## 📦 Prerequisites

-   Node.js installed
-   PostgreSQL database with user, organization, and role data
-   Kafka running locally or remotely
-   `.env` file configured (see [⚙️ Configuration](#️-configuration))

---

## ⚙️ Configuration

The script expects a `.env` file at the **project root (`../../.env`)** with the following variables:

```env
DEV_DATABASE_URL=postgres://user:password@localhost:5432/database
ENTITY_MANAGEMENT_SERVICE_BASE_URL=http://localhost:5000
INTERNAL_ACCESS_TOKEN=your_internal_token
```

---

## 🚀 Usage

Run the script using:

```bash
node pushUserDataToKafka.js --from="YYYY-MM-DD" --to="YYYY-MM-DD"
```

-   `--from`: Start date (inclusive)
-   `--to`: End date (inclusive)

📌 **Example:**

```bash
node pushUserDataToKafka.js --from="2025-07-01" --to="2025-07-30"
```

---

## 📄 What the Script Does

1. **Connects to PostgreSQL** using the provided `DEV_DATABASE_URL`.
2. **Fetches all users** updated between `from` and `to` dates.
3. For each user:
    - Fetches their associated organizations and roles.
    - Builds a Kafka event object.
    - Enriches location metadata (`state`, `district`, `block`, etc.) by querying an external service.
    - Pushes the event to the Kafka topic: `userEvents`.

✅ **Location enrichment handles failures gracefully**:

-   Missing/failing entities return `{}` or `[{}]` instead of `null`.

---

## 📌 Notes

-   The script assumes Kafka is configured via the file at `../../configs/kafka/index.js`.
-   Events are published using `eventBroadcasterKafka` helper.
-   If an Axios request fails (e.g., service down), it logs an error and continues with the next user.
-   Deleted users are detected via `deleted_at IS NOT NULL` and tagged as `"eventType": "delete"`.

---

## 📁 File Structure

```
.
├── pushUserDataToKafka.js
├── ../../.env
├── ../../configs/kafka/
│   └── index.js
├── ../../helpers/eventBroadcasterMain.js
└── ...
```

# Script Excution

-   Navigate to the script folder using the following command
    ```bash
    cd src/script
    ```
-   Run **uploadSampleCSV.js** in each deployment using the following command:
    ```bash
    node -r module-alias/register uploadSampleCSV.js
    ```

## Email Encryption/Decryption Script

-   Navigate to the script folder using the following command
    ```bash
    cd src/script
    ```
-   Run the **encryptDecryptEmails.js** using the following commands for encryption and decryption respectively.

    Encryption:

    ```
    node ./encryptDecryptEmails.js encrypt
    ```

    Decryption:

    ```
    node ./encryptDecryptEmails.js decrypt
    ```

## Tenant Org Data Migration Script

-   Run from `src/`:

    ```bash
    node scripts/migrateTenantOrgData.js \
      --current-tenant-code=<sourceTenant> \
      --current-org-code=<orgCode> \
      --new-tenant-code=<targetTenant>
    ```

-   Optional flags:
    -   `--role-resolution=strict-id|map-by-title`
    -   `--strict-id-rebase=if-target-tenant-empty|never`
    -   `--delete-mode=soft|hard|none`
    -   `--delete-scope=users-only|all-copied`
    -   `--session-mode=invalidate|migrate`
    -   `--lock-strategy=skip|advisory-only|advisory-table-lock`
    -   `--dry-run=true|false`

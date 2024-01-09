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

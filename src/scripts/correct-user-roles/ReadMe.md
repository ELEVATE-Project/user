# SCRIPT TO CORRECT USER ROLES DATA

## Purpose

The `data-correction.js` script removes the additional white space in the user role title :

## Prerequisites

-   **Node.js**: Available in the environment (pre-installed in the Docker container or local setup).

## Execution Instructions

### Inside the Docker Container

1. Enter into the container bash
2. Navigate to the `src/script/correct-user-roles` folder:
   `bash
cd /path/to/user-service/src/scripts/correct-user-roles
`
3. Copy the script `data-correction.js` file in the `src/script/correct-user-roles` folder of your user service container.
4. Run the script, Make sure the POSTGRES URL is present in `.env`:
    ```bash
    node data-correction.js > output.txt
    ```
5. The script will:
    - Generate an `output.txt` file in the same folder.

# SCRIPT TO DELETE ALL TRANSACTIONAL DATA

## Purpose

The `delete-transactional-data.js` script deletes all transactional data of user service keeping only allowed tenants:

## Prerequisites

-   **Node.js**: Available in the environment (pre-installed in the Docker container or local setup).

## Execution Instructions

### Inside the Docker Container

1. Enter into the container bash
   2.Navigate to the `src/script/delete-scripts` folder:
   `bash
    cd /path/to/user-service/src/scripts/delete-scripts
    `
2. Copy the script `delete-transactional-data.js` file in the `src/script/delete-scripts` folder of your user service container.
3. Run the script, Make sure the POSTGRES URL is present in `.env`:
    ```bash
    node delete-transactional-data.js > output.txt
    ```
4. The script will:
    - Generate an `output.txt` file in the same folder.

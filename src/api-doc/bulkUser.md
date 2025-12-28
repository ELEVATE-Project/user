# Bulk User Creation Guide

This guide provides step-by-step instructions for performing bulk user creation in the Elevate User Service.

## Prerequisites

-   Valid JWT token with admin privileges
-   CSV file containing user data in the required format
-   Access to the API endpoints

## CSV Format

Your CSV file must include the following columns (case-sensitive):

```
name,email,phone_code,phone,username,password,roles,province,district,local_municipality,linkageChampion,supervisor
```

### Sample CSV Content

```
name,email,phone_code,phone,username,password,roles,province,district,local_municipality,linkageChampion,supervisor
Farabi Ahmedullah,farabi.ahmedullah@yopmail.com,91,7012345499,farabi,Password@123,session_manager,SA-EC,SA-EC-ALFR,SA-EC-ALFR-MATA,,amolp
Carol Miranda,carol.miranda@yopmail.com,91,7012345599,carol,Password@123,session_manager,SA-EC,SA-EC-ALFR,SA-EC-ALFR-MATA,,amolp
Amol Patil,amol,patil@yopmail.com,91,7012345699,amolp,Password@123,org_admin,SA-EC,SA-EC-ALFR,SA-EC-ALFR-MATA,,
Suvarna Kale,suvarnak@yopmail.com,91,7012345699,suvarna,Password@123,user,SA-EC,SA-EC-ALFR,SA-EC-ALFR-MATA,,farabi
```

### Field Descriptions

-   `name`: User's full name (required)
-   `email`: User's email address (required if phone not provided)
-   `phone_code`: Country code for phone (e.g., 91 for India)
-   `phone`: User's phone number (required if email not provided)
-   `username`: Desired username (optional, system will generate if not provided)
-   `password`: User's password (required for direct creation, not for invitations)
-   `roles`: Comma-separated list of roles (e.g., "session_manager,org_admin")
-   Additional columns like `province`, `district`, etc., are for metadata

## Step-by-Step Process

### Step 1: Get Signed URL for File Upload

First, obtain a signed URL to upload your CSV file to cloud storage.

**Endpoint:** `GET /v1/cloud-services/file/getSignedUrl`

**Query Parameters:**

-   `fileName`: Name of your CSV file (e.g., `bulk_users.csv`)

**Headers:**

-   `X-auth-token`: Your JWT token

**Example Request:**

```bash
curl --location '{{baseURL}}user/v1/cloud-services/file/getSignedUrl?fileName=bulk_users.csv' \
--header 'X-auth-token: YOUR_JWT_TOKEN'
```

**Response:**

```json
{
	"success": true,
	"message": "SIGNED_URL_GENERATED_SUCCESSFULLY",
	"result": {
		"signedUrl": "https://your-cloud-storage-url...",
		"filePath": "users/YOUR_USER_ID-TIMESTAMP-bulk_users.csv",
		"destFilePath": "users/YOUR_USER_ID-TIMESTAMP-bulk_users.csv"
	}
}
```

### Step 2: Upload CSV File

Upload your CSV file to the signed URL obtained in Step 1.

**Example Request:**

```bash
curl -X PUT -T /path/to/your/bulk_users.csv 'SIGNED_URL_FROM_STEP_1'
```

**Note:** Replace `/path/to/your/bulk_users.csv` with the actual path to your CSV file, and use single quotes around the signed URL to prevent shell interpretation of special characters.

### Step 3: Perform Bulk User Creation

Call the bulk user creation endpoint with the file path from Step 1.

**Endpoint:** `POST /v1/tenant/bulkUserCreate`

**Headers:**

-   `X-auth-token`: Your JWT token
-   Organization code header (configurable via `ORG_CODE_HEADER_NAME` env var, defaults to `x-org-code`): Your organization code (e.g., `brac_gbl`)
-   Tenant code header (configurable via `TENANT_CODE_HEADER_NAME` env var, defaults to `x-tenant-code`): Your tenant code (e.g., `brac`)
-   `Content-Type`: `application/json`

**Note on Headers:** The header names for organization and tenant codes are configurable through environment variables:

-   `ORG_CODE_HEADER_NAME=organization` (current setting)
-   `TENANT_CODE_HEADER_NAME=tenant` (current setting)

If these are not set, the defaults are `x-org-code` and `x-tenant-code`. Use the appropriate header names based on your environment configuration.

**Request Body:**

```json
{
	"file_path": "users/YOUR_USER_ID-TIMESTAMP-bulk_users.csv",
	"editable_fields": ["name", "email"],
	"upload_type": "CREATE"
}
```

**Example Request:**

```bash
curl --location 'http://localhost:3567/user/v1/tenant/bulkUserCreate' \
--header 'Content-Type: application/json' \
--header 'X-auth-token: YOUR_JWT_TOKEN' \
--header 'organization: brac_gbl' \
--header 'tenant: brac' \
--data '{
    "file_path" : "users/YOUR_USER_ID-TIMESTAMP-bulk_users.csv",
    "editable_fields" : ["name"],
    "upload_type": "CREATE"
}'
```

**Note:** The header names `organization` and `tenant` match the current environment variable settings. If your environment uses different header names (e.g., `x-org-code`, `x-tenant-code`), update the curl command accordingly.

**Response:**

```json
{
	"success": true,
	"message": "USER_CSV_UPLOADED",
	"result": {
		"id": 123,
		"name": "bulk_users.csv",
		"input_path": "users/YOUR_USER_ID-TIMESTAMP-bulk_users.csv",
		"type": "CSV",
		"organization_id": 66,
		"created_by": 3074,
		"tenant_code": "brac",
		"uploadType": "CREATE",
		"status": "PENDING",
		"created_at": "2025-12-26T06:31:24.000Z",
		"updated_at": "2025-12-26T06:31:24.000Z"
	}
}
```

## Processing and Results

-   The bulk upload is processed asynchronously via a background queue.
-   You will receive an email notification with a download link to the results CSV once processing is complete.
-   The results CSV will contain the status of each user creation/update attempt.

## Upload Types

-   `"CREATE"`: Directly creates user accounts with provided passwords
-   `"UPLOAD"`: Creates users and sends invitation emails
-   `"INVITE"`: Sends invitation emails without creating accounts

## Troubleshooting

-   **404 Error on Download**: Ensure the CSV file was successfully uploaded to the signed URL in Step 2.
-   **Validation Errors**: Check that your CSV format matches the sample and all required fields are present.
-   **Permission Denied**: Ensure your JWT token has admin privileges for the specified tenant and organization.
-   **Expired Signed URL**: Signed URLs expire after 15 minutes. If expired, repeat Step 1.

## Additional Notes

-   The process supports up to 1000 users per CSV file.
-   Duplicate emails/phones will be handled based on existing user records.
-   System-generated usernames will be assigned if not provided or if conflicts occur.
-   All operations are logged and can be audited.

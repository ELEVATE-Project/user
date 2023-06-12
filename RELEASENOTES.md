# Release Notes

## [Version 1.0.0] - 2023-05-30

### New Features

-   Added a new endpoint `/platform/config` that returns platform-related configuration.

-   Introduced a new feature allowing the admin to limit the number of attendees per session.

### Bug Fixes

-   None

### Changes

-   Updated the report issue email template to handle multiple provided metadata.

### Migrations

-   Added a new migration (`20230529010357-update-report-issue-temp`) that updates the existing report issue email template to accommodate multiple provided metadata.
-   Please follow the migration instructions or run the migration script to apply the necessary changes.

### Environment Changes

-   Added a new environment variable: `SESSION_MENTEE_LIMIT`
    -   Description: Specifies the maximum number of mentees allowed per session.
    -   Default value: 0 (which means no limit).
    -   Set the value to a positive integer to enforce a limit on the number of mentees per session.

### Deprecated Functionality

-   None

### Known Issues

-   None

### Security Updates

-   None

### Documentation

-   [API Doc](https://elevate-apis.shikshalokam.org/mentoring/api-doc)

### Other

-   None

---

<!-- Any other needed details can be added here -->

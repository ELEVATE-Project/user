# Mentoring User Service APIs

## Environment variables:

### Hostname

```
HOST = localhost
```

### Port number

```
PORT = 3000
```

### Mongo DB connecting string

```
MONGODB_URL = mongodb://localhost:27017/{DB}
```

### Database name

```
DB = dbname
```

### Log level

- 0 EMERGENCY system is unusable
- 1 ALERT action must be taken immediately
- 2 CRITICAL the system is in critical condition
- 3 ERROR error condition
- 4 WARNING warning condition
- 5 NOTICE a normal but significant condition
- 6 INFO a purely informational message
- 7 DEBUG messages to debug an application

```
LOG = debug
```

### port Define environment

```
NODE_ENV=development
```

## Environment:

### production

```
NODE_ENV=production node app.js
```

### stage

```
NODE_ENV=stage node app.js
```

### qa

```
NODE_ENV=qa node app.js
```

### development

```
NODE_ENV=development node app.js
```

## CRON JOB FOR SCHEDULED NOTIFICATIONS

```
* * * * * curl --location --request GET 'https://{base_url}/mentoring/v1/notifications/emailCronJob' --header 'internal_access_token: <internal-access-token>'
```

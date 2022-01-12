
let table = require("cli-table");

let tableData = new table();

let enviromentVariables = {
  "APPLICATION_PORT" : {
    "message" : "Required port no",
    "optional" : false
  },
  "APPLICATION_ENV" : {
    "message" : "Required node environment",
    "optional" : false
  },
  "APPLICATION_BASE_URL" : {
    "message" : "Required application base url",
    "optional" : false
  },
  "MONGODB_URL" : {
    "message" : "Required mongodb url",
    "optional" : false
  },
  "ACCESS_TOKEN_SECRET" : {
    "message" : "Required access token secret",
    "optional" : false
  },
  "KAFKA_URL" : {
    "message" : "Required kafka connectivity url",
    "optional" : false
  },
  "KAFKA_GROUP_ID" : {
    "message" : "Required kafka group id",
    "optional" : false
  },
  "NOTIFICATION_KAFKA_TOPIC" : {
    "message" : "Required kafka topic",
    "optional" : false
  },
  "CLOUD_STORAGE" : {
    "message" : "Required cloud storage type ex: AWS/GCP/AZURE",
    "optional" : false
  },
  "GCP_PATH" : {
    "message" : "Required gcp file path ex: gcp.json",
    "optional" : process.env.CLOUD_STORAGE === 'GCP' ? false : true
  },
  "DEFAULT_GCP_BUCKET_NAME" : {
    "message" : "Required gcp bucket name",
    "optional" : process.env.CLOUD_STORAGE === 'GCP' ? false : true
  },
  "GCP_PROJECT_ID" : {
    "message" : "Required gcp project id",
    "optional" : process.env.CLOUD_STORAGE === 'GCP' ? false : true
  },
  "AWS_ACCESS_KEY_ID" : {
    "message" : "Required aws access key id",
    "optional" : process.env.CLOUD_STORAGE === 'AWS' ? false : true
  },
  "AWS_SECRET_ACCESS_KEY" : {
    "message" : "Required aws secret access key",
    "optional" : process.env.CLOUD_STORAGE === 'AWS' ? false : true
  },
  "AWS_BUCKET_REGION" : {
    "message" : "Required aws bucket region",
    "optional" : process.env.CLOUD_STORAGE === 'AWS' ? false : true
  },
  "AWS_BUCKET_ENDPOINT" : {
    "message" : "Required aws bucket endpoint",
    "optional" : process.env.CLOUD_STORAGE === 'AWS' ? false : true
  },
  "DEFAULT_AWS_BUCKET_NAME" : {
    "message" : "Required aws bucket name",
    "optional" : process.env.CLOUD_STORAGE === 'AWS' ? false : true
  },
  "AZURE_ACCOUNT_NAME" : {
    "message" : "Required azure account name",
    "optional" : process.env.CLOUD_STORAGE === 'AZURE' ? false : true
  },
  "AZURE_ACCOUNT_KEY" : {
    "message" : "Required azure account key",
    "optional" : process.env.CLOUD_STORAGE === 'AZURE' ? false : true
  },
  "DEFAULT_AZURE_CONTAINER_NAME" : {
    "message" : "Required azure container name",
    "optional" : process.env.CLOUD_STORAGE === 'AZURE' ? false : true
  },
  "USER_SERIVCE_HOST" : {
    "message" : "Required user service host",
    "optional" : false
  },
  "USER_SERIVCE_BASE_URL" : {
    "message" : "Required user service base url",
    "optional" : false
  },
  "BIG_BLUE_BUTTON_URL" : {
    "message" : "Required big blue button url",
    "optional" : false
  },
  "MEETING_END_CALLBACK_EVENTS" : {
    "message" : "Required meeting end callback events",
    "optional" : false
  },
  "BIG_BLUE_BUTTON_SECRET_KEY" : {
    "message" : "Required big blue button secret key",
    "optional" : false
  },
  "RECORDING_READY_CALLBACK_URL" : {
    "message" : "Required recording ready callback url",
    "optional" : true
  },
  "ENABLE_LOG" : {
    "message" : "log enable or disable",
    "optional" : true
  }


  
  
  
}

let success = true;

module.exports = function() {
  Object.keys(enviromentVariables).forEach(eachEnvironmentVariable=>{
  
    let tableObj = {
      [eachEnvironmentVariable] : "PASSED"
    };
  
    let keyCheckPass = true;


    if(enviromentVariables[eachEnvironmentVariable].optional === true
      && enviromentVariables[eachEnvironmentVariable].requiredIf
      && enviromentVariables[eachEnvironmentVariable].requiredIf.key
      && enviromentVariables[eachEnvironmentVariable].requiredIf.key != ""
      && enviromentVariables[eachEnvironmentVariable].requiredIf.operator
      && validRequiredIfOperators.includes(enviromentVariables[eachEnvironmentVariable].requiredIf.operator)
      && enviromentVariables[eachEnvironmentVariable].requiredIf.value
      && enviromentVariables[eachEnvironmentVariable].requiredIf.value != "") {
        switch (enviromentVariables[eachEnvironmentVariable].requiredIf.operator) {
          case "EQUALS":
            if(process.env[enviromentVariables[eachEnvironmentVariable].requiredIf.key] === enviromentVariables[eachEnvironmentVariable].requiredIf.value) {
              enviromentVariables[eachEnvironmentVariable].optional = false;
            }
            break;
          case "NOT_EQUALS":
              if(process.env[enviromentVariables[eachEnvironmentVariable].requiredIf.key] != enviromentVariables[eachEnvironmentVariable].requiredIf.value) {
                enviromentVariables[eachEnvironmentVariable].optional = false;
              }
              break;
          default:
            break;
        }
    }
      
    if(enviromentVariables[eachEnvironmentVariable].optional === false) {
      if(!(process.env[eachEnvironmentVariable])
        || process.env[eachEnvironmentVariable] == "") {
        success = false;
        keyCheckPass = false;
      } else if (enviromentVariables[eachEnvironmentVariable].possibleValues
        && Array.isArray(enviromentVariables[eachEnvironmentVariable].possibleValues)
        && enviromentVariables[eachEnvironmentVariable].possibleValues.length > 0) {
        if(!enviromentVariables[eachEnvironmentVariable].possibleValues.includes(process.env[eachEnvironmentVariable])) {
          success = false;
          keyCheckPass = false;
          enviromentVariables[eachEnvironmentVariable].message += ` Valid values - ${enviromentVariables[eachEnvironmentVariable].possibleValues.join(", ")}`
        }
      }
    }

    if((!(process.env[eachEnvironmentVariable])
      || process.env[eachEnvironmentVariable] == "")
      && enviromentVariables[eachEnvironmentVariable].default
      && enviromentVariables[eachEnvironmentVariable].default != "") {
      process.env[eachEnvironmentVariable] = enviromentVariables[eachEnvironmentVariable].default;
    }

    if(!keyCheckPass) {
      if(enviromentVariables[eachEnvironmentVariable].message !== "") {
        tableObj[eachEnvironmentVariable] = 
        enviromentVariables[eachEnvironmentVariable].message;
      } else {
        tableObj[eachEnvironmentVariable] = `FAILED - ${eachEnvironmentVariable} is required`;
      }
    }

    tableData.push(tableObj);
  })

  console.log(tableData.toString());
  
  return {
    success : success
  }
}

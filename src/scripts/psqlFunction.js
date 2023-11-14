const { Sequelize } = require('sequelize')
require('dotenv').config({ path: '../.env' })

const nodeEnv = process.env.NODE_ENV || 'development'

let databaseUrl

switch (nodeEnv) {
	case 'production':
		databaseUrl = process.env.PROD_DATABASE_URL
		break
	case 'test':
		databaseUrl = process.env.TEST_DATABASE_URL
		break
	default:
		databaseUrl = process.env.DEV_DATABASE_URL
}

if (!databaseUrl) {
	console.error(`${nodeEnv} DATABASE_URL not found in environment variables.`)
	process.exit(1)
}

const sequelize = new Sequelize(databaseUrl, {
	dialect: 'postgres',
})

const createFunctionSQL = `
  CREATE OR REPLACE FUNCTION transform_jsonb_to_text_array(input_jsonb jsonb) RETURNS text[] AS $$
  DECLARE
    result text[];
    element text;
  BEGIN
    IF jsonb_typeof(input_jsonb) = 'object' THEN
      result := ARRAY[]::text[];
      FOR element IN SELECT jsonb_object_keys(input_jsonb)
      LOOP
        result := array_append(result, element);
      END LOOP;
    ELSIF jsonb_typeof(input_jsonb) = 'array' THEN
      result := ARRAY[]::text[];
      FOR element IN SELECT jsonb_array_elements_text(input_jsonb)
      LOOP
        result := array_append(result, element);
      END LOOP;
    ELSE
      result := ARRAY[]::text[];
    END IF;
    RETURN result;
  END;
  $$ LANGUAGE plpgsql;
`

sequelize
	.query(createFunctionSQL)
	.then((res) => {
		console.log('Function created successfully', res)
		sequelize.close()
	})
	.catch((error) => {
		console.error('Error creating function:', error)
		sequelize.close()
	})

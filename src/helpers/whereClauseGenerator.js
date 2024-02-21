const generateWhereClause = (tableName) => {
	let whereClause = ''

	switch (tableName) {
		case 'users':
			whereClause = `deleted_at IS NULL AND status = 'ACTIVE'`
			break

		default:
			whereClause = 'deleted_at IS NULL'
	}

	return whereClause
}

const whereClauseGenerator = {
	generateWhereClause,
}

module.exports = whereClauseGenerator

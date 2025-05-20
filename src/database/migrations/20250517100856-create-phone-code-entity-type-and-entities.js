/** @type {import('sequelize-cli').Migration} */
const EntityType = require('@database/models/index').EntityType

module.exports = {
	async up(queryInterface, Sequelize) {
		try {
			const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
			const tenantCode = process.env.DEFAULT_TENANT_CODE
			if (!defaultOrgId) {
				throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
			}

			const entitiesArray = [
				{
					entityType: 'phone_code',
					entities: [
						{ value: '+93', label: 'Afghanistan' },
						{ value: '+355', label: 'Albania' },
						{ value: '+213', label: 'Algeria' },
						{ value: '+1-684', label: 'American Samoa' },
						{ value: '+376', label: 'Andorra' },
						{ value: '+244', label: 'Angola' },
						{ value: '+1-264', label: 'Anguilla' },
						{ value: '+672', label: 'Antarctica' },
						{ value: '+1-268', label: 'Antigua and Barbuda' },
						{ value: '+54', label: 'Argentina' },
						{ value: '+374', label: 'Armenia' },
						{ value: '+297', label: 'Aruba' },
						{ value: '+61', label: 'Australia' },
						{ value: '+43', label: 'Austria' },
						{ value: '+994', label: 'Azerbaijan' },
						{ value: '+1-242', label: 'Bahamas' },
						{ value: '+973', label: 'Bahrain' },
						{ value: '+880', label: 'Bangladesh' },
						{ value: '+1-246', label: 'Barbados' },
						{ value: '+375', label: 'Belarus' },
						{ value: '+32', label: 'Belgium' },
						{ value: '+501', label: 'Belize' },
						{ value: '+229', label: 'Benin' },
						{ value: '+1-441', label: 'Bermuda' },
						{ value: '+975', label: 'Bhutan' },
						{ value: '+591', label: 'Bolivia' },
						{ value: '+387', label: 'Bosnia and Herzegovina' },
						{ value: '+267', label: 'Botswana' },
						{ value: '+55', label: 'Brazil' },
						{ value: '+246', label: 'British Indian Ocean Territory' },
						{ value: '+1-284', label: 'British Virgin Islands' },
						{ value: '+673', label: 'Brunei' },
						{ value: '+359', label: 'Bulgaria' },
						{ value: '+226', label: 'Burkina Faso' },
						{ value: '+257', label: 'Burundi' },
						{ value: '+855', label: 'Cambodia' },
						{ value: '+237', label: 'Cameroon' },
						{ value: '+1', label: 'Canada' },
						{ value: '+238', label: 'Cape Verde' },
						{ value: '+1-345', label: 'Cayman Islands' },
						{ value: '+236', label: 'Central African Republic' },
						{ value: '+235', label: 'Chad' },
						{ value: '+56', label: 'Chile' },
						{ value: '+86', label: 'China' },
						{ value: '+57', label: 'Colombia' },
						{ value: '+269', label: 'Comoros' },
						{ value: '+682', label: 'Cook Islands' },
						{ value: '+506', label: 'Costa Rica' },
						{ value: '+385', label: 'Croatia' },
						{ value: '+53', label: 'Cuba' },
						{ value: '+599', label: 'Curacao' },
						{ value: '+357', label: 'Cyprus' },
						{ value: '+420', label: 'Czech Republic' },
						{ value: '+243', label: 'Democratic Republic of the Congo' },
						{ value: '+45', label: 'Denmark' },
						{ value: '+253', label: 'Djibouti' },
						{ value: '+1-767', label: 'Dominica' },
						{ value: '+1-809', label: 'Dominican Republic' },
						{ value: '+670', label: 'East Timor' },
						{ value: '+593', label: 'Ecuador' },
						{ value: '+20', label: 'Egypt' },
						{ value: '+503', label: 'El Salvador' },
						{ value: '+240', label: 'Equatorial Guinea' },
						{ value: '+291', label: 'Eritrea' },
						{ value: '+372', label: 'Estonia' },
						{ value: '+251', label: 'Ethiopia' },
						{ value: '+500', label: 'Falkland Islands' },
						{ value: '+298', label: 'Faroe Islands' },
						{ value: '+679', label: 'Fiji' },
						{ value: '+358', label: 'Finland' },
						{ value: '+33', label: 'France' },
						{ value: '+689', label: 'French Polynesia' },
						{ value: '+241', label: 'Gabon' },
						{ value: '+220', label: 'Gambia' },
						{ value: '+995', label: 'Georgia' },
						{ value: '+49', label: 'Germany' },
						{ value: '+233', label: 'Ghana' },
						{ value: '+350', label: 'Gibraltar' },
						{ value: '+30', label: 'Greece' },
						{ value: '+299', label: 'Greenland' },
						{ value: '+1-473', label: 'Grenada' },
						{ value: '+1-671', label: 'Guam' },
						{ value: '+502', label: 'Guatemala' },
						{ value: '+44-1481', label: 'Guernsey' },
						{ value: '+224', label: 'Guinea' },
						{ value: '+245', label: 'Guinea-Bissau' },
						{ value: '+592', label: 'Guyana' },
						{ value: '+509', label: 'Haiti' },
						{ value: '+504', label: 'Honduras' },
						{ value: '+852', label: 'Hong Kong' },
						{ value: '+36', label: 'Hungary' },
						{ value: '+354', label: 'Iceland' },
						{ value: '+91', label: 'India' },
						{ value: '+62', label: 'Indonesia' },
						{ value: '+98', label: 'Iran' },
						{ value: '+964', label: 'Iraq' },
						{ value: '+353', label: 'Ireland' },
						{ value: '+44-1624', label: 'Isle of Man' },
						{ value: '+972', label: 'Israel' },
						{ value: '+39', label: 'Italy' },
						{ value: '+225', label: 'Ivory Coast' },
						{ value: '+1-876', label: 'Jamaica' },
						{ value: '+81', label: 'Japan' },
						{ value: '+44-1534', label: 'Jersey' },
						{ value: '+962', label: 'Jordan' },
						{ value: '+7', label: 'Kazakhstan' },
						{ value: '+254', label: 'Kenya' },
						{ value: '+686', label: 'Kiribati' },
						{ value: '+383', label: 'Kosovo' },
						{ value: '+965', label: 'Kuwait' },
						{ value: '+996', label: 'Kyrgyzstan' },
						{ value: '+856', label: 'Laos' },
						{ value: '+371', label: 'Latvia' },
						{ value: '+961', label: 'Lebanon' },
						{ value: '+266', label: 'Lesotho' },
						{ value: '+231', label: 'Liberia' },
						{ value: '+218', label: 'Libya' },
						{ value: '+423', label: 'Liechtenstein' },
						{ value: '+370', label: 'Lithuania' },
						{ value: '+352', label: 'Luxembourg' },
						{ value: '+853', label: 'Macau' },
						{ value: '+389', label: 'Macedonia' },
						{ value: '+261', label: 'Madagascar' },
						{ value: '+265', label: 'Malawi' },
						{ value: '+60', label: 'Malaysia' },
						{ value: '+960', label: 'Maldives' },
						{ value: '+223', label: 'Mali' },
						{ value: '+356', label: 'Malta' },
						{ value: '+692', label: 'Marshall Islands' },
						{ value: '+222', label: 'Mauritania' },
						{ value: '+230', label: 'Mauritius' },
						{ value: '+262', label: 'Mayotte' },
						{ value: '+52', label: 'Mexico' },
						{ value: '+691', label: 'Micronesia' },
						{ value: '+373', label: 'Moldova' },
						{ value: '+377', label: 'Monaco' },
						{ value: '+976', label: 'Mongolia' },
						{ value: '+382', label: 'Montenegro' },
						{ value: '+1-664', label: 'Montserrat' },
						{ value: '+212', label: 'Morocco' },
						{ value: '+258', label: 'Mozambique' },
						{ value: '+95', label: 'Myanmar' },
						{ value: '+264', label: 'Namibia' },
						{ value: '+674', label: 'Nauru' },
						{ value: '+977', label: 'Nepal' },
						{ value: '+31', label: 'Netherlands' },
						{ value: '+687', label: 'New Caledonia' },
						{ value: '+64', label: 'New Zealand' },
						{ value: '+505', label: 'Nicaragua' },
						{ value: '+227', label: 'Niger' },
						{ value: '+234', label: 'Nigeria' },
						{ value: '+683', label: 'Niue' },
						{ value: '+850', label: 'North Korea' },
						{ value: '+1-670', label: 'Northern Mariana Islands' },
						{ value: '+47', label: 'Norway' },
						{ value: '+968', label: 'Oman' },
						{ value: '+92', label: 'Pakistan' },
						{ value: '+680', label: 'Palau' },
						{ value: '+970', label: 'Palestine' },
						{ value: '+507', label: 'Panama' },
						{ value: '+675', label: 'Papua New Guinea' },
						{ value: '+595', label: 'Paraguay' },
						{ value: '+51', label: 'Peru' },
						{ value: '+63', label: 'Philippines' },
						{ value: '+48', label: 'Poland' },
						{ value: '+351', label: 'Portugal' },
						{ value: '+1-787', label: 'Puerto Rico' },
						{ value: '+974', label: 'Qatar' },
						{ value: '+242', label: 'Republic of the Congo' },
						{ value: '+40', label: 'Romania' },
						{ value: '+250', label: 'Rwanda' },
						{ value: '+590', label: 'Saint Barthelemy' },
						{ value: '+290', label: 'Saint Helena' },
						{ value: '+1-869', label: 'Saint Kitts and Nevis' },
						{ value: '+1-758', label: 'Saint Lucia' },
						{ value: '+508', label: 'Saint Pierre and Miquelon' },
						{ value: '+1-784', label: 'Saint Vincent and the Grenadines' },
						{ value: '+685', label: 'Samoa' },
						{ value: '+378', label: 'San Marino' },
						{ value: '+239', label: 'Sao Tome and Principe' },
						{ value: '+966', label: 'Saudi Arabia' },
						{ value: '+221', label: 'Senegal' },
						{ value: '+381', label: 'Serbia' },
						{ value: '+248', label: 'Seychelles' },
						{ value: '+232', label: 'Sierra Leone' },
						{ value: '+65', label: 'Singapore' },
						{ value: '+1-721', label: 'Sint Maarten' },
						{ value: '+421', label: 'Slovakia' },
						{ value: '+386', label: 'Slovenia' },
						{ value: '+677', label: 'Solomon Islands' },
						{ value: '+252', label: 'Somalia' },
						{ value: '+27', label: 'South Africa' },
						{ value: '+82', label: 'South Korea' },
						{ value: '+211', label: 'South Sudan' },
						{ value: '+34', label: 'Spain' },
						{ value: '+94', label: 'Sri Lanka' },
						{ value: '+249', label: 'Sudan' },
						{ value: '+597', label: 'Suriname' },
						{ value: '+268', label: 'Swaziland' },
						{ value: '+46', label: 'Sweden' },
						{ value: '+41', label: 'Switzerland' },
						{ value: '+963', label: 'Syria' },
						{ value: '+886', label: 'Taiwan' },
						{ value: '+992', label: 'Tajikistan' },
						{ value: '+255', label: 'Tanzania' },
						{ value: '+66', label: 'Thailand' },
						{ value: '+228', label: 'Togo' },
						{ value: '+690', label: 'Tokelau' },
						{ value: '+676', label: 'Tonga' },
						{ value: '+1-868', label: 'Trinidad and Tobago' },
						{ value: '+216', label: 'Tunisia' },
						{ value: '+90', label: 'Turkey' },
						{ value: '+993', label: 'Turkmenistan' },
						{ value: '+1-649', label: 'Turks and Caicos Islands' },
						{ value: '+688', label: 'Tuvalu' },
						{ value: '+1-340', label: 'U.S. Virgin Islands' },
						{ value: '+256', label: 'Uganda' },
						{ value: '+380', label: 'Ukraine' },
						{ value: '+971', label: 'United Arab Emirates' },
						{ value: '+44', label: 'United Kingdom' },
						{ value: '+598', label: 'Uruguay' },
						{ value: '+998', label: 'Uzbekistan' },
						{ value: '+678', label: 'Vanuatu' },
						{ value: '+379', label: 'Vatican' },
						{ value: '+58', label: 'Venezuela' },
						{ value: '+84', label: 'Vietnam' },
						{ value: '+681', label: 'Wallis and Futuna' },
						{ value: '+967', label: 'Yemen' },
						{ value: '+260', label: 'Zambia' },
						{ value: '+263', label: 'Zimbabwe' },
					],
					has_entities: true,
					model: 'User',
				},
			]

			const entityTypeFinalArray = entitiesArray.map((entity) => {
				const { entityType, has_entities, model } = entity
				return {
					value: entityType,
					label: convertToWords(entityType),
					data_type: 'STRING',
					status: 'ACTIVE',
					updated_at: new Date(),
					created_at: new Date(),
					created_by: 0,
					updated_by: 0,
					allow_filtering: false,
					organization_id: defaultOrgId,
					tenant_code: tenantCode,
					has_entities,
					allow_custom_entities: false,
				}
			})
			await queryInterface.bulkInsert('entity_types', entityTypeFinalArray, {})

			const entityTypes = await queryInterface.sequelize.query('SELECT * FROM entity_types', {
				type: queryInterface.sequelize.QueryTypes.SELECT,
			})

			const entitiesFinalArray = entityTypes.reduce((acc, eachType) => {
				const entityData = entitiesArray.find((entity) => entity.entityType === eachType.value)
				if (
					entityData &&
					eachType.has_entities &&
					Array.isArray(entityData?.entities) &&
					entityData.entities.length > 0
				) {
					entityData.entities.forEach((eachEntity) => {
						acc.push({
							...eachEntity,
							entity_type_id: eachType.id,
							type: 'SYSTEM',
							status: 'ACTIVE',
							created_at: new Date(),
							updated_at: new Date(),
							created_by: 0,
							updated_by: 0,
						})
					})
				}
				return acc
			}, [])

			await queryInterface.bulkInsert('entities', entitiesFinalArray, {})
		} catch (error) {
			console.error('ERR : : ', error)
		}
	},

	async down(queryInterface, Sequelize) {
		// Find the permissions related to 'rollouts'
		const entityType = await EntityType.findOne({
			where: {
				value: 'phone_code',
			},
		})

		await queryInterface.bulkDelete(
			'entity_types',
			{
				value: 'phone_code',
			},
			{}
		)
		await queryInterface.bulkDelete(
			'entities',
			{
				entity_type_id: entityType.id,
			},
			{}
		)
	},
}

function convertToWords(inputString) {
	const words = inputString.replace(/_/g, ' ').split(' ')

	const capitalizedWords = words.map((word) => {
		return word.charAt(0).toUpperCase() + word.slice(1)
	})

	const result = capitalizedWords.join(' ')

	return result
}

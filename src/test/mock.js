module.exports = {
	loginResponse: {
		responseCode: 'OK',
		message: 'User logged in successfully.',
		result: {
			access_token:
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjYyODMyNTMxYTA1Y2JkNTdiMjczYWViYiIsImVtYWlsIjoiYW5raXQuc0BwYWNld2lzZG9tLmNvbSIsIm5hbWUiOiJBbmtpdCIsImlzQU1lbnRvciI6ZmFsc2V9LCJpYXQiOjE2NTI4NTQ0MjAsImV4cCI6MTY1Mjk0MDgyMH0.TGuFqQ6pSbQW3NyiG8BZzAz0kPN7NiX2VS0yD4dhRUs',
			refresh_token:
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjYyODMyNTMxYTA1Y2JkNTdiMjczYWViYiIsImVtYWlsIjoiYW5raXQuc0BwYWNld2lzZG9tLmNvbSIsIm5hbWUiOiJBbmtpdCIsImlzQU1lbnRvciI6ZmFsc2V9LCJpYXQiOjE2NTI4NTQ0MjAsImV4cCI6MTY2ODY2NTYyMH0.fThfHLWiRDv1ez0KmBiOd2wUsYsHg7r--RhXrd68e1M',
			user: {
				email: {
					verified: false,
					address: 'example@mail.com',
				},
			},
			isAMentor: false,
			hasAcceptedTAndC: false,
			deleted: false,
			_id: '62832531a05cbd57b273aebb',
			name: 'Ankit',
			designation: [
				{
					value: 1,
					lable: 'Teacher',
				},
			],
			location: [
				{
					value: 1,
					lable: 'Bangalore',
				},
			],
			areasOfExpertise: [
				{
					value: 1,
					lable: 'Educational Leadership',
				},
			],
			languages: [
				{
					value: 1,
					lable: 'English',
				},
			],
			updatedAt: '2022-05-18T05:24:52.431Z',
			createdAt: '2022-05-18T05:24:52.431Z',
			__v: 0,
			lastLoggedInAt: '2022-05-18T05:24:52.431Z',
			about: 'This is test about of mentee',
			experience: '4.2',
			gender: 'MALE',
			image: 'https://cloudstorage.com/container/abc.png',
		},
	},
	userData: {
		email: {
			address: 'example@mail.com',
			verified: true,
		},
		// password: "$2a$10$5Ya1LAAjoM3/fgNXcrpg2uAS79fiZlUMJeiU2m.87sCn0KvVq1xRS",
		password: '$2a$10$5Ya1LAAjoM3/fgNXcrpg2uAS79fiZlUMJeiU2m.87sCn0KvVq1xRS',
		name: 'abcd',
		isAMentor: true,
		hasAcceptedTAndC: true,
		deleted: false,
		about: 'about user',
		experience: '2',
	},
}

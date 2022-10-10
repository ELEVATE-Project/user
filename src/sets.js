function containsSpecialChars(str) {
	const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
	return specialChars.test(str)
}

console.log(containsSpecialChars('#$_&-()')) // 👉️ true
console.log(containsSpecialChars('!@#$%^')) // 👉️ false
console.log(containsSpecialChars('one two')) // 👉️ false

if (containsSpecialChars('hello!')) {
	console.log('✅ string contains special characters')
} else {
	console.log('⛔️ string does NOT contain special characters')
}

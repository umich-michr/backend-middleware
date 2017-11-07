function differenceInYears(a, b) {
	return parseInt(a.getFullYear(), 10) - parseInt(b.getFullYear(), 10);
}

function formatDate(date) {
	return date.toISOString().substring(0, 'YYYY-MM-DD'.length);
}

function hasBirthdayPassed(now, birthday) {
	const birthdayInThisYear = new Date(formatDate(now).substring(0, 4) + formatDate(birthday).substring(4));
	return now.getTime() >= birthdayInThisYear.getTime();
}

module.exports = {
	people: {
		fullName(person) {
			return `${person.firstName} "${person.nickname}" ${person.lastName}`;
		},
		age(person) {
			const now = new Date();
			const birthday = new Date(person.dob);
			const ageIfBirthdayPassed = differenceInYears(now, birthday);
			return ageIfBirthdayPassed - (hasBirthdayPassed(now, birthday) ? 0 : 1);
		},
		isAdult(person) {
			return this.age(person) >= 18;
		}
	}
};

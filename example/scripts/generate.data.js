// run this file like:
// node ./generate.data.js

const fs = require('fs');

function readCsv(filename) {
	const buffer = fs.readFileSync(filename);
	return buffer.toString().split('\n').filter(x => x).map(line => line.split(','));
}

function writeData(resourceName, list) {
	fs.writeFileSync(`../middleware-config/data/${resourceName}.json`, JSON.stringify(list, null, 2));
}

const nicknames = readCsv('./nicknames.csv');
const lastnames = readCsv('./popular-last.csv');

function randInt(i) {
	return Math.floor(Math.random() * i);
}

function randomChoice(l) {
	return l[randInt(l.length)];
}

function fixNameCase(string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function randomName() {
	const [nick, first] = randomChoice(nicknames);
	const [last] = randomChoice(lastnames);
	return [first, nick, last].map(fixNameCase);
}

function fromTo(a, b) {
	let l = [];
	for (let i = a; i <= b; i++) {
		l.push(i);
	}
	return l;
}

function formatDate(date) {
	return date.toISOString().substring(0, 'YYYY-MM-DD'.length);
}

const people = fromTo(1, 100).map(id => {
	const [firstName, nickname, lastName] = randomName();
	return {
		id,
		firstName,
		nickname,
		lastName,
		dob: formatDate(new Date(randInt(Date.now())))
	};
});

const groups = fromTo(1000, 1099).map(id => {
	const [firstName, nickname, lastName] = randomName();
	return {
		id,
		name: `${firstName}-${nickname}-${lastName}`,
	}
});

for(let person of people) {
	person.groupId = randomChoice(groups).id;
}

writeData('groups', groups);
writeData('people', people);

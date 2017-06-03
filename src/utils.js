function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function percentage(a, total) {
	if (a)
		return Math.round((a / total) * 100) + '%';
	return '0%';
}

export { randomInt, percentage };
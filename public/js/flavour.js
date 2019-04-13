define(['util'], function (util) {

	var flavour = {
		CloseIssue: [
			'Issue Closed',
		],
		BadCommand: [
			'Oops, check input command',
		]
	};

	var exports = {};

	exports.message = function (message, event) {
		var flavourOptions = flavour[event.type];
		if (flavourOptions) {
			var pseudoRandom = new Date(event.timestamp).valueOf() % 100; // last 2 digits of epoch
			var index = Math.floor(pseudoRandom / 100 * flavourOptions.length);
			return message + ' ' + flavourOptions[index];
		}
		return message;
	};

	exports.badCommand = function () {
		return util.getRandomItem(flavour.BadCommand);
	};

	return exports;

});

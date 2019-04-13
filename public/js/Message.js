define(['underscore', 'flavour', 'itemEvent'], function (_, flavour, ItemEvent) {

	function Message(message, speaker, date) {
		this.message = message;
		this.speaker = speaker;
		this.date = date;
	}

	Message.fromEvent = function (event) {
		var messageTemplate = ItemEvent.Type[event.type].message;
		var text = flavour.message(_.template(messageTemplate, event.details), event);
		return new Message(text, event.details.speaker, event.timestamp);
	};

	return Message;

});
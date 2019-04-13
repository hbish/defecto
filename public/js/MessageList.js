define(['ko', 'underscore', 'Message'], function (ko, _, Message) {

	function MessageList($element, socket) {
		this.$element = $element;
		this.messages = ko.observableArray();

		socket.on('history', _.bind(this.processHistory, this));
		socket.on('issue created', _.bind(this.append, this));
		socket.on('issue assigned', _.bind(this.append, this));
		socket.on('issue tagged', _.bind(this.append, this));
		socket.on('issue untagged', _.bind(this.append, this));
		socket.on('issue updated', _.bind(function (props, event) {
			this.append(event);
		}, this));
		socket.on('issue prioritized', _.bind(function (props, event) {
			this.append(event);
		}, this));
		socket.on('issue closed', _.bind(this.append, this));
		socket.on('user message', _.bind(this.append, this));
	}

	MessageList.prototype.processHistory = function (events) {
		this.reset();

		if (!events.length) {
			this.showWelcome();
			return;
		}

		_.each(events, function (event) {
			this.append(event);
		}, this);
	};

	MessageList.prototype.showWelcome = function () {
		this.messages.push(
			new Message('Welcome to Defecto')
		);
	};

	MessageList.prototype.reset = function (event) {
		if (this.messages().length) {
			this.messages([]);
		}
	};

	MessageList.prototype.append = function (event) {
		this.messages.push(Message.fromEvent(event));
		scrollToBottom(this.$element.get(0));
	};

	function scrollToBottom(el) {
		el.scrollTop = el.scrollHeight;
	}

	return MessageList;

});
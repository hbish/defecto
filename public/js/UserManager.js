define(['jquery', 'ko', 'underscore', 'util'], function ($, ko, _, util) {

	var USERNAME_KEY = 'Defecto.username';

	function UserManager($nameInput, socket) {
		this.$nameInput = $nameInput;
		this.namePlaceholder = 'username';
		this.invalidName = ko.observable(false);

		this.current = ko.observable(util.isLocalStorageSupported() ? window.localStorage[USERNAME_KEY] : null);
		this.noUser = ko.computed(function () {
			return !this.current();
		}, this);

		this.onlineUsers = ko.observableArray();

		this.loggedIn = ko.observable(false);
		this.logout = _.bind(this.logout, this);

		this.socket = socket;
		this.socket.on('usernames', _.bind(populateOnlineUsers, this));
	}

	function populateOnlineUsers(users) {
		this.onlineUsers(_.map(users, function (count, name) {
			return { name: name, count: count };
		}));
	}

	UserManager.prototype.attemptLogin = function () {
		this.invalidName(false);
		var name = this.$nameInput.val();
		if (!name || name.trim().length < 3) {
			this.invalidName(true);
			return;
		}

		this.login(name);
	};

	UserManager.prototype.login = function (name) {
		var that = this;
		this.loggedIn(false);
		this.socket.emit('login user', name, function (invalidName) {
			if (!invalidName) {
				if (util.isLocalStorageSupported()) {
					window.localStorage[USERNAME_KEY] = name;
				}
				that.$nameInput.val('');
				that.current(name);
			}
			that.loggedIn(!invalidName);
			that.invalidName(invalidName);
		});
	};

	UserManager.prototype.logout = function () {
		this.$nameInput.focus();
		if (util.isLocalStorageSupported()) {
			delete window.localStorage[USERNAME_KEY];
		}
		this.current(undefined);
		this.socket.emit('logout');
	};

	UserManager.prototype.loginExistingUserIfAny = function () {
		if (this.current()) {
			this.login(this.current());
		}
	};

	UserManager.prototype.isCurrentUser = function (name) {
		return this.current() && name.toLowerCase() === this.current().toLowerCase();
	};

	return UserManager;

});
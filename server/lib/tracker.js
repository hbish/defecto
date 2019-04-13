var sio = require('socket.io'),
	_ = require('underscore'),
	markdown = require('node-markdown').Markdown,
	requirejs = require('../requirejs-configured'),

	issueDao = require('./issueDao'),
	projectDao = require('./projectDao'),
	userDao = require('./userDao'),
	historyDao = require('./historyDao');

var allowedHtml = 'a|b|code|del|em|i|pre|sup|sub|strong|strike';

var tracker = module.exports = {};

requirejs(['public/js/itemEvent'], function (ItemEvent) {

tracker.init = function (app) {
	var that = this;
	that.io = sio.listen(app);
	that.io.configure(function () {
		// excluded websocket due to Chrome bug: https://github.com/LearnBoost/socket.io/issues/425
		that.io.set('transports', ['htmlfile', 'xhr-polling', 'jsonp-polling']);
	});

	_.each(projectDao.findAll(), function (project) {
		that.listen(project);
	});
};

tracker.listen = function (project) {
	var that = this;
	that.io.of('/' + project.slug).on('connection', function (socket) {
		var projectSocket = that.io.of('/' + project.slug);
		onConnect(project, socket, projectSocket);
	});
};

function translateItem(item) {
	if (item.details && item.details.message) {
		item.details.message = markdown(item.details.message, true, allowedHtml, null, true);
	}
	if (item.description) {
		item.description = markdown(item.description, true, allowedHtml, null, true);
	}
	return item;
}

function translate(items) {
	if (!items) {
		return;
	}

	if (_.isArray(items)) {
		return _.map(items, translateItem);
	}
	return translateItem(items);
}

function onConnect(project, socket, projectSocket) {
	socket.emit('issues', translate(issueDao.load(project)));
	socket.emit('usernames', userDao.load(project));
	socket.emit('history', translate(historyDao.load(project)));

	socket.on('login user', function (name, callback) {
		if (userDao.isReservedName(name)) {
			callback(true);
			return;
		}
		callback(false);
		socket.nickname = name;

		userDao.add(name, project);
		projectSocket.emit('usernames', userDao.load(project));
	});

	socket.on('user message', function (msg) {
		var event = translate(recordEvent(ItemEvent.Type.UserMessage, {message: msg, speaker: socket.nickname}));
		projectSocket.emit('user message', event);
	});

	socket.on('new issue', function (description) {
		var newIssue = translate(issueDao.add(description, socket.nickname, project));
		var event = recordEvent(ItemEvent.Type.NewIssue, {issue: newIssue});
		projectSocket.emit('issue created', event);
	});

	socket.on('assign issue', function (id, specifiedAssignee) {
		var assignee = specifiedAssignee;
		if (userDao.isCurrentUser(assignee)) {
			assignee = socket.nickname;
		}
		var updated = translate(issueDao.update(id, { assignee: assignee, updatedDate: new Date() }, project));
		if (updated) {
			var event = recordEvent(ItemEvent.Type.AssignIssue, {assigner: socket.nickname, issue: updated});
			projectSocket.emit('issue assigned', event);
		}
	});

	socket.on('tag issue', function (id, tag) {
		var tagged = (translate(issueDao.addTag(id, tag, project)) && translate(issueDao.update(id, {updatedDate: new Date() }, project)));
		if (tagged) {
			var event = recordEvent(ItemEvent.Type.TagIssue, { updater: socket.nickname, issue: tagged, tag: tag });
			projectSocket.emit('issue tagged', event);
		}
	});

	socket.on('untag issue', function (id) {
		var untagged = (translate(issueDao.stripTags(id, project)) && translate(issueDao.update(id, {updatedDate: new Date() }, project)));
		if (untagged) {
			var event = recordEvent(ItemEvent.Type.UntagIssue, { updater: socket.nickname, issue: untagged });
			projectSocket.emit('issue untagged', event);
		}
	});

	socket.on('close issue', function (id) {
		var updated = translate(issueDao.update(id, { closed: true, closer: socket.nickname, updatedDate: new Date(), closedDate: new Date() }, project));
		if (updated) {
			var event = recordEvent(ItemEvent.Type.CloseIssue, {issue: updated});
			projectSocket.emit('issue closed', event);
		}
	});

	socket.on('update issue', function (id, props) {
		var updated = (translate(issueDao.update(id, props, project)) && translate(issueDao.update(id, {updatedDate: new Date() }, project)));
		if (updated) {
			var event = recordEvent(ItemEvent.Type.UpdateIssue, {updater: socket.nickname, issue: updated});
			projectSocket.emit('issue updated', props, event);
		}
	});

	socket.on('prioritize issue', function (id) {
		var updated = translate(issueDao.update(id, { critical: 'invert', updatedDate: new Date() }, project));
		if (updated) {
			var event = recordEvent(ItemEvent.Type.PrioritizeIssue, {updater: socket.nickname, issue: updated});
			projectSocket.emit('issue prioritized', {critical: updated.critical}, event);
		}
	});

	function recordEvent(type, details) {
		return historyDao.record(type, details, project);
	}

	function removeCurrentUser() {
		if (!socket.nickname) {
			return;
		}
		userDao.remove(socket.nickname, project);
		delete socket.nickname;
		projectSocket.emit('usernames', userDao.load(project));
	}

	socket.on('disconnect', removeCurrentUser);
	socket.on('logout', removeCurrentUser);
}

});
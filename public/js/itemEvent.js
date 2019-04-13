define(['underscore'], function (_) {

	function ItemEvent(type, details) {
		this.type = type.name;
		this.details = details;
		this.timestamp = new Date();
	}

	function ItemEventType(name, message, notificationTitle, notificationBody) {
		this.name = name;
		this.message = message;
		this.notificationTitle = notificationTitle;
		this.notificationBody = notificationBody;
	}

	ItemEventType.prototype.notifies = function () {
		return !!this.notificationTitle && !!this.notificationBody;
	};

	ItemEvent.Type = {
		UserMessage: new ItemEventType("UserMessage", "<%= message %>", "<%= speaker %> says...", "<%= message %>"),
		NewIssue: new ItemEventType("NewIssue", "<%= issue.creator %> created <a class=\"id\" data-id=\"<%= issue.id %>\" href=\"#<%= issue.id %>\">issue #<%= issue.id%></a>.", "New issue", "<%= issue.description %>"),
		AssignIssue: new ItemEventType("AssignIssue", "<%= assigner %> assigned <a class=\"id\" data-id=\"<%= issue.id %>\" href=\"#<%= issue.id %>\">issue #<%= issue.id%></a> to <%= issue.assignee %>."),
		TagIssue: new ItemEventType("TagIssue", "<%= updater %> tagged <a class=\"id\" data-id=\"<%= issue.id %>\" href=\"#<%= issue.id %>\">issue #<%= issue.id%></a> with '<%= tag %>'."),
		UntagIssue: new ItemEventType("UntagIssue", "<%= updater %> removed tags from <a class=\"id\" data-id=\"<%= issue.id %>\" href=\"#<%= issue.id %>\">issue#<%= issue.id%></a>."),
		UpdateIssue: new ItemEventType("UpdateIssue", "<%= updater %> updated <a class=\"id\" data-id=\"<%= issue.id %>\" href=\"#<%= issue.id %>\">issue #<%= issue.id%></a>."),
		CloseIssue: new ItemEventType("CloseIssue", "<%= issue.closer %> closed <a class=\"id\" data-id=\"<%= issue.id %>\" href=\"#<%= issue.id %>\">issue #<%= issue.id%></a>.", "Issue closed", "<%= issue.description %>"),
		PrioritizeIssue: new ItemEventType("PrioritizeIssue", "<%= updater %> marked <a class=\"id\" data-id=\"<%= issue.id %>\" href=\"#<%= issue.id %>\">issue #<%= issue.id%></a> as<% if (!issue.critical) print(' not'); %> critical.")
	};
	
	return ItemEvent;
});
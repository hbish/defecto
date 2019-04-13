define(['jquery'], function ($) {

	var exports = {};

	exports.init = function () {
		$('.alert-closable').click(hideFlashMessages);
		$('.alert-fading').delay(500).fadeIn().delay(6000).fadeOut();
	};

	function hideFlashMessages() {
		$(this).stop(true, true).fadeOut();
	}

	return exports;

});
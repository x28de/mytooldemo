//IIFE keeps our variables private
//and gets executed immediately!

var channel;
function pusherapp() {
//	var doc = document.getElementById('doc');
//	doc.contentEditable = true;
//	doc.focus();

//	var id = getUrlParameter('id');
	var id = 'private-ncnhqji0c';
	if (!id) {
		location.search = location.search
		? '&id=' + getUniqueId() : 'id=' + getUniqueId();
		return;
	}
	var pusher = new Pusher('4adbc41a101586f6da84', {
		cluster: 'eu',
		forceTLS: true,
//		authEndpoint: 'http://condensr.de/whiteboard/php/x28auth.php',  
		authEndpoint: 'http://127.0.0.1/wp/whiteboard/php/x28auth.php',  
		auth: {
			headers: {
				'X-CSRF-Token': "SOME_CSRF_TOKEN"
			}
		}
	});

//	subscribe to the changes via Pusher
	channel = pusher.subscribe(id);
	channel.bind('pusher:subscription_error', function(status) {
		alert("Subscription failed: " + status);
	});
	channel.bind('pusher:subscription_succeeded', function() {
		alert("Successfully subscribed.");
	});
}

// Accessories
// function to get a query param's value
function getUrlParameter(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	var results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

// a unique random key generator
function getUniqueId () {
	return 'private-' + Math.random().toString(36).substr(2, 9);
}

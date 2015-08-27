'use strict';

self.addEventListener('push', function(event) {
  console.log('Received a push message', event);
  var title = 'Anacondapp';
  var icon = '/static/icon-192x192.png';
  var tag = 'anacondapp'+Date.now();
  var closeAfter;

  var notificationPromise = event.currentTarget.registration.pushManager.getSubscription().then(function(sub) {
        var id = sub.endpoint.split('/').pop();
        return fetch('/details?token='+id);
      }).then(function(response){
        return response.json();
      }).then(function(data) {
        closeAfter = data.remove;
        return self.registration.showNotification(title, {
          body: data.text,
          icon: icon,
          tag: tag
        });
      });

  event.waitUntil(notificationPromise);
  notificationPromise.then(function() {
    if(!closeAfter) {
      return Promise.reject();
    }
    console.log('Attempting to close after '+closeAfter+' seconds');
    return new Promise(function(resolve){
      setTimeout(resolve, closeAfter * 1000);
    });
  }).then(function() {
    return event.currentTarget.registration.getNotifications();
  }).then(function(notifications) {
    for(var i=0;i<notifications.length;i++){
      var notification = notifications[i];
      if(notification.tag === tag){
        notification.close();
        break;
      }
    }
  });
});


self.addEventListener('notificationclick', function(event) {
  console.log('On notification click: ', event);
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll()
    .then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        var url = client.url;
        var noProtocol = client.url.split('//');
        if(noProtocol.length) {
          url = noProtocol.split('/').slice(1).join('/');
        }
        console.log(url);
        if (url == '/' && 'focus' in client)
          return client.focus();
      }
      if (clients.openWindow)
        return clients.openWindow('/');
    })
  );
});

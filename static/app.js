angular.module('notificationsApp', ['browserPushNotifications', 'ngSanitize', 'ui.bootstrap']).controller('StatusController', function($scope, BrowserPushNotifications, $http, BrowserPushNotificationsStatus){
$scope.status = 'Working';
BrowserPushNotifications.getSubscriptionId().then(function(subscription) {
    $scope.progress = 10;
    $scope.status = 'Registered!';
    $scope.subscriptionId = subscription;
  }, function(err) {
    if(err === BrowserPushNotificationsStatus.FAILED_TO_SUBSCRIBE) {
      $scope.progress = 5;
      $scope.error = 'Subscription failed - the sender id in the manifest might be wrong';
    } else if(err === BrowserPushNotificationsStatus.WORKER_REGISTRATION_FAIL) {
      $scope.progress = 2;
      $scope.error = 'Worker registration has failed';
    } else if(err === BrowserPushNotificationsStatus.NOTIFICATIONS_NOT_SUPPORTED) {
      $scope.progress = 3;
      $scope.error = 'Notifications are not supported by your browser';
    } else if(err === BrowserPushNotificationsStatus.PUSH_NOT_SUPPORTED) {
      $scope.progress = 4;
      $scope.error = 'Push is not supported - only Chrome v42 and above support this feature';
    } else if(err === BrowserPushNotificationsStatus.USER_BLOCKED_NOTIFICATIONS) {
      $scope.progress = 5;
      $scope.error = 'You blocked notifications. Change it here <br><img src="/static/permissions.jpg">';
    } else {
      $scope.error = 'Error ' + err;
    }
  });
  $scope.removeOptions = [
      {name: '5 seconds', value: 5},
      {name: '1 minute', value: 60},
      {name: "Don't hide", value: null},
  ];
  $scope.notification = {
      text: '',
      removeAfter: null,
      sendAfter: 0
  };
  $scope.send = function() {
    $scope.sending = true;
    $http.post('/send', {
        token: $scope.subscriptionId,
        text: $scope.notification.text,
        removeAfter: $scope.notification.removeAfter,
        sendAfter: Math.min(40, $scope.notification.sendAfter),
    }).then(function() {
      $scope.sending = false;
      $scope.status = 'Sent';
    });
  };
});

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDyVCQQlYQflVh7MhFxjRGIVi2D2auC36g',
  projectId: 'e-commerce-f063b',
  messagingSenderId: '735539881078',
  appId: '1:735539881078:web:fcd5e44cf59160b3996b57',
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/favicon.ico',
  });
});
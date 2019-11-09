//variables
const messaging = firebase.messaging();
const db = firebase.database();
const auth = firebase.auth();
messaging.usePublicVapidKey('BB5YqEwBpqDe7CvCP7MW2CtqGG44K2NT78nNeSYD-dLbyRpVG0keKxfOoAdABMZ1pDclR7WsNbwhjslmmQNO0qc');
//ui preparation
$('#unsubscribe').hide();
$('#subscribe').hide();
$('#signout').hide();
$('#send-notification-form').hide();
//listeneres
$('#subscribe').on('click', subscribe);
$('#unsubscribe').on('click', unsubscribe);
$('#signin').on('click', signin);
$('#signout').on('click', signOut);
$('#send-notification-form').on('submit', sendNotification);
//watchers
messaging.onTokenRefresh(handleTokenRefresh);
auth.onAuthStateChanged(handleAuthStateChange);
//functions
function signOut() {
  auth.signOut();
  
  $('#signin').show();
  $('#signout').hide();
  $('#subscribe').hide();
  $('#unsubscribe').hide();
  $('#send-notification-form').hide();
}
//handle login
function signin() {
  auth.signInWithPopup( new firebase.auth.GoogleAuthProvider() );
}
//refresh tokens
function handleTokenRefresh() {
    return messaging.getToken()
      .then((currentToken) => {
        if (currentToken) {
            console.log(currentToken);

            db.ref('/tokens').push({
              id: auth.currentUser.uid,
              token: currentToken
            });
        } else {
          console.log('No Instance ID token available. Request permission to generate one.');
        }
      }).catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
    });
}
//ui updater
function handleAuthStateChange(user) {
  if(user) {
    console.log(user);
    $('#signout').show();
    $('#signin').hide();
    $('#subscribe').show();
    $('#send-notification-form').show();
    //check if user already registered
    checkSubscription();
  }
}
//handle unsubscribe
function unsubscribe() {
   messaging.getToken()
    .then((token) => messaging.deleteToken(token))
    .then(() => db.ref('/tokens').orderByChild('id').equalTo(auth.currentUser.uid).once('value')
    .then((snapshot) => {
        console.log(snapshot.val())
        const key = Object.keys(snapshot.val())[0];

        return db.ref('/tokens').child(key).remove();
    }))
    
    $('#subscribe').show();
    $('#unsubscribe').hide();
 }
//handle subscribe
function subscribe() {
  if(!window.safari) {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');

        handleTokenRefresh();
      } else {
        console.log('Unable to get permission to notify.');
      }
    });
    $('#subscribe').hide();
    $('#unsubscribe').show();
  }
}
//check before actions
function checkSubscription() {
  db.ref('/tokens').orderByChild('id').equalTo(auth.currentUser.uid).once('value')
    .then((snapshot) => {
        if(snapshot.val()) {
            $('#subscribe').hide();
            $('#unsubscribe').show();
        } else {
            $('#subscribe').show();
            $('#unsubscribe').hide();
        }
    })
}
//send notifications
function sendNotification(e) {
  e.preventDefault();
  const message = $('#notification-message').val();
  db.ref('/notifications').push({
      user: auth.currentUser.displayName,
      message: message,
      userProfileImg: auth.currentUser.photoURL
  })
    .then($('#notification-message').val(''))
}
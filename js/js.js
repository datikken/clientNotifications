const messaging = firebase.messaging();
const db = firebase.database();
const auth = firebase.auth();

messaging.usePublicVapidKey('BB5YqEwBpqDe7CvCP7MW2CtqGG44K2NT78nNeSYD-dLbyRpVG0keKxfOoAdABMZ1pDclR7WsNbwhjslmmQNO0qc');

$('#unsubscribe').hide();
$('#subscribe').hide();
$('#signout').hide();

$('#subscribe').on('click', subscribe);
$('#unsubscribe').on('click', unsubscribe);
$('#signin').on('click', signin);
$('#signout').on('click', signOut);

function signOut() {
  auth.signOut();
  $('#signin').show();
  $('#signout').hide();
  $('#subscribe').hide();
}
//
function signin() {
  auth.signInWithPopup( new firebase.auth.GoogleAuthProvider() );
}
//watchers
messaging.onTokenRefresh(handleTokenRefresh);
auth.onAuthStateChanged(handleAuthStateChange);
//
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
//
function handleAuthStateChange(user) {
  if(user) {
    console.log(user);
    $('#signout').show();
    $('#signin').hide();
    $('#subscribe').show();
  }
}
//
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
//
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
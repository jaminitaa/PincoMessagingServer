const express = require('express');

const { initializeApp: initializeAdminApp, applicationDefault } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, onSnapshot } = require("firebase/firestore");

process.env.GOOGLE_APPLICATION_CREDENTIALS = '/home/runner/PincoMessagingServer/langara-wmdd4885-avengers-firebase-adminsdk-i2orb-6075dc7678.json';

initializeAdminApp({
    credential: applicationDefault(),
    databaseURL: "https://langara-wmdd4885-avengers-default-rtdb.firebaseio.com"
});

const firebaseConfig = {
  apiKey: "AIzaSyBybnwAFnoIbIbxbOQMLEHOaiO796YviRY",
  authDomain: "langara-wmdd4885-avengers.firebaseapp.com",
  databaseURL: "https://langara-wmdd4885-avengers-default-rtdb.firebaseio.com",
  projectId: "langara-wmdd4885-avengers",
  storageBucket: "langara-wmdd4885-avengers.appspot.com",
  messagingSenderId: "1078303270426",
  appId: "1:1078303270426:web:d7a2c3b43fd70e113053a3",
  measurementId: "G-F4KJKNQE5T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const q = query(collection(db, "userStatus"), where("sosEvent", "==", true));
const unsubscribe = onSnapshot(q, (querySnapshot) => {
  const sosUsers = [];
  querySnapshot.forEach((doc) => {
      sosUsers.push(doc.data());
      // console.log(doc.data());
  });
  sendCloudMessageToObservers(sosUsers);
});


function sendCloudMessageToObservers (sosUsers) {
    sosUsers.forEach((user) => {
        if (user.observerTokens && user.observerTokens.length) {
            const message = {
              // TODO: send userID in data object
                data: {text: "Your friend is in danger! Check this out"},
                tokens: user.observerTokens,
            };
            getMessaging().sendMulticast(message)
              .then((response) => {
                console.log(response.successCount + ' messages were sent successfully');
            });
        }
    })
}
// Create a list containing up to 500 registration tokens.
// These registration tokens come from the client FCM SDKs.
// const registrationTokens = [
// ];




// replit requires something to be served to '/' to keep alive
const expressApp = express();

expressApp.get('/', (req, res) => {
  res.send('Hello Express app!')
});

expressApp.listen(3000, () => {
  console.log('server started');
});

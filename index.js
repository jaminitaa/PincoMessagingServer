const express = require('express');

const { initializeApp: initializeAdminApp, applicationDefault } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, onSnapshot, getDocs } = require("firebase/firestore");

process.env.GOOGLE_APPLICATION_CREDENTIALS = '/home/runner/PincoMessagingServer-1/secret-key.json';

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

// get a array of checkInOnTime == false and active == true
const q = query(collection(db, "checkInSession"), where("checkInOnTime", "==", false), where("active", "==", true));

const unsubscribe = onSnapshot(q, async(querySnapshot) => {
  const notCheckedInSessions = [];
  querySnapshot.forEach((doc) => {
      notCheckedInSessions.push(doc.data());
  });
  console.log(notCheckedInSessions.length + " users not checked in");
  const notCheckedInUsers = await getNotCheckedInUsers(notCheckedInSessions);
  // put into sendCloudMessageToObservers function as sosUsers parameter
  console.log(notCheckedInUsers);
  sendCloudMessageToObservers(notCheckedInUsers, "Your friend Brenda has missed the check-in alarm! We suggest you check with Brenda as soon as possible. Click to check this out");
  
});

const q2 = query(collection(db, "userStatus"), where("sosEvent", "==", true));
const unsubscribe2 = onSnapshot(q2, (querySnapshot) => {
  const sosUsers = [];
  querySnapshot.forEach((doc) => {
      sosUsers.push(doc.data());
    // { email:..., lat:... long:... observertokens: ... }
  });
  sendCloudMessageToObservers(sosUsers, "Your friend Brenda need your help! Click to check this out");
});


async function getNotCheckedInUsers (notCheckedInSessions) {
  // foreach document, find in userStatus where checkinsession.userid == userstatus.userid
  const notCheckedInUsers = [];
  for (const session of notCheckedInSessions) {
    const userStatusQ = query(collection(db, "userStatus"), where("userID", "==", session.userID));
    const userStatusQSnapshot = await getDocs(userStatusQ);
    userStatusQSnapshot.forEach((userStatusDoc) => {
      notCheckedInUsers.push(userStatusDoc.data());
    });
  }
  // return a array of userStatus documents/objects
  return notCheckedInUsers;
}

function sendCloudMessageToObservers (sosUsers, text) {
    sosUsers.forEach((user) => {
        if (user.observerTokens && user.observerTokens.length) {
            const message = {
              // TODO: send userID in data object
                data: {text},
                tokens: user.observerTokens,
            };
            getMessaging().sendMulticast(message)
              .then((response) => {
                console.log(response.successCount + ' messages were sent successfully' + ' text: ' + text);
            });
        }
    })
}


// Create a list containing up to 500 registration tokens.
// These registration tokens come from the client FCM SDKs.
// const registrationTokens = [
// ];





const expressApp = express();

expressApp.get('/', (req, res) => {
  res.send('Hello Express app!')
});

expressApp.listen(3000, () => {
  console.log('server started');
});

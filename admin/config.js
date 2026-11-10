// Admin page config. Nothing here is secret: a Firebase web config only
// says which project to sign in to. Who can save is decided by the
// admin_plans Cloud Function (admins/{uid} in Firestore), not by this file.
//
// Fill in from Firebase Console > iperspective-app > Project settings >
// General > Your apps > the Web app (add one if there isn't a Web app yet).
window.ADMIN_CONFIG = {
  firebase: {
    apiKey: "AIzaSyDOGQ4bXqMxmLucsZUG7-XY6JhD7sF51Po",
    authDomain: "iperspective-app.firebaseapp.com",
    projectId: "iperspective-app",
    appId: "1:144447874880:web:96116b6bc17ce4b7e0bca5",
  },
  // gcloud functions describe admin_plans --region=us-central1 --gen2
  //   --format='value(serviceConfig.uri)'   if this one doesn't answer.
  plansUrl: "https://us-central1-iperspective-app.cloudfunctions.net/admin_plans",
};

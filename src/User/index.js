import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";
import { getFingerprintId, getIPLocation } from "../utils";

// SF0 -27-03-23
console.log("// SF0 -27-03-23");
firebase.initializeApp({
  apiKey: "AIzaSyA8yAzubelXy_E2e5LV57Bs4Dx9C4lSwRQ",
  authDomain: "fileotp-4e608.firebaseapp.com",
  databaseURL: "https://fileotp-4e608-default-rtdb.firebaseio.com",
  projectId: "fileotp-4e608",
  storageBucket: "fileotp-4e608.appspot.com",
  messagingSenderId: "742307829888",
  appId: "1:742307829888:web:52a26ec15b30224678ee65"
});

export const User = (function () {
  return {
    auth: false,
    uid: Math.floor(100000 + Math.random() * 900000),
    callbacks: [],
    onLogin: function (callback) {
      if (typeof callback === "function") {
        this.callbacks.push(callback);
      }
    },
    info: {
      href: window.location.href,
      fpid: getFingerprintId(),
      ts: new Date().getTime(),
      pwaStatus: window.localStorage.getItem("appInstall:status") || "false",
    },
    login: function () {
      firebase.auth().signInAnonymously().catch(console.error);
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.info = {
            loginId: user.uid,
            loginMeta: user.metadata,
            ...this.info,
          };
          this.auth = true;
          this.callbacks.forEach((callback) => callback(this));
          getIPLocation()
            .then((data) => {
              this.info["ip-location"] = data;
              this.updateAnalytic();
            })
            .catch(this.updateAnalytic);
        } else {
          this.auth = false;
        }
      });
    },
    updateAnalytic: function () {
      firebase
        .database()
        .ref("analytic/" + this.info.fpid + "/" + this.info.ts)
        .set(this.info);
    },
  };
})();

// @type debug: Global variable export
if (window["SFO"]) {
  window["SFO"]["user"] = User;
} else {
  window["SFO"] = { user: User };
}

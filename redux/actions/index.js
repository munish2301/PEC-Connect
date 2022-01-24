import * as Notifications from "expo-notifications";
import { Constants } from "react-native-unimodules";
import {
  CLEAR_DATA,
  USERS_DATA_STATE_CHANGE,
  USERS_LIKES_STATE_CHANGE,
  USERS_POSTS_STATE_CHANGE,
  USER_CHATS_STATE_CHANGE,
  USER_FOLLOWING_STATE_CHANGE,
  USER_POSTS_STATE_CHANGE,
  USER_STATE_CHANGE,
} from "../constants/index";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../firebase_config/firebaseConfig";
import {
  getFirestore,
  collection,
  query,
  limit,
  doc,
  where,
  getDocs,
  getDoc,
  deleteDoc,
  orderBy,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

let unsubscribe = [];

export function clearData() {
  return (dispatch) => {
    for (let i = unsubscribe; i < unsubscribe.length; i++) {
      unsubscribe[i]();
    }
    dispatch({ type: CLEAR_DATA });
  };
}
export function reload() {
  return (dispatch) => {
    dispatch(clearData());
    dispatch(fetchUser());
    dispatch(setNotificationService());
    dispatch(fetchUserPosts());
    dispatch(fetchUserFollowing());
    dispatch(fetchUserChats());
  };
}

export const setNotificationService = () => async (dispatch) => {
  let token;
  if (Constants.isDevice) {
    const existingStatus = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus.status !== "granted") {
      const status = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus.status !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = await Notifications.getExpoPushTokenAsync();
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (token != undefined) {
    const docRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(docRef, {
      notificationToken: token.data,
    });
  }
};

export const sendNotification = (to, title, body, data) => (dispatch) => {
  if (to == null) {
    return;
  }

  let response = fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      sound: "default",
      title,
      body,
      data,
    }),
  });
};

export function fetchUser() {
  return (dispatch) => {
    const docRef = doc(db, "users", auth.currentUser.uid);
    let listener = onSnapshot(docRef, (snapshot, error) => {
      if (snapshot.exists) {
        dispatch({
          type: USER_STATE_CHANGE,
          currentUser: { uid: auth.currentUser.uid, ...snapshot.data() },
        });
      }
    });
    unsubscribe.push(listener);
  };
}

export function fetchUserChats() {
  return (dispatch) => {
    const q = query(
      collection(db, "chats"),
      where("users", "array-contains", auth.currentUser.uid),
      orderBy("lastMessageTimestamp", "desc")
    );
    let listener = onSnapshot(q, (snapshot) => {
      let chats = snapshot.docs.map((doc) => {
        const data = doc.data();
        const id = doc.id;
        return { id, ...data };
      });

      for (let i = 0; i < chats.length; i++) {
        let otherUserId;
        if (chats[i].users[0] == auth.currentUser.uid) {
          otherUserId = chats[i].users[1];
        } else {
          otherUserId = chats[i].users[0];
        }
        dispatch(fetchUsersData(otherUserId, false));
      }

      dispatch({ type: USER_CHATS_STATE_CHANGE, chats });
    });
    unsubscribe.push(listener);
  };
}
export function fetchUserPosts() {
  return async (dispatch) => {
    const docRef = doc(db, "posts", auth.currentUser.uid);
    const colRef = collection(docRef, "userPosts");
    const q = query(colRef, orderBy("creation", "desc"));
    const snapshot = await getDocs(q);
    let posts = snapshot.docs.map((doc) => {
      const data = doc.data();
      const id = doc.id;
      return { id, ...data };
    });
    dispatch({ type: USER_POSTS_STATE_CHANGE, posts });
  };
}

export function fetchUserFollowing() {
  return (dispatch) => {
    const docRef = doc(db, "following", auth.currentUser.uid);
    const colRef = collection(docRef, "userFollowing");
    let listener = onSnapshot(colRef, (snapshot) => {
      let following = snapshot.docs.map((doc) => {
        const id = doc.id;
        return id;
      });
      dispatch({ type: USER_FOLLOWING_STATE_CHANGE, following });
      for (let i = 0; i < following.length; i++) {
        dispatch(fetchUsersData(following[i], true));
      }
    });
    unsubscribe.push(listener);
  };
}

export function fetchUsersData(uid, getPosts) {
  return async (dispatch, getState) => {
    const found = getState().usersState.users.some((el) => el.uid === uid);
    if (!found) {
      const docRef = doc(db, "users", uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists) {
        let user = snapshot.data();
        user.uid = snapshot.id;

        dispatch({ type: USERS_DATA_STATE_CHANGE, user });
      }
      if (getPosts) {
        dispatch(fetchUsersFollowingPosts(uid));
      }
    }
  };
}

export function fetchUsersFollowingPosts(uid) {
  return async (dispatch, getState) => {
    const postsCollectionRef = collection(db, "posts");
    const userRef = doc(postsCollectionRef, uid);
    const userPostsCollectionRef = collection(userRef, "userPosts");
    const q = query(userPostsCollectionRef, orderBy("creation", "asc"));
    const snapshot = await getDocs(q);
    const uid = snapshot.docs[0].ref.path.split("/")[1];
    const user = getState().usersState.users.find((el) => el.uid === uid);
    let posts = snapshot.docs.map((doc) => {
      const data = doc.data();
      const id = doc.id;
      return { id, ...data, user };
    });
    for (let i = 0; i < posts.length; i++) {
      dispatch(fetchUsersFollowingLikes(uid, posts[i].id));
    }
    dispatch({ type: USERS_POSTS_STATE_CHANGE, posts, uid });
  };
}

export function fetchUsersFollowingLikes(uid, postId) {
  return (dispatch, getState) => {
    const postsCollectionRef = collection(db, "posts");
    const userRef = doc(postsCollectionRef, uid);
    const userPostsCollectionRef = collection(userRef, "userPosts");
    const postDocRef = doc(userPostsCollectionRef, postId);
    const likesCollectionRef = collection(postDocRef, "likes");
    const authUserDocRef = doc(likesCollectionRef, auth.currentUser.uid);
    let listener = onSnapshot(authUserDocRef, (snapshot) => {
      const postId = snapshot.id;
      let currentUserLike = false;
      if (snapshot.exists) {
        currentUserLike = true;
      }
      dispatch({ type: USERS_LIKES_STATE_CHANGE, postId, currentUserLike });
    });
    unsubscribe.push(listener);
  };
}

export function queryUsersByUsername(username) {
  return (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      if (username.length == 0) {
        resolve([]);
      }
      const usersCollectionRef = collection(db, "users");
      const q = query(
        usersCollectionRef,
        where("username", ">=", username),
        limit(10)
      );
      try {
        const snapshot = await getDocs(q);
        let users = snapshot.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;
          return { id, ...data };
        });
        resolve(users);
      } catch (err) {
        reject();
      }
    });
  };
}

export function deletePost(item) {
  return (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      const postsCollectionRef = collection(db, "posts");
      const userRef = doc(postsCollectionRef, auth.currentUser.uid);
      const userPostsCollectionRef = collection(userRef, "userPosts");
      const postDocRef = doc(userPostsCollectionRef, item.id);
      try {
        await deleteDoc(postDocRef);
        resolve();
      } catch (err) {
        reject();
      }
    });
  };
}

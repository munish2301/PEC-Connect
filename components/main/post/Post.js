import { Entypo, Feather, FontAwesome5 } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Video } from "expo-av";
import VideoPlayer from "expo-video-player";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import BottomSheet from "react-native-bottomsheet-reanimated";
import { Divider, Snackbar } from "react-native-paper";
import ParsedText from "react-native-parsed-text";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  deletePost,
  fetchUserPosts,
  sendNotification,
} from "../../../redux/actions/index";
import { container, text, utils } from "../../styles";
import { timeDifference } from "../../utils";
import CachedImage from "../random/CachedImage";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../../firebase_config/firebaseConfig";
import {
  getFirestore,
  collection,
  query,
  limit,
  doc,
  where,
  setDoc,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  increment,
  orderBy,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

const WINDOW_WIDTH = Dimensions.get("window").width;

function Post(props) {
  const [item, setItem] = useState(props.route.params.item);
  const [user, setUser] = useState(null);
  const [currentUserLike, setCurrentUserLike] = useState(false);
  const [unmutted, setUnmutted] = useState(true);
  const [videoref, setvideoref] = useState(null);
  const [sheetRef, setSheetRef] = useState(useRef(null));
  const [modalShow, setModalShow] = useState({ visible: false, item: null });
  const [isValid, setIsValid] = useState(true);
  const [exists, setExists] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const navigation = useNavigation()
  const isFocused = useIsFocused();
  useEffect(async () => {
    // if (props.route.params.notification != undefined) {
      console.log("current uid", props.route.params.item.uid)
      const usersCollectionRef = collection(db, "users");
      const userDocRef = doc(usersCollectionRef, props.route.params.item.uid);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists) {
        let user = snapshot.data();
        // console.log("Snapshott",snapshot)
        user.uid = snapshot.id;
        console.log("user uid in post", user)
        setUser(user);
      }
      const postsCollectionRef = collection(db, "posts");
      const userRef = doc(postsCollectionRef, props.route.params.item.uid);
      const userPostsCollectionRef = collection(userRef, "userPosts");
      const postDocRef = doc(
        userPostsCollectionRef,
        props.route.params.item.id
      );
      const querySnapshot = await getDoc(postDocRef);
      if (querySnapshot.exists) {
        let post = querySnapshot.data();
        post.id = querySnapshot.id;
        setItem(post);
        setLoaded(true);
        setExists(true);
      }
      // const likesCollectionRef = collection(postDocRef, "likes");
      // const authUserDocRef = doc(likesCollectionRef, auth.currentUser.uid);
      // onSnapshot(authUserDocRef, (snapshot) => {
      //   let currentUserLike = false;
      //   if (snapshot.exists) {
      //     currentUserLike = true;
      //   }
      //   setCurrentUserLike(currentUserLike);
      // });
    // } else {
    //   console.log("in else")
    //   const postsCollectionRef = collection(db, "posts");
    //   const userRef = doc(postsCollectionRef, props.route.params.item.uid);
    //   const userPostsCollectionRef = collection(userRef, "userPosts");
    //   const postDocRef = doc(
    //     userPostsCollectionRef,
    //     props.route.params.item.id
    //   );
    //   const likesCollectionRef = collection(postDocRef, "likes");
    //   const authUserDocRef = doc(likesCollectionRef, auth.currentUser.uid);
    //   onSnapshot(authUserDocRef, (snapshot) => {
    //     let currentUserLike = false;
    //     if (snapshot.exists) {
    //       currentUserLike = true;
    //     }
    //     setCurrentUserLike(currentUserLike);
    //   });
    //   setItem(props.route.params.item);
    //   setUser(props.route.params.user);
    //   setLoaded(true);
    //   setExists(true);
    // }
  }, [props.route.params.notification, props.route.params.item]);

  useEffect(() => {
    if (videoref !== null) {
      videoref.setIsMutedAsync(props.route.params.unmutted);
    }
    setUnmutted(props.route.params.unmutted);
  }, [props.route.params.unmutted]);

  useEffect(() => {
    if (videoref !== null) {
      if (isFocused) {
        videoref.playAsync();
      } else {
        videoref.stopAsync();
      }
    }
  }, [props.route.params.index, props.route.params.inViewPort]);

  const onUsernamePress = (username, matchIndex) => {
    navigation.navigate("ProfileOther", { username, uid: undefined });
  };

  // const onLikePress = async (userId, postId, item) => {
  //   item.likesCount += 1;
  //   setCurrentUserLike(true);
  //   const postsCollectionRef = collection(db, "posts");
  //   const userRef = doc(postsCollectionRef, userId);
  //   const userPostsCollectionRef = collection(userRef, "userPosts");
  //   const postDocRef = doc(userPostsCollectionRef, postId);
  //   const likesCollectionRef = collection(postDocRef, "likes");
  //   const authUserDocRef = doc(likesCollectionRef, auth.currentUser.uid);
  //   await setDoc(authUserDocRef, {});
  //   await updateDoc(postDocRef, {
  //     likesCount: increment(1),
  //   });
  //   props.sendNotification(
  //     user.notificationToken,
  //     "New Like",
  //     `${props.currentUser.name} liked your post`,
  //     { type: 0, postId, user: auth.currentUser.uid }
  //   );
  // };
  // const onDislikePress = async (userId, postId, item) => {
  //   item.likesCount -= 1;
  //   setCurrentUserLike(false);
  //   const postsCollectionRef = collection(db, "posts");
  //   const userRef = doc(postsCollectionRef, userId);
  //   const userPostsCollectionRef = collection(userRef, "userPosts");
  //   const postDocRef = doc(userPostsCollectionRef, postId);
  //   const likesCollectionRef = collection(postDocRef, "likes");
  //   const authUserDocRef = doc(likesCollectionRef, auth.currentUser.uid);
  //   await deleteDoc(authUserDocRef);
  //   await updateDoc(postDocRef, {
  //     likesCount: increment(-1),
  //   });
  // };
  if (!exists && loaded) {
    return (
      <View
        style={{ height: "100%", justifyContent: "center", margin: "auto" }}
      >
        <FontAwesome5
          style={{ alignSelf: "center", marginBottom: 20 }}
          name="dizzy"
          size={40}
          color="black"
        />
        <Text style={[text.notAvailable]}>Post does not exist</Text>
      </View>
    );
  }
  if (!loaded) {
    return <View></View>;
  }
  if (user == undefined) {
    return <View></View>;
  }
  if (item == null) {
    return <View />;
  }

  const _handleVideoRef = (component) => {
    setvideoref(component);

    if (component !== null) {
      component.setIsMutedAsync(props.route.params.unmutted);
    }
  };

  if (videoref !== null) {
    videoref.setIsMutedAsync(unmutted);
    if (
      isFocused &&
      props.route.params.index == props.route.params.inViewPort
    ) {
      videoref.playAsync();
    } else {
      videoref.stopAsync();
    }
  }

  if (sheetRef.current !== null && !props.route.params.feed) {
    if (modalShow.visible) {
      sheetRef.snapTo(0);
    } else {
      sheetRef.snapTo(1);
    }
  }

  return (
    <View style={[container.container, utils.backgroundWhite]}>
      <View>
        <View
          style={[container.horizontal, { alignItems: "center", padding: 10 }]}
        >
          <TouchableOpacity
            style={[container.horizontal, { alignItems: "center" }]}
            onPress={() =>
              navigation.navigate("ProfileOther", {
                uid: user.uid,
                username: undefined,
              })
            }
          >
            {user.image == "default" ? (
              <FontAwesome5
                style={[utils.profileImageSmall]}
                name="user-circle"
                size={35}
                color="black"
              />
            ) : (
              <Image
                key ={user.image}
                style={[utils.profileImageSmall]}
                source={{
                  uri: user.image,
                }}
              />
            )}
            <View style={{ alignSelf: "center" }}>
              <Text style={[text.bold, text.medium, { marginBottom: 0 }]}>
                {user.name}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[{ marginLeft: "auto" }]}
            onPress={() => {
              if (props.route.params.feed) {
                props.route.params.setModalShow({ visible: true, item });
              } else {
                setModalShow({ visible: true, item });
              }
            }}
          >
            <Feather name="more-vertical" size={20} color="black" />
          </TouchableOpacity>
        </View>
        {item.type == 0 ? (
          <View>
            {props.route.params.index == props.route.params.inViewPort &&
            isFocused ? (
              <View>
                <VideoPlayer
                  videoProps={{
                    isLooping: true,
                    shouldPlay: true,
                    resizeMode: Video.RESIZE_MODE_COVER,
                    source: {
                      uri: item.downloadURL,
                    },
                    videoRef: _handleVideoRef,
                  }}
                  inFullscreen={false}
                  showControlsOnLoad={true}
                  showFullscreenButton={false}
                  height={WINDOW_WIDTH}
                  width={WINDOW_WIDTH}
                  shouldPlay={true}
                  isLooping={true}
                  style={{
                    aspectRatio: 1 / 1,
                    height: WINDOW_WIDTH,
                    width: WINDOW_WIDTH,
                    backgroundColor: "black",
                  }}
                />

                <TouchableOpacity
                  style={{
                    position: "absolute",
                    borderRadius: 500,
                    backgroundColor: "black",
                    width: 40,
                    height: 40,
                    alignItems: "center",
                    justifyContent: "center",
                    margin: 10,
                    right: 0,
                  }}
                  activeOpacity={1}
                  onPress={() => {
                    if (videoref == null) {
                      return;
                    }
                    if (unmutted) {
                      if (props.route.params.setUnmuttedMain == undefined) {
                        setUnmutted(false);
                      } else {
                        props.route.params.setUnmuttedMain(false);
                      }
                    } else {
                      if (props.route.params.setUnmuttedMain == undefined) {
                        setUnmutted(true);
                      } else {
                        props.route.params.setUnmuttedMain(true);
                      }
                    }
                  }}
                >
                  {!unmutted ? (
                    <Feather name="volume-2" size={20} color="white" />
                  ) : (
                    <Feather name="volume-x" size={20} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ marginTop: 4 }}>
                <Image
                  // cacheKey={item.id}
                  key ={item.downloadURLStill}
                  style={[container.image]}
                  source={{ uri: item.downloadURLStill }}
                />
              </View>
            )}
          </View>
        ) : (
          <Image
            // cacheKey={item.id}
            key ={item.downloadURL}
            style={container.image}
            source={{ uri: item.downloadURL }}
          />
        )}

        <View style={[utils.padding10, container.horizontal]}>
          <Feather
            // style={utils.margin15Left}
            name="message-square"
            size={30}
            color="black"
            onPress={() =>
                navigation.navigate("Comment", {
                postId: item.id,
                uid: user.uid,
                user,
              })
            }
          />
          <Feather
            style={utils.margin15Left}
            name="share"
            size={26}
            color="black"
            onPress={() =>
                navigation.navigate("ChatList", {
                postId: item.id,
                post: { ...item, user: user },
                share: true,
              })
            }
          />
        </View>
        
        <View style={[container.container, utils.padding10Sides]}>
          <Text style={[utils.margin15Right, utils.margin5Bottom]}>
            <Text
              style={[text.bold]}
              onPress={() =>
                  navigation.navigate("ProfileOther", {
                  uid: user.uid,
                  username: undefined,
                })
              }
            >
              {user.name}
            </Text>
            <Text> </Text>
            <ParsedText
              parse={[
                {
                  pattern: /@(\w+)/,
                  style: { color: "green", fontWeight: "bold" },
                  onPress: onUsernamePress,
                },
              ]}
            >
              {item.caption}
            </ParsedText>
          </Text>
        </View>
      </View>

      

      {/* <BottomSheet
        bottomSheerColor="#FFFFFF"
        ref={sheetRef}
        initialPosition={0} //200, 300
        snapPoints={[300, 0]}
        isBackDrop={true}
        isBackDropDismissByPress={true}
        isRoundBorderWithTipHeader={true}
        backDropColor="black"
        isModal
        containerStyle={{ backgroundColor: "white" }}
        tipStyle={{ backgroundColor: "white" }}
        headerStyle={{ backgroundColor: "white", flex: 1 }}
        bodyStyle={{ backgroundColor: "white", flex: 1, borderRadius: 20 }}
        body={
          <View>
            {modalShow.item != null ? (
              <View>
                <TouchableOpacity
                  style={{ padding: 20 }}
                  onPress={() => {
                    props.navigation.navigate("ProfileOther", {
                      uid: modalShow.item.user.uid,
                      username: undefined,
                    });
                    setModalShow({ visible: false, item: null });
                  }}
                >
                  <Text>Profile</Text>
                </TouchableOpacity>
                <Divider />
                {props.route.params.user.uid == auth.currentUser.uid ? (
                  <TouchableOpacity
                    style={{ padding: 20 }}
                    onPress={() => {
                      props.deletePost(modalShow.item).then(() => {
                        props.fetchUserPosts();
                        props.navigation.popToTop();
                      });
                      setModalShow({ visible: false, item: null });
                    }}
                  >
                    <Text>Delete</Text>
                  </TouchableOpacity>
                ) : null}

                <Divider />
                <TouchableOpacity
                  style={{ padding: 20 }}
                  onPress={() => setModalShow({ visible: false, item: null })}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        }
      />
      <Snackbar
        visible={isValid.boolSnack}
        duration={2000}
        onDismiss={() => {
          setIsValid({ boolSnack: false });
        }}
      >
        {isValid.message}
      </Snackbar> */}
    </View>
  );
}

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  following: store.userState.following,
  feed: store.usersState.feed,
  usersFollowingLoaded: store.usersState.usersFollowingLoaded,
});

const mapDispatchProps = (dispatch) =>
  bindActionCreators(
    { sendNotification, fetchUserPosts, deletePost },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchProps)(Post);

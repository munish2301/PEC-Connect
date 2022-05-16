import React, { useEffect, useRef, useLayoutEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import BottomSheet from "react-native-bottomsheet-reanimated";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Divider, Snackbar } from "react-native-paper";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  deletePost,
  fetchUsersFollowingPosts,
  reload,
  sendNotification,
} from "../../../redux/actions/index";
import { container, utils } from "../../styles";
import Post from "./Post";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../../firebase_config/firebaseConfig";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { timeDifference } from "../../utils";

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

function Feed(props) {
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [unmutted, setUnmutted] = useState(null);
  const [inViewPort, setInViewPort] = useState(0);
  const [sheetRef, setSheetRef] = useState(useRef(null));
  const [modalShow, setModalShow] = useState({ visible: false, item: null });
  const [isValid, setIsValid] = useState(true);
  const wait = (timeout) => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  };
  console.log("props", props);

  const Constants = {
    IEEE: "niDt5xp46FNd0TYmb2X0UbXYHdf2",
    Robotics: "B0LfrLTOTITpmjDrhGXPz3dmOgj2",
    Sports: "Z3vuEWJvlpXtWJ6wpeHcmvyQc2v1",
    NSS: "cta1xuMOrtOxRVJJ0YANZCxlbNI2",
    NCC: "k1mfLUgmxmbfMP0z3rLPbycCSvi2",
  };
  useEffect(async () => {
    switch (props.dropdownValue) {
      case "NSS": {
        let userPosts = [];
        const postsCollectionRef = collection(db, "posts");
        const docRef = doc(postsCollectionRef, "cta1xuMOrtOxRVJJ0YANZCxlbNI2");
        const userPostsCollectionRef = collection(docRef, "userPosts");
        const q = query(userPostsCollectionRef, orderBy("creation", "asc"));
        onSnapshot(q, (snapshot) => {
          userPosts = snapshot.docs.map((doc) => {
            const data = doc.data();
            const id = doc.id;
            return { id, ...data };
          });
          setPosts(userPosts);
        });
        break;
      }
      case "NCC": {
        let userPosts = [];
        const postsCollectionRef = collection(db, "posts");
        const docRef = doc(postsCollectionRef, "k1mfLUgmxmbfMP0z3rLPbycCSvi2");
        const userPostsCollectionRef = collection(docRef, "userPosts");
        const q = query(userPostsCollectionRef, orderBy("creation", "asc"));
        onSnapshot(q, (snapshot) => {
          userPosts = snapshot.docs.map((doc) => {
            const data = doc.data();
            const id = doc.id;
            return { id, ...data };
          });
          setPosts(userPosts);
        });
        break;
      }
      case "Tech": {
        setPosts([]);
        const TechUIDs = [
          "B0LfrLTOTITpmjDrhGXPz3dmOgj2",
          "niDt5xp46FNd0TYmb2X0UbXYHdf2",
        ];
        for (let i = 0; i < TechUIDs.length; i++) {
          let userPosts = [];
          const postsCollectionRef = collection(db, "posts");
          const docRef = doc(postsCollectionRef, TechUIDs[i].toString());
          const userPostsCollectionRef = collection(docRef, "userPosts");
          const q = query(userPostsCollectionRef, orderBy("creation", "asc"));
          onSnapshot(q, (snapshot) => {
            userPosts = snapshot.docs.map((doc) => {
              const data = doc.data();
              const id = doc.id;
              return { id, ...data };
            });
            setPosts((posts) => [...posts, ...userPosts]);
          });
        }

        break;
      }
      case "Cultural": {
      }
      case "Sports": {
        let userPosts = [];
        const postsCollectionRef = collection(db, "posts");
        const docRef = doc(postsCollectionRef, "Z3vuEWJvlpXtWJ6wpeHcmvyQc2v1");
        console.log("docred", docRef);
        const userPostsCollectionRef = collection(docRef, "userPosts");
        const q = query(userPostsCollectionRef, orderBy("creation", "asc"));
        onSnapshot(q, (snapshot) => {
          userPosts = snapshot.docs.map((doc) => {
            const data = doc.data();
            const id = doc.id;
            return { id, ...data };
          });
          setPosts(userPosts);
        });
        break;
      }
      case "PEC Connect":
      default: {
        setPosts([]);
        let interests = props.currentUser.interests;
        for (let i = 0; i < interests.length; i++) {
          let userPosts = [];
          const postsCollectionRef = collection(db, "posts");
          const docRef = doc(
            postsCollectionRef,
            Constants[interests[i].toString()]
          );
          const userPostsCollectionRef = collection(docRef, "userPosts");
          const q = query(userPostsCollectionRef, orderBy("creation", "asc"));
          onSnapshot(q, (snapshot) => {
            userPosts = snapshot.docs.map((doc) => {
              const data = doc.data();
              const id = doc.id;
              return { id, ...data };
            });
            setPosts((posts) => [...posts, ...userPosts]);
          });
        }

        // const postsCollectionRef = collection(db, "posts");
        // const docRef =doc(postsCollectionRef,props.currentUser.uid);
        // const userPostsCollectionRef = collection(docRef, "userPosts");
        // const q =  query(userPostsCollectionRef, orderBy("creation", "asc"));
        //   onSnapshot(q, (snapshot) => {
        //     userPosts =  snapshot.docs.map((doc) => {
        //     const data = doc.data();
        //     const id = doc.id;
        //     return { id, ...data };
        //   });
        //   setPosts(userPosts)
        // });
      }
    }
    setRefreshing(true);
    wait(1000).then(() => setRefreshing(false));
  }, [props.dropdownValue]);

  posts.sort(function (x, y) {
    return y.creation.toDate() - x.creation.toDate();
  });

  const onViewableItemsChanged = useRef(({ viewableItems, changed }) => {
    if (changed && changed.length > 0) {
      setInViewPort(changed[0].index);
    }
  });
  if (posts.length == 0) {
    return <View />;
  }

  if (sheetRef.current !== null) {
    if (modalShow.visible) {
      sheetRef.snapTo(0);
    } else {
      sheetRef.snapTo(1);
    }
  }

  const renderItem = ({ item, index }) => {
    return (
      <View key={index}>
        <Post
          route={{
            params: {
              item,
              index,
              unmutted,
              inViewPort,
              setUnmuttedMain: setUnmutted,
              setModalShow,
              feed: true,
            },
          }}
          navigation={props.navigation}
        />
      </View>
    );
  };

  return (
    <View style={[container.container, utils.backgroundWhite]}>
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              props.reload();
            }}
          />
        }
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{
          waitForInteraction: false,
          viewAreaCoveragePercentThreshold: 70,
        }}
        numColumns={1}
        horizontal={false}
        data={posts}
        keyExtractor={(index) => index.toString()}
        renderItem={renderItem}
      />

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
                {modalShow.item.creator == auth.currentUser.uid ? (
                  <TouchableOpacity
                    style={{ padding: 20 }}
                    onPress={() => {
                      props.deletePost(modalShow.item).then(() => {
                        setRefreshing(true);
                        props.reload();
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
      /> */}
      {/* <Snackbar
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
    { reload, sendNotification, fetchUsersFollowingPosts, deletePost },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchProps)(Feed);

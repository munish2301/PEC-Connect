import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View ,StyleSheet,} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { Divider } from "react-native-paper";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUsersData } from "../../../redux/actions/index";
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
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

function Chat(props) {
  // console.log('list props', props)
  // console.log('length', props.chats.length)
  // console.log('chats', props.chats)
  const [chats, setChats] = useState([]);
  const [reload, setReload] = useState(false);
  const [input, setInput] = useState("");
  const [caption, setCaption] = useState("");
  const [textInput, setTextInput] = useState(null);
  const time="4:00 PM"

  useEffect(() => {
    for (let i = 0; i < props.chats.length; i++) {
      if (props.chats[i].hasOwnProperty("otherUser")) {
        continue;
      }
      let otherUserId;
      if (props.chats[i].users[0] == auth.currentUser.uid) {
        otherUserId = props.chats[i].users[1];
      } else {
        otherUserId = props.chats[i].users[0];
      }

      const user = props.users.find((x) => x.uid === otherUserId);
      if (user == undefined) {
        props.fetchUsersData(otherUserId, false);
      } else {
        props.chats[i].otherUser = user;
      }
    }
    setChats(props.chats);
  }, [props.chats, props.users]);

  const sendPost = async (item) => {
    if (item.sent != undefined) {
      return;
    }
    const textToSend = input;

    setInput("");

    textInput.clear();

    let post = props.route.params.post;
    delete post.doc;
    const chatsCollectionRef = collection(db, "chats");
    const docRef = doc(chatsCollectionRef, item.id);
    const messagesCollectionRef = collection(docRef, "messages");
    await addDoc(messagesCollectionRef, {
      creator: auth.currentUser.uid,
      text: textToSend,
      post: post,
      creation: serverTimestamp(),
    });
    await updateDoc(docRef, {
      lastMessage: "post sent",
      lastMessageTimestamp: serverTimestamp(),
    });
    await updateDoc(docRef, {
      lastMessage: textToSend,
      lastMessageTimestamp: serverTimestamp(),
      [item.users[0]]: false,
      [item.users[1]]: false,
    });
    props.navigation.popToTop();
  };

  let share = false;
  let item = null;

  if (props.route.params !== undefined) {
    share = props.route.params.share;
    item = props.route.params.post;
  }

  if (chats.length === 0) {
    return (
      <View
        style={{ height: "100%", justifyContent: "center", margin: "auto" }}
      >
        <FontAwesome5
          style={{ alignSelf: "center", marginBottom: 20 }}
          name="comments"
          size={40}
          color="black"
        />
        <Text style={[text.notAvailable]}>No chats notAvailable</Text>
      </View>
    );
  }
  return (
    <View
      style={[
        container.container,
        container.alignItemsCenter,
        utils.backgroundWhite,
      ]}
    >
      {item != null ? (
        <View style={{ flexDirection: "row", padding: 20 }}>
          <TextInput
            style={[
              container.fillHorizontal,
              container.input,
              container.container,
            ]}
            multiline={true}
            ref={setTextInput}
            placeholder="Write a message . . ."
            onChangeText={(caption) => setInput(caption)}
          />
          {item.type == 1 ? (
            <Image
              style={utils.profileImageSmall}
              source={{ uri: props.route.params.post.downloadURL }}
            />
          ) : (
            <CachedImage
              cacheKey={item.id}
              style={{ aspectRatio: 1 / 1, height: 80 }}
              source={{ uri: props.route.params.post.downloadURLStill }}
            />
          )}
        </View>
      ) : null}

      <Divider />
      {chats.length !== 0 ? (
        <FlatList
          numColumns={1}
          horizontal={false}
          data={chats}
          keyExtractor={(item, index) => item.id}
          renderItem={({ item }) => (
            <View
              style={styles.conservation
              }
            >
              {item.otherUser == null ? (
                <FontAwesome5
                  style={[utils.profileImageSmall]}
                  name="user-circle"
                  size={35}
                  color="black"
                />
              ) : (
                <TouchableOpacity
                  style={[utils.padding15, container.horizontal]}
                  activeOpacity={share ? 1 : 0}
                  onPress={() => {
                    if (!share) {
                      props.navigation.navigate("Chat", {
                        user: item.otherUser,
                      });
                    }
                  }}
                >
                  <View style={container.horizontal}>
                    {item.otherUser.image == "default" ? (
                      <FontAwesome5
                        style={styles.image}
                        name="user-circle"
                        size={35}
                        color="black"
                      />
                    ) : (
                      <Image
                        style={styles.image}
                        source={{
                          uri: item.otherUser.image,
                        }}
                      />
                    )}
                  </View>

                      <View style={{
                          flex: 1,
                          justifyContent: 'center'
                        }}>
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between'
                        }}>
                          <Text numerOfLine={1} style={styles.username}>{item.otherUser.name}</Text>
                           {item.lastMessageTimestamp == null ? (<Text style={styles.time}>Now</Text>) :
                         ( <Text style={styles.time}>
                          {timeDifference(
                            new Date(),
                            item.lastMessageTimestamp.toDate()
                          )}
                        </Text>
                         )}
                        
                        </View>
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between'
                        }}>
                          <Text style={styles.message}>{item.lastMessage}</Text>
                          <View style={styles.notificationCircle}>
                            <Text style={styles.notification}>4</Text>
                          </View>
                        </View>
                      </View>

                  

                  {share ? (
                    <TouchableOpacity
                      style={[
                        utils.buttonOutlined,
                        utils.margin15Right,
                        {
                          backgroundColor: "#0095ff",
                          marginLeft: "auto",
                          justifyContent: "center",
                        },
                      ]}
                      onPress={() => sendPost(item)}
                    >
                      <Text
                        style={[
                          text.bold,
                          {
                            color: "white",
                            textAlign: "center",
                            textAlignVertical: "center",
                          },
                        ]}
                      >
                        Send
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      ) : (
        <View
          style={{ height: "100%", justifyContent: "center", margin: "auto" }}
        >
          <FontAwesome5
            style={{ alignSelf: "center", marginBottom: 20 }}
            name="comments"
            size={40}
            color="black"
          />
          <Text style={[text.notAvailable]}>No chats available</Text>
        </View>
      )}
    </View>
  );
}

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  chats: store.userState.chats,
  users: store.usersState.users,
});
const mapDispatchProps = (dispatch) =>
  bindActionCreators({ fetchUsersData }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Chat);

const styles = StyleSheet.create({
	container: {

	},
	conversation: {
		flexDirection: 'row',
		paddingBottom: 25,
		paddingRight: 20,
		paddingLeft: 10
	},
	imageContainer: {
		marginRight: 15,
		borderRadius: 25,
		height: 50,
		width: 50,
		overflow: 'hidden',
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'center' 
	},
	image: {
		marginRight: 15,
		borderRadius: 25,
		height: 50,
		width: 50,
    overflow: 'hidden',
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'center'
	},
	username: {
		fontSize: 18,
		color: "#000",
		width: 210
	},
	message: {
		fontSize: 15,
		width: 240,
		color: '#555'
	},
	time: {
		fontSize: 13,
		color: '#555',
		fontWeight: '300'
	},
	notificationCircle: {
		backgroundColor: '#1e88e5',
		borderRadius: 50,
		height: 20,
		width: 20,
		marginRight: 5,
		alignItems: 'center',
		justifyContent: 'center'
	},
	notification: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 10
	}
})


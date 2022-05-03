import { FontAwesome,FontAwesome5,  Ionicons , AntDesign, Icon,MaterialCommunityIcons,MaterialIcons} from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View
  , StyleSheet, Animated
} from "react-native";
import CachedImage from "react-native-expo-cached-image";
import { Provider } from "react-native-paper";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchFeedPosts, fetchUserChats } from "../../../redux/actions/index";
import { container, text, utils } from "../../styles";
import { timeDifference } from "../../utils";
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
  getDocs,
  getDoc,
  orderBy,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import EmojiPicker from "./emojis/EmojiPicker";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid, regular, brands } from '@fortawesome/fontawesome-svg-core/import.macro'
import  {
	useSharedValue,
	withSpring,
	withTiming,
	useAnimatedStyle,
} from "react-native-reanimated";

import ImgToBase64 from 'react-native-image-base64';
import * as ImagePicker from 'expo-image-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

function Chat(props) {
  //console.log('ppp',props)
  
  
  
  const [user, setUser] = useState(null);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [input, setInput] = useState("");
  const [textInput, setTextInput] = useState(null);
  const [flatList, setFlatList] = useState(null);
  const [initialFetch, setInitialFetch] = useState(false);
  const [heightValue,setHeightValue]=useState(new Animated.Value(70))
  const [imageUrl,setImageUrl] = useState(null)
  

  useEffect(() => {
    setUser(props.route.params.user);
  }, [props.route.params.user]);
  useEffect(() => {
    showEmojis();
	}, [showEmojiPicker]);

  const showEmojis = () => {
    Animated.timing(heightValue,{
      toValue: showEmojiPicker ? 400 : 70,
      duration: 50,
      useNativeDriver: false
    }).start();
  }

  const openGallery= async () =>{
    console.log('in open')
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log("pic--. ",result);
    if(!result.cancelled){
      // setImageUrl(result.uri)
      // uploadToFirebase(imageUrl)
      uploadToFirebase(result.uri)
    }
  }
  const uploadToFirebase= async(imageUrl) =>{
    const chatsCollectionRef = collection(db, "chats");
      const docRef = doc(chatsCollectionRef, chat.id);
      const messagesCollectionRef = collection(docRef, "messages");
      try {
        await addDoc(messagesCollectionRef, {
          creator: auth.currentUser.uid,
          text: "",
          photoURL: imageUrl,
          creation: serverTimestamp(),
        });
        console.log('image upload')
      } catch (err) {
        console.log(err);
      }
      await updateDoc(docRef, {
        lastMessage: "photo",
        lastMessageTimestamp: serverTimestamp(),
        [chat.users[0]]: false,
        [chat.users[1]]: false,
      });
    }


  useEffect(async () => {
    if (user == null) {
      return;
    }
    if (initialFetch) {
      return;
    }
    
    
   
    

    const chat = props.chats.find((el) => el.users.includes(user.uid));
    setChat(chat);
   
    

    // props.navigation.setOptions({
    //   headerTitle: () => (
    //     <View
    //       style={[
    //         container.horizontal,
    //         utils.alignItemsCenter,
    //         { overflow: "hidden" },
    //       ]}
    //     >
    //       <TouchableOpacity style={styles.backButton} >
    //       <FontAwesome name="angle-left" size={24} color="blue" />
		// 	</TouchableOpacity>
    //       {user.image == "default" ? (
    //         <FontAwesome5
    //           style={[utils.profileImageSmall]}
    //           name="user-circle"
    //           size={34}
    //           color="black"
    //         />
    //       ) : (
    //         <Image
    //           style={[utils.profileImageSmall]}
    //           source={{
    //             uri: user.image,
    //           }}
    //         />
    //       )}
    //       <Text style={{color: 'black', fontSize: 20}} >
    //         {props.route.params.user.name}
    //       </Text>
    //     </View>
    //   ),
    // });

    props.navigation.setOptions({
      headerStyle: {
      
		backgroundColor: '#1e88e5',
	
      },
        
      
      headerTitle: () => (
        
           <TouchableOpacity style={styles.profile}>
           {user.image == "default" ? (
            <FontAwesome5
              style={styles.image}
              name="user-circle"
              size={38}
              color="darkgrey"
            />
          ) : (
            <Image
              style={styles.image}
              source={{
                uri: user.image,
              }}
            />
          )}
           <View style={styles.usernameAndOnlineStatus}>
						<Text style={styles.username}>{props.route.params.user.name}</Text>
						<Text style={styles.onlineStatus}>Online</Text>
					</View>


					
					
				</TouchableOpacity>
       
          
          
          
       
      ),
      headerLeft: () => (
          <TouchableOpacity style={styles.backButton} onPress={props.navigation.goBack} >
        
            <Ionicons name="chevron-back" size={34} color="white" />
              
          </TouchableOpacity>
      ),
      headerRight: ()=>(
         
            <View style={styles.options}>
              <TouchableOpacity style={{ paddingHorizontal: 5 }}>
                  <FontAwesome name="video-camera" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={{ paddingHorizontal: 20 }}>
                  <Ionicons name="call" size={24} color="white" />
  
              </TouchableOpacity>
          </View>
      )
    });

    if (chat !== undefined) {
      const chatsCollectionRef = collection(db, "chats");
      const docRef = doc(chatsCollectionRef, chat.id);
      const messagesCollectionRef = collection(docRef, "messages");
      const q = query(messagesCollectionRef, orderBy("creation", "asc"));
      onSnapshot(q, (snapshot) => {
        let messages = snapshot.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;
          return { id, ...data };
        });
        setMessages(messages);
      });

      await updateDoc(docRef, {
        [auth.currentUser.uid]: true,
      });
      setInitialFetch(true);
    } else {
      createChat();
    }
  }, [user, props.chats]);

  const createChat = async () => {
    const chatsCollectionRef = collection(db, "chats");
    await addDoc(chatsCollectionRef, {
      users: [auth.currentUser.uid, user.uid],
      lastMessage: "Send the first message",
      lastMessageTimestamp: serverTimestamp(),
    });
    props.fetchUserChats();
  };
  const onSend = async () => {
    const textToSend = input;
    if (chat == undefined) {
      return;
    }

    if (input.length == 0) {
      return;
    }
    setInput("");

    textInput.clear();

    const chatsCollectionRef = collection(db, "chats");
    const docRef = doc(chatsCollectionRef, chat.id);
    const messagesCollectionRef = collection(docRef, "messages");
    try {
      await addDoc(messagesCollectionRef, {
        creator: auth.currentUser.uid,
        text: textToSend,
        creation: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    }
    await updateDoc(docRef, {
      lastMessage: textToSend,
      lastMessageTimestamp: serverTimestamp(),
      [chat.users[0]]: false,
      [chat.users[1]]: false,
    });
  };
  // const heightAnimatedStyle = useAnimatedStyle(() => {
	// 	return {
	// 		height: height.value
	// 	}
	// })

  return (
    <View
      style={[
        container.container,
        container.alignItemsCenter,
        utils.backgroundWhite,
      ]}
    >
      <Provider>
        <FlatList
          numColumns={1}
          horizontal={false}
          data={messages}
          ref={setFlatList}
          onContentSizeChange={() => {
            if (flatList != null) flatList.scrollToEnd({ animated: true });
          }}
          renderItem={({ item }) => (
            <View
              style={[
                utils.padding10,
                container.container,
                container.chatContainer,
                item.creator == auth.currentUser.uid
                  ? container.chatRight
                  : container.chatLeft,
              ]}
            >
              {item.creator !== undefined && item.creation !== null ? (
                <View style={container.horizontal}>
                  <View>
                     {item.creator == auth.currentUser.uid ?
                    <Text style={[utils.margin5Bottom,{color: "white",
                    alignSelf: "flex-start",
                    fontSize: 15,}]}>
                      {item.text}
                    </Text>

                   : <Text style={[utils.margin5Bottom,{color: "black",
                   alignSelf: "flex-start",
                   fontSize: 15,}]}>
                      {item.text}
                    </Text>
          }
                    {item.post != null ? (
                      <TouchableOpacity
                        style={{ marginBottom: 20, marginTop: 10 }}
                        onPress={() => {
                          props.navigation.navigate("Post", {
                            item: item.post,
                            user: item.post.user,
                          });
                        }}
                      >
                        {item.post.type == 0 ? (
                          <CachedImage
                            cacheKey={item.id}
                            style={{ aspectRatio: 1 / 1, width: 200 }}
                            source={{ uri: item.post.downloadURLStill }}
                          />
                        ) : (
                          <CachedImage
                            cacheKey={item.id}
                            style={{ aspectRatio: 1 / 1, width: 200 }}
                            source={{ uri: item.post.downloadURL }}
                          />
                        )}
                      </TouchableOpacity>
                    ) : null}
                    {item.photoURL != null ? (
                      <TouchableOpacity
                        style={{ marginBottom: 20, marginTop: 10 }}
                        
                      >
                        
                          <CachedImage
                            cacheKey={item.id}
                            style={{ aspectRatio: 1 / 1, width: 200 }}
                            source={{ uri: item.photoURL }}
                          />
                        
                      </TouchableOpacity>
                    ) : null}

                    {item.creator == auth.currentUser.uid 
                    ?  <Text
                    style={[
                      text.grey,
                      text.small,
                      utils.margin5Bottom,
                      text.whitesmoke
                      
                    ]}
                  >
                    {timeDifference(new Date(), item.creation.toDate())}
                  </Text> 
                  :  <Text
                  style={[
                    text.grey,
                    text.small,
                    utils.margin5Bottom,
                    
                  ]}
                >
                  {timeDifference(new Date(), item.creation.toDate())}
                </Text>}
                    
                  </View>
                </View>
              ) : null}
            </View>
          )}
        />

        {/* <View
          style={[
            container.horizontal,
            utils.padding10,
            utils.alignItemsCenter,
            utils.backgroundWhite,
            utils.borderTopGray,
          ]}
        >
          {props.currentUser.image == "default" ? (
            <FontAwesome5
              style={[utils.profileImageSmall]}
              name="user-circle"
              size={35}
              color="black"
            />
          ) : (
            <Image
              style={[utils.profileImageSmall]}
              source={{
                uri: props.currentUser.image,
              }}
            />
          )}

          <View
            style={[
              container.horizontal,
              utils.justifyCenter,
              utils.alignItemsCenter,
            ]}
          >
            <TextInput
              ref={(input) => {
                setTextInput(input);
              }}
              value={input}
              multiline={true}
              style={[
                container.fillHorizontal,
                container.input,
                container.container,
              ]}
              placeholder="message..."
              onChangeText={(input) => setInput(input)}
            />

            <TouchableOpacity
              onPress={() => onSend()}
              
            >
              <Ionicons name="send" size={24} color="#2B68E6" />
            </TouchableOpacity>
                <TouchableOpacity onPress={onSend} activeOpacity={0.5} >
                <Text style={{color: 'black', fontSize: 20}} >
                Send
              </Text>
                        <Ionicons name="send" size={24} color="#2B68E6" />
                </TouchableOpacity>
          </View>
        
        </View> */}
        <Animated.View   style={[{height: heightValue},styles.container]}>
        <View style={styles.innerContainer}>
        <View style={styles.inputAndMicrophone}>

        <TouchableOpacity
						style={styles.emoticonButton}
						onPress={() => setShowEmojiPicker((value) => !value)}
					>
						<MaterialCommunityIcons 
            name={
              showEmojiPicker ? "close" : "emoticon-outline"
            }
            size={24} color="#9f9f9f" />
							
						
					</TouchableOpacity>
                    <TextInput 
                      multiline 
                      value ={input} 
                      ref={(input) => {setTextInput(input)}} 
                      onChangeText={(input) => setInput(input)} 
                      onSubmitEditing={onSend} 
                      placeholder='Type message....'
                        style = {styles.textInput}>

                      </TextInput>

                      <TouchableOpacity style={styles.clipButtonStyle}>
                      <MaterialCommunityIcons name="paperclip" size={24} color="#9f9f9f"  />
                      
					
					</TouchableOpacity>
					<TouchableOpacity style={styles.cameraIconButtonStyle} onPress={openGallery}>
          <MaterialCommunityIcons name="camera" size={24} color="#9f9f9f" />
          
						
					</TouchableOpacity>



          </View>
          {/* <TouchableOpacity style={styles.sendButton} onPress={onSend} activeOpacity={0.5}>
          <Ionicons name="send" size={24} color="#2B68E6" />
          </TouchableOpacity> */}

        
                    
                    <TouchableOpacity  onPress={onSend} activeOpacity={0.5} >
                    <MaterialCommunityIcons name="send-circle" size={44} color='#1e88e5'/>
                   

                    </TouchableOpacity>
                    

                </View>
                <EmojiPicker />

                </Animated.View>
                


                {/* <View style={styles.innerContainer}>
                        <View style={styles.inputAndMicrophone}>
                          <TouchableOpacity
                            style={styles.emoticonButton}
                            onPress={() => setShowEmojiPicker((value) => !value)}
                          >
                            <Icon
                              name={
                                showEmojiPicker ? "close" : "emoticon-outline"
                              }
                              size={23}
                              color="#9f9f9f"
                            />
                          </TouchableOpacity>
                          <TextInput
                            multiline
                            placeholder={"Type something..."}
                            style={styles.textInput}
                            value={input}
                            ref={(input) => {setTextInput(input)}} 
                            onChangeText={(input) => setInput(input)}
                            onSubmitEditing={onSend}/>
                          <TouchableOpacity style={styles.rightIconButtonStyle}>
                            <Icon
                              name="paperclip"
                              size={23}
                              color="#9f9f9f"
                            />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.rightIconButtonStyle}>
                            <Icon
                              name="camera"
                              size={23}
                              color="#9f9f9f"
                            />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.sendButton} onPress={onSend} activeOpacity={0.5}>
                          <Icon
                            name="send" 
                            size={23}
                            color="#2B68E6"
                          />
                        </TouchableOpacity>
                      </View> */}
      </Provider>
      
    </View>
  );
}

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  chats: store.userState.chats,
  following: store.userState.following,
  feed: store.usersState.feed,
});
const mapDispatchProps = (dispatch) =>
  bindActionCreators({ fetchUserChats, fetchFeedPosts }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Chat);
const styles = StyleSheet.create({

  headerContainer: {
		flexDirection: "row",
		backgroundColor: '#003153',
		paddingTop: 40,
		paddingBottom: 10,
	},
  profileOptions: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 10,
	},
  profile: {
		flexDirection: "row",
		alignItems: "center",
		borderColor: "#fff",
		flex: 4,
    
	},
  image: {
		height: 40,
		width: 40,
		borderRadius: 32.5,
	},
  usernameAndOnlineStatus: {
		flexDirection: "column",
		justifyContent: "center",
		paddingHorizontal: 10,
	},
	username: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
	onlineStatus: {
		color: "white",
		fontSize: 16,
	},
	options: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
	},
 
  footer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: "100%",
      padding: 15,
  },
  textInput: {
      bottom: 0,
      height: 40,
      flex: 1,
      marginRight: 15,
      backgroundColor: '#ECECEC',
      padding: 10,
      color: 'grey',
      borderRadius: 30,

  },
  backButton: {
		alignSelf: "center",
		paddingHorizontal: 10,
    color: 'white',
	},
  container: {
		justifyContent: "center",
		backgroundColor: '#fff',
	},
	replyContainer: {
		paddingHorizontal: 10,
		marginHorizontal: 10,
		justifyContent: "center",
		alignItems: "flex-start",
	},
	title: {
		marginTop: 5,
		fontWeight: "bold",
	},
	closeReply: {
		position: "absolute",
		right: 10,
		top: 5,
	},
	reply: {
		marginTop: 5,
	},
	innerContainer: {
		paddingHorizontal: 10,
		marginHorizontal: 10,
		justifyContent: "space-between",
		alignItems: "center",
		flexDirection: "row",
		paddingVertical: 10,
	},
	inputAndMicrophone: {
		flexDirection: "row",
		backgroundColor:'#f0f0f0',
		flex: 3,
		marginRight: 10,
		paddingVertical: Platform.OS === "ios" ? 10 : 0,
		borderRadius: 30,
		alignItems: "center",
		justifyContent: "space-between",
	},
	input: {
		backgroundColor: "transparent",
		paddingLeft: 20,
		color: '#000',
		flex: 3,
		fontSize: 15,
		height: 50,
		alignSelf: "center",
	},
	clipIconButtonStyle: {
		justifyContent: "center",
		alignItems: "center",
		
		paddingLeft: 5,
    
		
		borderLeftColor: "#fff",
	},
  cameraIconButtonStyle: {
		justifyContent: "center",
		alignItems: "center",
		
		paddingLeft: 5,
    paddingRight: 10,
		
		borderLeftColor: "#fff",
	},
	swipeToCancelView: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 30,
	},
	swipeText: {
		color: '#9f9f9f',
		fontSize: 15,
	},
	emoticonButton: {
		justifyContent: "center",
		alignItems: "center",
		paddingLeft: 10,
	},
	recordingActive: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingLeft: 10,
	},
	recordingTime: {
		color: '#9f9f9f',
		fontSize: 20,
		marginLeft: 5,
	},
	microphoneAndLock: {
		alignItems: "center",
		justifyContent: "flex-end",
	},
	lockView: {
		backgroundColor: "#eee",
		width: 60,
		alignItems: "center",
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		height: 130,
		paddingTop: 20,
	},
	sendButton: {
		backgroundColor:'#003153',
		borderRadius: 30,
		height: 44,
		width: 44,
		alignItems: "center",
		justifyContent: "center",
	}

})





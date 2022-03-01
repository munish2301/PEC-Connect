import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { sendNotification } from "../../../redux/actions/index";
import { container, text, utils } from "../../styles";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../../firebase_config/firebaseConfig";
import { getFirestore, collection, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

function Profile(props) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
    const { currentUser, posts } = props;

    if (props.route.params.uid === auth.currentUser.uid) {
      setUser(currentUser);
      setLoading(false);
    } else {
      const usersCollectionRef = collection(db, "users");
      const docRef = doc(usersCollectionRef, props.route.params.uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists) {
        props.navigation.setOptions({
          title: snapshot.data().username,
        });

        setUser({ uid: props.route.params.uid, ...snapshot.data() });
      }
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <View
        style={{ height: "100%", justifyContent: "center", margin: "auto" }}
      >
        <ActivityIndicator
          style={{ alignSelf: "center", marginBottom: 20 }}
          size="large"
          color="#00ff00"
        />
        <Text style={[text.notAvailable]}>Loading...</Text>
      </View>
    );
  }
  if (user === null) {
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
        <Text style={[text.notAvailable]}>User Not Found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[container.container, utils.backgroundWhite]}
      horizontal={false}
    >
      <View style={[container.profileInfo]}>
        <View style={[utils.noPadding, container.row]}>
          {user.image == "default" ? (
            <FontAwesome5
              style={[utils.profileImageBig, utils.marginBottomSmall]}
              name="user-circle"
              size={80}
              color="black"
            />
          ) : (
            <Image
              style={[utils.profileImageBig, utils.marginBottomSmall]}
              source={{
                uri: user.image,
              }}
            />
          )}
        </View>

        <View>
          <Text style={text.bold}>{user.name}</Text>
          <Text style={[text.profileDescription, utils.marginBottom]}>
            {user.description}
          </Text>

          {props.route.params.uid !== auth.currentUser.uid ? (
            <View style={[container.horizontal]}>
              <TouchableOpacity
                style={[utils.buttonOutlined, container.container]}
                title="Chat"
                onPress={() => props.navigation.navigate("Chat", { user })}
              >
                <Text style={[text.bold, text.center]}>Message</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={utils.buttonOutlined}
              onPress={() => props.navigation.navigate("Edit")}
            >
              <Text style={[text.bold, text.center]}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
});

const mapDispatchProps = (dispatch) =>
  bindActionCreators({ sendNotification }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Profile);

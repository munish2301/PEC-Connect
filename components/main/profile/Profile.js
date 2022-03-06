import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  TouchableOpacity,
  View,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Avatar, Title, useTheme, Caption, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
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
  const { colors } = useTheme();
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
        props.navigation.setOptions({
          headerRight: ({}) => (
            <View style={{ marginRight: 10 }}>
              <Icon.Button
                name="chat"
                size={25}
                backgroundColor="#FFFFFF"
                color={colors.text}
                onPress={() => props.navigation.navigate("Chat", { user })}
              />
            </View>
          ),
        });
      }
      setLoading(false);
    }
  }, [props.route.params.uid]);

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
    <ScrollView>
      <SafeAreaView style={styles.container}>
        <View style={styles.userInfoSection}>
          <View style={{ flexDirection: "row", marginTop: 15 }}>
            {user.image == "default" ? (
              <FontAwesome5
                style={[utils.profileImageBig, utils.marginBottomSmall]}
                name="user-circle"
                size={80}
                color="black"
              />
            ) : (
              <Avatar.Image
                source={{
                  uri: user.image,
                }}
                size={80}
              />
            )}

            <View style={{ marginLeft: 20 }}>
              <Title
                style={[
                  styles.title,
                  {
                    marginTop: 15,
                    marginBottom: 5,
                  },
                ]}
              >
                {user.name}
              </Title>
              <Caption style={styles.caption}>{user.username}</Caption>
            </View>
          </View>
        </View>

        <View style={styles.userInfoSection}>
          <View style={styles.row}>
            <Icon name="phone" color="#777777" size={20} />
            <Text style={{ color: "#777777", marginLeft: 20 }}>
              {user.mobile_number}
            </Text>
          </View>
          <View style={styles.row}>
            <Icon name="email" color="#777777" size={20} />
            <Text style={{ color: "#777777", marginLeft: 20 }}>
              {user.email}
            </Text>
          </View>
        </View>
        <View style={styles.infoBoxWrapper}>
          <View
            style={[
              styles.infoBox,
              {
                borderRightColor: "#dddddd",
                borderRightWidth: 1,
              },
            ]}
          >
            <Title>₹140.50</Title>
            <Caption>Wallet</Caption>
          </View>
          <View style={styles.infoBox}>
            <Title>12</Title>
            <Caption>Orders</Caption>
          </View>
        </View>
        <View style={styles.menuWrapper}>
          <View style={styles.menuItem}>
            <Icon name="heart-outline" color="#FF6347" size={25} />
            <Text style={styles.menuItemText}>Your Favorites</Text>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
});

const mapDispatchProps = (dispatch) =>
  bindActionCreators({ sendNotification }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Profile);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userInfoSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  infoBoxWrapper: {
    borderBottomColor: "#dddddd",
    borderBottomWidth: 1,
    borderTopColor: "#dddddd",
    borderTopWidth: 1,
    flexDirection: "row",
    height: 100,
  },
  infoBox: {
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  menuWrapper: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  menuItemText: {
    color: "#777777",
    marginLeft: 20,
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 26,
  },
});

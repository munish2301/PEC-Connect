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
      const usersCollectionRef = collection(db, "users");
      const docRef = doc(usersCollectionRef, auth.currentUser.uid);
      const snapshot = await getDoc(docRef);
      setUser({ uid: auth.currentUser.uid, ...snapshot.data() });
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
  }, [props.route.params.uid, props.currentUser]);

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
              <Caption style={styles.caption}>Hi</Caption>
              <Title
                style={[
                  styles.title,
                  {
                    marginTop: 5,
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
        <View style={styles.menuWrapper}>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>About :</Text>
            <Text style={styles.menuitemText}>{user.summary}</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Student ID :</Text>
            <Text style={styles.menuitemText}>{user.sid}</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Email :</Text>
            <Text style={styles.menuitemText}>{user.email}</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Mobile Number :</Text>
            <Text style={styles.menuitemText}>{user.mobile_number}</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Branch :</Text>
            <Text style={styles.menuitemText}>{user.branch}</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Year :</Text>
            <Text style={styles.menuitemText}>{user.year_of_study}</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Intern at :</Text>
            <Text style={styles.menuitemText}>{user.org_of_internship}</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Placed at :</Text>
            <Text style={styles.menuitemText}>{user.org_of_placement}</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Academic Proficiency :</Text>
            <Text style={styles.menuitemText}>{user.academic_proficiency}</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Technical Skills :</Text>
            <Text style={styles.menuitemText}>{user.technical_skills}</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Achievements :</Text>
            <Text style={styles.menuitemText}>{user.achievements}</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Interests :</Text>
            {user.interests.map((e, index) => (
              <Text key={index} style={styles.interestText}>
                {e}
              </Text>
            ))}
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
  menuWrapper: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 30,
  },
  menuItemText: {
    color: "#777777",
    marginLeft: 20,
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 26,
  },
  menuitemText: {
    marginLeft: 20,
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 26,
  },
  interestText: {
    marginLeft: 20,
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 26,
  },
});

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
import Icon from "react-native-vector-icons/Ionicons";
import { ScrollView } from "react-native-gesture-handler";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { sendNotification } from "../../../redux/actions/index";
import { container, text, utils } from "../../styles";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../../firebase_config/firebaseConfig";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

function Profile(props) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  useEffect(async () => {
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

  const deleteInterest = async (index) => {
    const usersCollectionRef = collection(db, "users");
    const docRef = doc(usersCollectionRef, auth.currentUser.uid);
    await updateDoc(docRef, {
      interests: [
        ...user.interests.slice(0, index),
        ...user.interests.slice(index + 1),
      ],
    });
  };
  const clickingImage = () => {};
  const profilelogo = require("./../../../assets/profile.png");
  if (props.route.params.uid !== auth.currentUser.uid) {
    props.navigation.setOptions({
      headerRight: ({}) => (
        <View style={{ marginRight: 10 }}>
          <Icon.Button
            name="chatbox"
            size={25}
            backgroundColor="#1E88E5"
            color="#fff"
            onPress={() => props.navigation.navigate("Chat", { user })}
          />
        </View>
      ),
    });
  }
  return (
    <ScrollView>
      <SafeAreaView style={{ ...styles.container, backgroundColor: "#E3F2FD" }}>
        <View style={styles.userInfoSection}>
          <View
            style={{
              alignItems: "center",
              marginTop: 15,
            }}
          >
            <TouchableOpacity onPress={() => clickingImage()}>
              {user.image == "default" ? (
                <Avatar.Image
                  source={profilelogo}
                  size={180}
                  style={{
                    width: 180,
                    height: 180,
                    // borderWidth: 5,
                    // borderColor: "#64B5F6",
                    // borderRadius: 90,
                    backgroundColor: "#fff",
                  }}
                />
              ) : (
                <Avatar.Image
                  source={{
                    uri: user.image,
                  }}
                  size={180}
                  style={{
                    width: 180,
                    height: 180,
                    // borderWidth: 5,
                    // borderColor: "#64B5F6",
                    // borderRadius: 90,
                    backgroundColor: "#fff",
                  }}
                />
              )}
            </TouchableOpacity>
            <View style={{ marginTop: 8, alignItems: "center" }}>
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
              <Caption
                style={{
                  ...styles.caption,
                  paddingBottom: 20,
                  color: "#64B5F6",
                }}
              >
                {user.username}
              </Caption>
            </View>
          </View>
        </View>
        {user.type === "Student" && (
          <View style={styles.menuWrapper}>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>About</Text>
              <Text style={styles.menuitemText}>{user.summary}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Student ID</Text>
              <Text style={styles.menuitemText}>{user.sid}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Email</Text>
              <Text style={styles.menuitemText}>{user.email}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Mobile Number</Text>
              <Text style={styles.menuitemText}>{user.mobile_number}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Branch</Text>
              <Text style={styles.menuitemText}>{user.branch}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Year</Text>
              <Text style={styles.menuitemText}>{user.year_of_study}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Intern at</Text>
              <Text style={styles.menuitemText}>{user.org_of_internship}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Placed at</Text>
              <Text style={styles.menuitemText}>{user.org_of_placement}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Academic Proficiency</Text>
              <Text style={styles.menuitemText}>
                {user.academic_proficiency}
              </Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Technical Skills</Text>
              <Text style={styles.menuitemText}>{user.technical_skills}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Achievements</Text>
              <Text style={styles.menuitemText}>{user.achievements}</Text>
            </View>
            {props.route.params.uid === auth.currentUser.uid && (
              <View style={styles.menuItem}>
                {user.interests.length !== 0 && (
                  <Text style={styles.menuItemText}>Interests</Text>
                )}
                {user.interests.map((e, index) => (
                  <View key={index} style={{ flexDirection: "row" }}>
                    <Text key={index} style={styles.interestText}>
                      {e}
                    </Text>
                    <TouchableOpacity onPress={() => deleteInterest(index)}>
                      <Icon name="close" color="#64B5F6" size={26} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        {user.type === "Faculty" && (
          <View style={styles.menuWrapper}>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>About</Text>
              <Text style={styles.menuitemText}>{user.summary}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Employee ID</Text>
              <Text style={styles.menuitemText}>{user.eid}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Email</Text>
              <Text style={styles.menuitemText}>{user.email}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Mobile Number</Text>
              <Text style={styles.menuitemText}>{user.mobile_number}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Department</Text>
              <Text style={styles.menuitemText}>{user.department}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Designation</Text>
              <Text style={styles.menuitemText}>{user.designation}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Technical Skills</Text>
              <Text style={styles.menuitemText}>{user.technical_skills}</Text>
            </View>
            {props.route.params.uid === auth.currentUser.uid && (
              <View style={styles.menuItem}>
                {user.interests.length !== 0 && (
                  <Text style={styles.menuItemText}>Interests</Text>
                )}
                {user.interests.map((e, index) => (
                  <View key={index} style={{ flexDirection: "row" }}>
                    <Text key={index} style={styles.interestText}>
                      {e}
                    </Text>
                    <TouchableOpacity onPress={() => deleteInterest(index)}>
                      <Icon name="close" color="#64B5F6" size={26} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        {user.type === "Secretary" && (
          <View style={styles.menuWrapper}>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>About</Text>
              <Text style={styles.menuitemText}>{user.summary}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Student ID</Text>
              <Text style={styles.menuitemText}>{user.sid}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Email</Text>
              <Text style={styles.menuitemText}>{user.email}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Mobile Number</Text>
              <Text style={styles.menuitemText}>{user.mobile_number}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>
                Society/Club/NSS/NCC/Sports
              </Text>
              <Text style={styles.menuitemText}>
                {user.technical_club_cultural_club_nss_ncc_sports}
              </Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Department</Text>
              <Text style={styles.menuitemText}>{user.department}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Designation</Text>
              <Text style={styles.menuitemText}>{user.designation}</Text>
            </View>
            {props.route.params.uid === auth.currentUser.uid && (
              <View style={styles.menuItem}>
                {user.interests.length !== 0 && (
                  <Text style={styles.menuItemText}>Interests</Text>
                )}
                {user.interests.map((e, index) => (
                  <View key={index} style={{ flexDirection: "row" }}>
                    <Text key={index} style={styles.interestText}>
                      {e}
                    </Text>
                    <TouchableOpacity onPress={() => deleteInterest(index)}>
                      <Icon name="close" color="#64B5F6" size={26} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        {user.type === "Webmaster" && (
          <View style={styles.menuWrapper}>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>About</Text>
              <Text style={styles.menuitemText}>{user.summary}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Employee ID</Text>
              <Text style={styles.menuitemText}>{user.eid}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Email</Text>
              <Text style={styles.menuitemText}>{user.email}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Mobile Number</Text>
              <Text style={styles.menuitemText}>{user.mobile_number}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>Designation</Text>
              <Text style={styles.menuitemText}>{user.designation}</Text>
            </View>
            {props.route.params.uid === auth.currentUser.uid && (
              <View style={styles.menuItem}>
                {user.interests.length !== 0 && (
                  <Text style={styles.menuItemText}>Interests</Text>
                )}
                {user.interests.map((e, index) => (
                  <View key={index} style={{ flexDirection: "row" }}>
                    <Text key={index} style={styles.interestText}>
                      {e}
                    </Text>
                    <TouchableOpacity onPress={() => deleteInterest(index)}>
                      <Icon name="close" color="#64B5F6" size={26} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
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
    backgroundColor: "white",
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
    marginTop: 5,
  },
  menuItem: {
    paddingVertical: 5,
    paddingHorizontal: 30,
    paddingBottom: 5,
    backgroundColor: "white",
    marginBottom: 5,
  },
  menuItemText: {
    color: "grey",
    marginLeft: 5,
    fontWeight: "bold",
    fontSize: 13,
    lineHeight: 26,
  },
  menuitemText: {
    marginLeft: 10,
    fontWeight: "600",
    paddingLeft: 10,
    paddingBottom: 5,
    paddingRight: 10,
    paddingTop: 5,
    fontSize: 16,
    lineHeight: 26,
  },
  interestText: {
    marginLeft: 20,
    marginBottom: 5,
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 26,
    borderColor: "#64B5F6",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    paddingBottom: 5,
    paddingRight: 10,
    paddingTop: 5,
  },
});

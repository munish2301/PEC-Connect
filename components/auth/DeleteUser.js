import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View,
  Image,
} from "react-native";
import { container, text, utils } from "../styles";
import Icon from "react-native-vector-icons/Ionicons";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../firebase_config/firebaseConfig";
import {
  getFirestore,
  collection,
  doc,
  query,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const deleteUser = async (userid) => {
  console.log(userid);
  const usersCollectionRef = collection(db, "users");
  const docRef = doc(usersCollectionRef, userid);
  await deleteDoc(docRef);
};
function DeleteUser(props) {
  const [users, setUsers] = useState([]);
  const usersCollectionRef = collection(db, "users");
  const q = query(usersCollectionRef);
  useEffect(() => {}, [users]);
  try {
    getDocs(q).then((snapshot) => {
      let result = snapshot.docs.map((doc) => {
        const data = doc.data();
        const id = doc.id;
        return { id, ...data };
      });
      setUsers(result);
    });
  } catch (err) {
    console.log(err);
  }
  const profilelogo = require("./../../assets/profile.png");
  return (
    <View style={styles.container}>
      <ScrollView>
        {users.map((user) => {
          return (
            <TouchableOpacity
              onPress={() => deleteUser(user.id)}
              key={user.id}
              style={styles.emailItem}
            >
              <View style={{ flexDirection: "row" }}>
                <View style={{ ...utils.justifyCenter }}>
                  <Icon name="close" color="#64B5F6" size={15} />
                </View>
                <View style={{ ...utils.justifyCenter, marginLeft: 15 }}>
                  <Text style={text.username}>{user.username}</Text>
                  <Text style={text.name}>{user.name}</Text>
                </View>
              </View>

              {user.image == "default" ? (
                <Image
                  style={[utils.profileImage, utils.marginBottomSmall]}
                  source={profilelogo}
                />
              ) : (
                <Image
                  style={[utils.profileImage, utils.marginBottomSmall]}
                  source={{
                    uri: user.image,
                  }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "flex-start",
  },
  emailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    marginLeft: 10,
  },
  emailSubject: {
    color: "rgba(0,0,0,0.5)",
  },
  searchInput: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 5,
    margin: 15,
    borderColor: "#64B5F6",
    borderWidth: 1,
    borderRadius: 50,
  },
});

export default DeleteUser;

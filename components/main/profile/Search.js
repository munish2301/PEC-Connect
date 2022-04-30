import { FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View,
  Image,
} from "react-native";
import { container, text, utils } from "../../styles";
import Icon from "react-native-vector-icons/Ionicons";
import SearchInput, { createFilter } from "react-native-search-filter";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../../firebase_config/firebaseConfig";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

function Search(props) {
  const KEYS_TO_FILTERS = [
    "username",
    "name",
    "org_of_internship",
    "org_of_placement",
    "branch",
    "year_of_study",
    "academic_proficiency",
    "technical_skills",
    "department",
    "designation",
    "technical_club_cultural_club_nss_ncc_sports",
  ];
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const usersCollectionRef = collection(db, "users");
  const q = query(usersCollectionRef);
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
  const profilelogo = require("./../../../assets/profile.png");
  const filteredUsers = users.filter(createFilter(searchTerm, KEYS_TO_FILTERS));
  return (
    <View style={styles.container}>
      <SearchInput
        onChangeText={(term) => {
          setSearchTerm(term);
        }}
        style={styles.searchInput}
        placeholder="Type here..."
      />
      <ScrollView>
        {filteredUsers.map((user) => {
          return (
            <TouchableOpacity
              onPress={() =>
                props.navigation.navigate("Profile", {
                  uid: user.id,
                  username: undefined,
                })
              }
              key={user.id}
              style={styles.emailItem}
            >
              <View style={{ flexDirection: "row" }}>
                <View style={{ ...utils.justifyCenter }}>
                  <Icon name="search" color="#64B5F6" size={15} />
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

export default Search;

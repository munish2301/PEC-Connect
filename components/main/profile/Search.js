import { FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { container, text, utils } from "../../styles";
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
              <View>
                <Text>{user.username}</Text>
                <Text style={styles.emailSubject}>{user.name}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
    // <View style={[utils.backgroundWhite, container.container]}>
    //   <View style={{ marginVertical: 30, paddingHorizontal: 20 }}>
    //     <TextInput
    //       style={utils.searchBar}
    //       placeholder="Type Here..."
    //       onChangeText={(search) =>
    //         props.queryUsersByUsername(search).then(setUsers)
    //       }
    //     />
    //   </View>

    //   <FlatList
    //     numColumns={1}
    //     horizontal={false}
    //     data={users}
    //     renderItem={({ item }) => (
    //       <TouchableOpacity
    //         style={[
    //           container.horizontal,
    //           utils.padding10Sides,
    //           utils.padding10Top,
    //         ]}
    //         onPress={() =>
    //           props.navigation.navigate("Profile", {
    //             uid: item.id,
    //             username: undefined,
    //           })
    //         }
    //       >
    //         {item.image == "default" ? (
    //           <FontAwesome5
    //             style={[utils.profileImage, utils.marginBottomSmall]}
    //             name="user-circle"
    //             size={50}
    //             color="black"
    //           />
    //         ) : (
    //           <Image
    //             style={[utils.profileImage, utils.marginBottomSmall]}
    //             source={{
    //               uri: item.image,
    //             }}
    //           />
    //         )}
    //         <View style={utils.justifyCenter}>
    //           <Text style={text.username}>{item.username}</Text>
    //           <Text style={text.name}>{item.name}</Text>
    //         </View>
    //       </TouchableOpacity>
    //     )}
    //   />
    // </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
  },
  emailItem: {
    borderBottomWidth: 0.5,
    borderColor: "rgba(0,0,0,0.3)",
    padding: 10,
  },
  emailSubject: {
    color: "rgba(0,0,0,0.5)",
  },
  searchInput: {
    padding: 10,
    borderColor: "#CCC",
    borderWidth: 1,
  },
});

export default Search;

import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import "expo-asset";
import _ from "lodash";
import React from "react";
import { View, Image, LogBox, Text, Picker } from "react-native";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import * as Updates from "expo-updates";
import { useTheme, Avatar } from "react-native-paper";
import LoginScreen from "./components/auth/Login";
import RegisterScreen from "./components/auth/Register";
import DeleteUserScreen from "./components/auth/DeleteUser";
import AdminHomeScreen from "./components/auth/AdminHome";
import MainScreen from "./components/Main";
import SaveScreen from "./components/main/add/Save";
import ChatScreen from "./components/main/chat/Chat";
import ChatListScreen from "./components/main/chat/List";
import CommentScreen from "./components/main/post/Comment";
import PostScreen from "./components/main/post/Post";
import EditScreen from "./components/main/profile/Edit";
import SearchScreen from "./components/main/profile/Search";
import ProfileScreen from "./components/main/profile/Profile";
import BlockedScreen from "./components/main/random/Blocked";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { container } from "./components/styles";
import rootReducer from "./redux/reducers";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseConfig } from "./firebase_config/firebaseConfig";
import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Dropdown } from "react-native-element-dropdown";
import { StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const store = createStore(rootReducer, applyMiddleware(thunk));
LogBox.ignoreLogs(["Setting a timer"]);
const _console = _.clone(console);
console.warn = (message) => {
  if (message.indexOf("Setting a timer") <= -1) {
    _console.warn(message);
  }
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const logo = require("./assets/logo.png");
const Stack = createStackNavigator();
const onLogout = async () => {
  auth.signOut();
  Updates.reloadAsync();
};
export default function App(props) {
  const [loaded, setloaded] = useState(false);
  const [loggedIn, setloggedIn] = useState(false);
  const [user, setUser] = useState({});
  const { colors } = useTheme();
  const [value, setValue] = useState("PEC Connect");
  const [isFocus, setIsFocus] = useState(false);

  let userDocRef = null;
  useEffect(() => {
    onAuthStateChanged(auth, (USER) => {
      if (!USER) {
        setloaded(true);
        setloggedIn(false);
      } else {
        setloaded(true);
        setloggedIn(true);
        userDocRef = doc(db, "users", auth.currentUser.uid);
        getDoc(userDocRef).then((snapshot) => {
          setUser(snapshot.data());
        });
      }
    });
  }, [value]);

  // function LogoTitle() {
  //   return (
  //     <TouchableOpacity onPress={alert('test')}>
  //       <Text>"PEC-Connect"</Text>
  //     </TouchableOpacity>
  //   );
  // }
  const dropdownOptions = [
    { label: "PEC Connect", value: "PEC Connect" },
    { label: "NSS", value: "NSS" },
    { label: "NCC", value: "NCC" },
    { label: "Tech", value: "Tech" },
    { label: "Cultural", value: "Cultural" },
    { label: "Sports", value: "Sports" },
  ];
  if (!loaded) {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Image
          style={{
            height: 100,
            width: 220,
            alignSelf: "center",
          }}
          source={logo}
        />
      </View>
    );
  }
  if (!loggedIn) {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            navigation={props.navigation}
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
  if (user.isAdmin) {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="AdminHome">
          <Stack.Screen
            name="AdminHome"
            component={AdminHomeScreen}
            navigation={props.navigation}
            options={({}) => {
              return {
                title: "PEC Connect",
                headerTintColor: "#fff",
                headerRight: () => (
                  <View style={{ marginRight: 10 }}>
                    <Icon.Button
                      name="ios-log-out"
                      size={25}
                      backgroundColor="#1E88E5"
                      color="#fff"
                      onPress={() => onLogout()}
                    />
                  </View>
                ),
                headerStyle: {
                  backgroundColor: "#1E88E5",
                },
              };
            }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            navigation={props.navigation}
            options={({}) => {
              return {
                title: "Register New User",
                headerTintColor: "#fff",
                headerRight: () => (
                  <View style={{ marginRight: 10 }}>
                    <Icon.Button
                      name="ios-log-out"
                      size={25}
                      backgroundColor="#1E88E5"
                      color="#fff"
                      onPress={() => onLogout()}
                    />
                  </View>
                ),
                headerStyle: {
                  backgroundColor: "#1E88E5",
                },
              };
            }}
          />
          <Stack.Screen
            name="DeleteUser"
            component={DeleteUserScreen}
            navigation={props.navigation}
            options={({}) => {
              return {
                title: "Delete Existing User",
                headerTintColor: "#fff",
                headerRight: () => (
                  <View style={{ marginRight: 10 }}>
                    <Icon.Button
                      name="ios-log-out"
                      size={25}
                      backgroundColor="#1E88E5"
                      color="#fff"
                      onPress={() => onLogout()}
                    />
                  </View>
                ),
                headerStyle: {
                  backgroundColor: "#1E88E5",
                },
              };
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else {
    return (
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Main">
            <Stack.Screen
              key={Date.now()}
              name="Main"
              navigation={props.navigation}
              options={({ navigation, route }) => {
                const routeName = getFocusedRouteNameFromRoute(route) ?? "Feed";
                switch (routeName) {
                  case "Camera": {
                    return {
                      headerTitle: "Camera",
                      headerTintColor: "#fff",
                      headerStyle: {
                        backgroundColor: "#1E88E5",
                      },
                    };
                  }
                  case "chat": {
                    return {
                      headerTitle: "Chat",
                      headerTintColor: "#fff",
                      headerRight: () => (
                        <View style={{ marginRight: 10 }}>
                          <Icon.Button
                            name="ios-search"
                            size={25}
                            backgroundColor="#1E88E5"
                            color="#fff"
                            onPress={() => navigation.navigate("Search")}
                          />
                        </View>
                      ),
                      headerStyle: {
                        backgroundColor: "#1E88E5",
                      },
                    };
                  }
                  case "Profile": {
                    return {
                      headerTitle: "Profile",
                      headerTintColor: "#fff",
                      headerLeft: () => (
                        <View style={{ marginLeft: 10 }}>
                          <Icon.Button
                            name="ios-log-out"
                            size={25}
                            color="#fff"
                            backgroundColor="#1E88E5"
                            onPress={() => onLogout()}
                          />
                        </View>
                      ),
                      headerRight: () => (
                        <View style={{ marginRight: 10, flexDirection: "row" }}>
                          {(user.type === "Secretary" ||
                            user.type === "Webmaster") && (
                            <MaterialCommunityIcons.Button
                              name="border-all"
                              size={25}
                              backgroundColor="#1E88E5"
                              color="#fff"
                              onPress={() => {}}
                            />
                          )}
                          <MaterialCommunityIcons.Button
                            name="account-edit"
                            size={25}
                            backgroundColor="#1E88E5"
                            color="#fff"
                            onPress={() => navigation.navigate("Edit")}
                          />
                        </View>
                      ),
                      headerStyle: {
                        backgroundColor: "#1E88E5",
                      },
                    };
                  }
                  case "Feed":
                  default: {
                    return {
                      headerTitle: "",
                      headerLeft: () => (
                        <View style={{ marginLeft: 20 }}>
                          <Dropdown
                            style={[
                              styles.dropdown,
                              isFocus && { borderColor: "blue" },
                            ]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            containerStyle={{ borderTopWidth: 0 }}
                            data={dropdownOptions}
                            maxHeight={180}
                            dropdownPosition="bottom"
                            labelField="label"
                            valueField="value"
                            placeholder={!isFocus ? "PEC Connect" : value}
                            value={value}
                            onFocus={() => setIsFocus(true)}
                            onChange={(item) => {
                              setValue(item.value);
                              setIsFocus(false);
                            }}
                          />
                        </View>
                      ),
                      headerRight: () => (
                        <View style={{ marginRight: 10 }}>
                          <Icon.Button
                            name="ios-search"
                            size={25}
                            backgroundColor="#1E88E5"
                            color="#fff"
                            onPress={() => navigation.navigate("Search")}
                          />
                        </View>
                      ),
                      headerStyle: {
                        backgroundColor: "#1E88E5",
                      },
                    };
                  }
                }
              }}
            >
              {(props) => <MainScreen {...props} dropdownValue={value} />}
            </Stack.Screen>
            <Stack.Screen
              key={Date.now()}
              name="Save"
              component={SaveScreen}
              navigation={props.navigation}
            />
            <Stack.Screen
              key={Date.now()}
              name="video"
              component={SaveScreen}
              navigation={props.navigation}
            />
            <Stack.Screen
              key={Date.now()}
              name="Search"
              component={SearchScreen}
              navigation={props.navigation}
              options={({ navigation }) => {
                return {
                  title: "Search",
                  headerTintColor: "#fff",
                  headerRight: () => (
                    <View style={{ marginRight: 10 }}>
                      <Icon.Button
                        name="ios-chatbox"
                        size={25}
                        backgroundColor="#1E88E5"
                        color="#fff"
                        onPress={() => navigation.navigate("ChatList")}
                      />
                    </View>
                  ),
                  headerStyle: {
                    backgroundColor: "#1E88E5",
                  },
                };
              }}
            />
            <Stack.Screen
              key={Date.now()}
              name="Post"
              component={PostScreen}
              navigation={props.navigation}
            />
            <Stack.Screen
              key={Date.now()}
              name="Chat"
              component={ChatScreen}
              navigation={props.navigation}
            />
            <Stack.Screen
              key={Date.now()}
              name="ChatList"
              component={ChatListScreen}
              navigation={props.navigation}
              options={({ navigation }) => {
                return {
                  title: "Chat",
                  headerTintColor: "#fff",
                  headerRight: () => (
                    <View style={{ marginRight: 10 }}>
                      <Icon.Button
                        name="ios-search"
                        size={25}
                        backgroundColor="#1E88E5"
                        color="#fff"
                        onPress={() => navigation.navigate("Search")}
                      />
                    </View>
                  ),
                  headerStyle: {
                    backgroundColor: "#1E88E5",
                  },
                };
              }}
            />
            <Stack.Screen
              key={Date.now()}
              name="Edit"
              component={EditScreen}
              navigation={props.navigation}
            />
            <Stack.Screen
              key={Date.now()}
              name="Profile"
              component={ProfileScreen}
              navigation={props.navigation}
              options={({ navigation }) => {
                return {
                  headerTitle: "Profile",
                  headerTintColor: "#fff",
                  headerLeft: () => (
                    <View style={{ marginLeft: 10 }}>
                      <Icon.Button
                        name="ios-log-out"
                        size={25}
                        color="#fff"
                        backgroundColor="#1E88E5"
                        onPress={() => onLogout()}
                      />
                    </View>
                  ),
                  headerRight: () => (
                    <View style={{ marginRight: 10, flexDirection: "row" }}>
                      {(user.type === "Secretary" ||
                        user.type === "Webmaster") && (
                        <MaterialCommunityIcons.Button
                          name="border-all"
                          size={25}
                          backgroundColor="#1E88E5"
                          color="#fff"
                          onPress={() => {}}
                        />
                      )}
                      <MaterialCommunityIcons.Button
                        name="account-edit"
                        size={25}
                        color="#fff"
                        backgroundColor="#1E88E5"
                        onPress={() => navigation.navigate("Edit")}
                      />
                    </View>
                  ),
                  headerStyle: {
                    backgroundColor: "#1E88E5",
                  },
                };
              }}
            />
            <Stack.Screen
              key={Date.now()}
              name="Comment"
              component={CommentScreen}
              navigation={props.navigation}
            />
            <Stack.Screen
              key={Date.now()}
              name="ProfileOther"
              component={ProfileScreen}
              navigation={props.navigation}
            />
            <Stack.Screen
              key={Date.now()}
              name="Blocked"
              component={BlockedScreen}
              navigation={props.navigation}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    );
  }
}
const styles = StyleSheet.create({
  dropdown: {
    width: 140,
    height: 20,
    borderColor: "blue",
  },
  placeholderStyle: {
    fontWeight: "500",
    fontSize: 18,
  },
  selectedTextStyle: {
    fontWeight: "500",
    fontSize: 18,
  },
});

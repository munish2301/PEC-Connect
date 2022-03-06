import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { reload } from "../redux/actions/index";
import CameraScreen from "./main/add/Camera";
import ChatListScreen from "./main/chat/List";
import FeedScreen from "./main/post/Feed";
import ProfileScreen from "./main/profile/Profile";
import SearchScreen from "./main/profile/Search";
import Icon from "react-native-vector-icons/Ionicons";

const Tab = createMaterialBottomTabNavigator();
const auth = getAuth();

function Main(props) {
  const [unreadChats, setUnreadChats] = useState(false);
  useEffect(() => {
    props.reload();
  }, []);

  useEffect(() => {
    setUnreadChats(false);
    for (let i = 0; i < props.chats.length; i++) {
      if (!props.chats[i][auth.currentUser.uid]) {
        setUnreadChats(true);
      }
    }
  }, [props.currentUser, props.chats]);
  // console.log(props.currentUser);
  if (props.currentUser == null) {
    return <View></View>;
  }
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Tab.Navigator
        initialRouteName="Feed"
        labeled={false}
        tabBarOptions={{
          showIcon: true,
          showLabel: false,
          indicatorStyle: {
            opacity: 0,
          },
        }}
        barStyle={{ backgroundColor: "#ffffff" }}
      >
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          navigation={props.navigation}
          listeners={({ navigation }) => ({
            tabPress: (event) => {
              event.preventDefault();
              navigation.navigate("Profile", { uid: auth.currentUser.uid });
            },
          })}
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name="ios-person" color={color} size={26} />
            ),
          }}
        />
        <Tab.Screen
          key={Date.now()}
          name="Feed"
          component={FeedScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="ios-home" color={color} size={26} />
            ),
          }}
        />
        {props.currentUser.type !== "Student" &&
          props.currentUser.type !== "Faculty" && (
            <Tab.Screen
              key={Date.now()}
              name="Camera"
              component={CameraScreen}
              navigation={props.navigation}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Icon name="ios-add-circle" color={color} size={26} />
                ),
              }}
            />
          )}
        <Tab.Screen
          key={Date.now()}
          name="chat"
          component={ChatListScreen}
          navigation={props.navigation}
          share={false}
          options={{
            tabBarIcon: ({ color, size }) => (
              <View>
                {unreadChats ? (
                  <View
                    style={{
                      backgroundColor: "red",
                      width: 10,
                      height: 10,
                      position: "absolute",
                      right: 0,
                      borderRadius: 100,
                    }}
                  ></View>
                ) : null}
                <View />
                <Icon name="ios-chatbox" color={color} size={26} />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  chats: store.userState.chats,
  friendsRequestsReceived: store.userState.friendsRequestsReceived,
});
const mapDispatchProps = (dispatch) => bindActionCreators({ reload }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Main);

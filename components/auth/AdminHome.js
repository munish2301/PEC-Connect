import React from "react";
import { Button, View } from "react-native";

export default function AdminHome(props) {
  return (
    <View
      style={{
        margin: 10,
        alignContent: "center",
        justifyContent: "center",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <View>
        <Button
          onPress={() => props.navigation.navigate("Register")}
          title="Register New User"
        />
      </View>

      <View style={{ marginTop: 8 }}>
        <Button
          onPress={() => props.navigation.navigate("DeleteUser")}
          title="Delete Existing User"
        />
      </View>
    </View>
  );
}

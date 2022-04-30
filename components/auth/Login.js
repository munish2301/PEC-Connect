import React, { useState } from "react";
import { Button, Text, TextInput, View, Image } from "react-native";
import { container, form } from "../styles";
import { firebaseConfig } from "../../firebase_config/firebaseConfig";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSignUp = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  const logo = require("../../assets/logo.png");
  return (
    <View style={{ ...container.center, backgroundColor: "#fff" }}>
      <View style={container.formCenter}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            paddingBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
              color: "#1E88E5",
            }}
          >
            PEC Connect
          </Text>
        </View>
        <TextInput
          style={form.textInput}
          placeholder="Email"
          onChangeText={(email) => setEmail(email)}
        />
        <TextInput
          style={form.textInput}
          placeholder="Password"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
        <View style={{ marginBottom: 10 }}></View>
        <Button onPress={() => onSignUp()} title="Sign In" />
      </View>
    </View>
  );
}

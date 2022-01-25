import React, { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
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

  return (
    <View style={container.center}>
      <View style={container.formCenter}>
        <TextInput
          style={form.textInput}
          placeholder="email"
          onChangeText={(email) => setEmail(email)}
        />
        <TextInput
          style={form.textInput}
          placeholder="password"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />

        <Button
          style={form.button}
          onPress={() => onSignUp()}
          title="Sign In"
        />
      </View>

      <View style={form.bottomButton}>
        <Text
          title="Register"
          onPress={() => props.navigation.navigate("Register")}
        >
          Don't have an account? SignUp.
        </Text>
      </View>
    </View>
  );
}

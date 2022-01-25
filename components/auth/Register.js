import React, { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { Snackbar } from "react-native-paper";
import { container, form } from "../styles";
import { firebaseConfig } from "../../firebase_config/firebaseConfig";
import { initializeApp } from "firebase/app";
import {
  doc,
  getFirestore,
  collection,
  query,
  where,
  setDoc,
  getDocs,
} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export default function Register(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isValid, setIsValid] = useState(true);

  const onRegister = async () => {
    if (
      name.length == 0 ||
      username.length == 0 ||
      email.length == 0 ||
      password.length == 0
    ) {
      setIsValid({
        bool: true,
        boolSnack: true,
        message: "Please fill out everything",
      });
      return;
    }
    if (password.length < 6) {
      setIsValid({
        bool: true,
        boolSnack: true,
        message: "passwords must be at least 6 characters",
      });
      return;
    }
    const usersCollectionRef = collection(db, "users");
    const q = query(usersCollectionRef, where("username", "==", username));
    try {
      const snapshot = await getDocs(q);
      if (!snapshot.exist) {
        createUserWithEmailAndPassword(auth, email, password)
          .then(async () => {
            if (snapshot.exist) {
              return;
            }
            await setDoc(doc(db, "users", auth.currentUser.uid), {
              name: name,
              email: email,
              username: username,
              image: "default",
              followingCount: 0,
              followersCount: 0,
            });
          })
          .catch(() => {
            setIsValid({
              bool: true,
              boolSnack: true,
              message: "Something went wrong",
            });
          });
      }
    } catch (err) {
      console.log(err);
      setIsValid({
        bool: true,
        boolSnack: true,
        message: "Something went wrong",
      });
    }
  };

  return (
    <View style={container.center}>
      <View style={container.formCenter}>
        <TextInput
          style={form.textInput}
          placeholder="Username"
          value={username}
          keyboardType="twitter"
          onChangeText={(username) =>
            setUsername(
              username
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "")
                .replace(/[^a-z0-9]/gi, "")
            )
          }
        />
        <TextInput
          style={form.textInput}
          placeholder="name"
          onChangeText={(name) => setName(name)}
        />
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
          onPress={() => onRegister()}
          title="Register"
        />
      </View>

      <View style={form.bottomButton}>
        <Text onPress={() => props.navigation.navigate("Login")}>
          Already have an account? SignIn.
        </Text>
      </View>
      <Snackbar
        visible={isValid.boolSnack}
        duration={2000}
        onDismiss={() => {
          setIsValid({ boolSnack: false });
        }}
      >
        {isValid.message}
      </Snackbar>
    </View>
  );
}

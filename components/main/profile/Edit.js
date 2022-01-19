import { Feather, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Updates from "expo-updates";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Button,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { connect } from "react-redux";
// import { bindActionCreators } from "redux";
// import { updateUserFeedPosts } from "../../../redux/actions/index";
import { container, form, navbar, text, utils } from "../../styles";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../../firebaseConfig";
import { getFirestore, collection, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

function Edit(props) {
  const [name, setName] = useState(props.currentUser.name);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(props.currentUser.image);
  const [imageChanged, setImageChanged] = useState(false);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);

  const onLogout = async () => {
    auth.signOut();
    Updates.reloadAsync();
  };

  useEffect(() => {
    (async () => {
      if (props.currentUser.description !== undefined) {
        setDescription(props.currentUser.description);
      }
    })();
  }, []);

  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <Feather
          style={navbar.image}
          name="check"
          size={24}
          color="green"
          onPress={() => {
            console.log({ name, description });
            Save();
          }}
        />
      ),
    });
  }, [props.navigation, name, description, image, imageChanged]);

  const pickImage = async () => {
    if (true) {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.cancelled) {
        setImage(result.uri);
        setImageChanged(true);
      }
    }
  };

  const Save = async () => {
    if (imageChanged) {
      const uri = image;
      const childPath = `profile/${auth.currentUser.uid}`;
      const storageRef = ref(storage, childPath);
      const response = await fetch(uri);
      const blob = await response.blob();

      const task = uploadBytesResumable(storageRef, blob);
      const taskProgress = (snapshot) => {
        console.log(`transferred: ${snapshot.bytesTransferred}`);
      };

      const taskCompleted = async () => {
        getDownloadURL(task.snapshot.ref).then(async (snapshot) => {
          const usersCollectionRef = collection(db, "users");
          const docRef = doc(usersCollectionRef, auth.currentUser.uid);
          await updateDoc(docRef, {
            name,
            description,
            image: snapshot,
          });
          //  props.updateUserFeedPosts();
          props.navigation.goBack();
        });
      };

      const taskError = (snapshot) => {
        console.log(snapshot);
      };

      task.on("state_changed", taskProgress, taskError, taskCompleted);
    } else {
      saveData({
        name,
        description,
      });
    }
  };

  const saveData = async (data) => {
    const usersCollectionRef = collection(db, "users");
    const docRef = doc(usersCollectionRef, auth.currentUser.uid);
    await updateDoc(docRef, data);
    // props.updateUserFeedPosts();
    props.navigation.goBack();
  };

  return (
    <View style={container.form}>
      <TouchableOpacity
        style={[utils.centerHorizontal, utils.marginBottom]}
        onPress={() => pickImage()}
      >
        {image == "default" ? (
          <FontAwesome5
            style={[utils.profileImageBig, utils.marginBottomSmall]}
            name="user-circle"
            size={80}
            color="black"
          />
        ) : (
          <Image
            style={[utils.profileImageBig, utils.marginBottomSmall]}
            source={{
              uri: image,
            }}
          />
        )}
        <Text style={text.changePhoto}>Change Profile Photo</Text>
      </TouchableOpacity>

      <TextInput
        value={name}
        style={form.textInput}
        placeholder="Name"
        onChangeText={(name) => setName(name)}
      />
      <TextInput
        value={description}
        style={[form.textInput]}
        placeholderTextColor={"#e8e8e8"}
        placeholder="Description"
        onChangeText={(description) => {
          setDescription(description);
        }}
      />
      <Button title="Logout" onPress={() => onLogout()} />
    </View>
  );
}

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
});

// const mapDispatchProps = (dispatch) =>
//   bindActionCreators({ updateUserFeedPosts }, dispatch);

export default connect(mapStateToProps, null)(Edit);

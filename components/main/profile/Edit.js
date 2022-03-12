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
import { ScrollView } from "react-native-gesture-handler";
// import { bindActionCreators } from "redux";
// import { updateUserFeedPosts } from "../../../redux/actions/index";
import { container, form, navbar, text, utils } from "../../styles";
import Icon from "react-native-vector-icons/Ionicons";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../../firebase_config/firebaseConfig";
import { getFirestore, collection, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useTheme } from "react-native-paper";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);
function Edit(props) {
  const [branch, setBranch] = useState("");
  const [summary, setSummary] = useState("");
  const [year_of_study, setYear] = useState("");
  const [sid, setSID] = useState("");
  const [mobile_number, setMobileNumber] = useState("");
  const [academic_proficiency, setAcadProf] = useState("");
  const [org_of_internship, setInternOrg] = useState("");
  const [org_of_placement, setPlacementOrg] = useState("");
  const [technical_skills, setTechnicalSkills] = useState("");
  const [achievements, setAchievements] = useState("");
  const [interests, setInterests] = useState([]);
  const [interest, setInterest] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [eid, setEID] = useState("");
  const [club, setClub] = useState("");
  const [name, setName] = useState(props.currentUser.name);
  const [image, setImage] = useState(props.currentUser.image);
  const [imageChanged, setImageChanged] = useState(false);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const { colors } = useTheme();

  const onLogout = async () => {
    auth.signOut();
    Updates.reloadAsync();
  };

  useEffect(() => {
    (async () => {
      if (props.currentUser.branch !== undefined) {
        setBranch(props.currentUser.branch);
      }
      if (props.currentUser.summary !== undefined) {
        setSummary(props.currentUser.summary);
      }
      if (props.currentUser.year_of_study !== undefined) {
        setYear(props.currentUser.year_of_study);
      }
      if (props.currentUser.sid !== undefined) {
        setSID(props.currentUser.sid);
      }
      if (props.currentUser.mobile_number !== undefined) {
        setMobileNumber(props.currentUser.mobile_number);
      }
      if (props.currentUser.academic_proficiency !== undefined) {
        setAcadProf(props.currentUser.academic_proficiency);
      }
      if (props.currentUser.org_of_internship !== undefined) {
        setInternOrg(props.currentUser.org_of_internship);
      }
      if (props.currentUser.org_of_placement !== undefined) {
        setPlacementOrg(props.currentUser.org_of_placement);
      }
      if (props.currentUser.technical_skills !== undefined) {
        setTechnicalSkills(props.currentUser.technical_skills);
      }
      if (props.currentUser.achievements !== undefined) {
        setAchievements(props.currentUser.achievements);
      }
      if (props.currentUser.interests !== undefined) {
        setInterests(props.currentUser.interests);
      }
      if (props.currentUser.department !== undefined) {
        setDepartment(props.currentUser.department);
      }
      if (props.currentUser.designation !== undefined) {
        setDesignation(props.currentUser.designation);
      }
      if (props.currentUser.eid !== undefined) {
        setEID(props.currentUser.eid);
      }
      if (props.currentUser.club !== undefined) {
        setClub(props.currentUser.club);
      }
    })();
  }, []);

  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <View style={{ marginRight: 10 }}>
          <Icon.Button
            name="ios-log-out"
            size={25}
            backgroundColor="#FFFFFF"
            color={colors.text}
            onPress={() => onLogout()}
          />
        </View>
      ),
    });
  }, [
    props.navigation,
    name,
    branch,
    year_of_study,
    mobile_number,
    sid,
    summary,
    department,
    designation,
    eid,
    club,
    academic_proficiency,
    achievements,
    interest,
    technical_skills,
    org_of_internship,
    org_of_placement,
    image,
    imageChanged,
  ]);

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
          if (props.currentUser.type == "Student") {
            await updateDoc(docRef, {
              name: name,
              branch: branch,
              year_of_study: year_of_study,
              mobile_number: mobile_number,
              sid: sid,
              summary: summary,
              academic_proficiency: academic_proficiency,
              achievements: achievements,
              interests:
                interest !== "" ? [...interests, interest] : [...interests],
              technical_skills: technical_skills,
              org_of_internship: org_of_internship,
              org_of_placement: org_of_placement,
              image: snapshot,
            });
          } else if (props.currentUser.type == "Faculty") {
            await updateDoc(docRef, {
              name: name,
              department: department,
              designation: designation,
              mobile_number: mobile_number,
              eid: eid,
              summary: summary,
              interests:
                interest !== "" ? [...interests, interest] : [...interests],
              technical_skills: technical_skills,
              image: snapshot,
            });
          } else if (props.currentUser.type == "Secretary") {
            await updateDoc(docRef, {
              name: name,
              department: department,
              designation: designation,
              mobile_number: mobile_number,
              sid: sid,
              summary: summary,
              interests:
                interest !== "" ? [...interests, interest] : [...interests],
              technical_club_cultural_club_nss_ncc_sports: club,
              image: snapshot,
            });
          } else if (props.currentUser.type == "Webmaster") {
            await updateDoc(docRef, {
              name: name,
              designation: designation,
              mobile_number: mobile_number,
              eid: eid,
              summary: summary,
              interests:
                interest !== "" ? [...interests, interest] : [...interests],
              image: snapshot,
            });
          }
          //  props.updateUserFeedPosts();
          props.navigation.goBack();
        });
      };

      const taskError = (snapshot) => {
        console.log(snapshot);
      };

      task.on("state_changed", taskProgress, taskError, taskCompleted);
    } else {
      if (props.currentUser.type == "Student") {
        saveData({
          name: name,
          branch: branch,
          year_of_study: year_of_study,
          mobile_number: mobile_number,
          sid: sid,
          summary: summary,
          academic_proficiency: academic_proficiency,
          achievements: achievements,
          interests:
            interest !== "" ? [...interests, interest] : [...interests],
          technical_skills: technical_skills,
          org_of_internship: org_of_internship,
          org_of_placement: org_of_placement,
        });
      } else if (props.currentUser.type == "Faculty") {
        saveData({
          name: name,
          department: department,
          designation: designation,
          mobile_number: mobile_number,
          eid: eid,
          summary: summary,
          interests:
            interest !== "" ? [...interests, interest] : [...interests],
          technical_skills: technical_skills,
        });
      } else if (props.currentUser.type == "Secretary") {
        saveData({
          name: name,
          department: department,
          designation: designation,
          mobile_number: mobile_number,
          sid: sid,
          summary: summary,
          interests:
            interest !== "" ? [...interests, interest] : [...interests],
          technical_club_cultural_club_nss_ncc_sports: club,
        });
      } else if (props.currentUser.type == "Webmaster") {
        saveData({
          name: name,
          designation: designation,
          mobile_number: mobile_number,
          eid: eid,
          summary: summary,
          interests:
            interest !== "" ? [...interests, interest] : [...interests],
        });
      }
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
      {props.currentUser.type == "Student" && (
        <ScrollView>
          <TextInput
            value={name}
            style={form.textInput}
            placeholder="Name"
            placeholderTextColor={"#e8e8e8"}
            onChangeText={(name) => setName(name)}
          />
          <TextInput
            value={branch}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Branch"
            onChangeText={(branch) => {
              setBranch(branch);
            }}
          />
          <TextInput
            value={summary}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="About"
            onChangeText={(about) => {
              setSummary(about);
            }}
          />
          <TextInput
            value={org_of_internship}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Internship Organization"
            onChangeText={(intern) => {
              setInternOrg(intern);
            }}
          />
          <TextInput
            value={org_of_placement}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Placement Organization"
            onChangeText={(place) => {
              setPlacementOrg(place);
            }}
          />
          <TextInput
            value={sid}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Student ID"
            onChangeText={(sid) => {
              setSID(sid);
            }}
          />
          <TextInput
            value={year_of_study}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Year"
            onChangeText={(year) => {
              setYear(year);
            }}
          />
          <TextInput
            value={mobile_number}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Mobile Number"
            onChangeText={(mobile_number) => {
              setMobileNumber(mobile_number);
            }}
          />
          <TextInput
            value={academic_proficiency}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Academic Proficiency"
            onChangeText={(prof) => {
              setAcadProf(prof);
            }}
          />
          <TextInput
            value={achievements}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Achievements"
            onChangeText={(achievements) => {
              setAchievements(achievements);
            }}
          />
          <TextInput
            value={interest}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Add Interest"
            onChangeText={(interest) => {
              setInterest(interest);
            }}
          />
          <TextInput
            value={technical_skills}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Technical Skills"
            onChangeText={(technical_skills) => {
              setTechnicalSkills(technical_skills);
            }}
          />
          <Button title="Apply Changes" onPress={() => Save()} />
        </ScrollView>
      )}
      {props.currentUser.type == "Faculty" && (
        <ScrollView>
          <TextInput
            value={name}
            style={form.textInput}
            placeholder="Name"
            placeholderTextColor={"#e8e8e8"}
            onChangeText={(name) => setName(name)}
          />
          <TextInput
            value={summary}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="About"
            onChangeText={(about) => {
              setSummary(about);
            }}
          />
          <TextInput
            value={department}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Department"
            onChangeText={(depart) => {
              setDepartment(depart);
            }}
          />
          <TextInput
            value={designation}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Designation"
            onChangeText={(place) => {
              setDesignation(place);
            }}
          />
          <TextInput
            value={eid}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Employee ID"
            onChangeText={(eid) => {
              setEID(eid);
            }}
          />
          <TextInput
            value={mobile_number}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Mobile Number"
            onChangeText={(mobile_number) => {
              setMobileNumber(mobile_number);
            }}
          />
          <TextInput
            value={interest}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Add Interest"
            onChangeText={(interest) => {
              setInterest(interest);
            }}
          />
          <TextInput
            value={technical_skills}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Technical Skills"
            onChangeText={(technical_skills) => {
              setTechnicalSkills(technical_skills);
            }}
          />
          <Button title="Apply Changes" onPress={() => Save()} />
        </ScrollView>
      )}
      {props.currentUser.type == "Secretary" && (
        <ScrollView>
          <TextInput
            value={name}
            style={form.textInput}
            placeholder="Name"
            placeholderTextColor={"#e8e8e8"}
            onChangeText={(name) => setName(name)}
          />
          <TextInput
            value={club}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Society/Club/NSS/NCC/Sports"
            onChangeText={(club) => {
              setClub(club);
            }}
          />
          <TextInput
            value={summary}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="About"
            onChangeText={(about) => {
              setSummary(about);
            }}
          />
          <TextInput
            value={department}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Department"
            onChangeText={(depart) => {
              setDepartment(depart);
            }}
          />
          <TextInput
            value={designation}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Designation"
            onChangeText={(place) => {
              setDesignation(place);
            }}
          />
          <TextInput
            value={sid}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Student ID"
            onChangeText={(sid) => {
              setSID(sid);
            }}
          />
          <TextInput
            value={mobile_number}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Mobile Number"
            onChangeText={(mobile_number) => {
              setMobileNumber(mobile_number);
            }}
          />
          <TextInput
            value={interest}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Add Interest"
            onChangeText={(interest) => {
              setInterest(interest);
            }}
          />
          <Button title="Apply Changes" onPress={() => Save()} />
        </ScrollView>
      )}
      {props.currentUser.type == "Webmaster" && (
        <ScrollView>
          <TextInput
            value={name}
            style={form.textInput}
            placeholder="Name"
            placeholderTextColor={"#e8e8e8"}
            onChangeText={(name) => setName(name)}
          />
          <TextInput
            value={summary}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="About"
            onChangeText={(about) => {
              setSummary(about);
            }}
          />
          <TextInput
            value={designation}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Designation"
            onChangeText={(place) => {
              setDesignation(place);
            }}
          />
          <TextInput
            value={eid}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Employee ID"
            onChangeText={(eid) => {
              setEID(eid);
            }}
          />
          <TextInput
            value={mobile_number}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Mobile Number"
            onChangeText={(mobile_number) => {
              setMobileNumber(mobile_number);
            }}
          />
          <TextInput
            value={interest}
            style={[form.textInput]}
            placeholderTextColor={"#e8e8e8"}
            placeholder="Add Interest"
            onChangeText={(interest) => {
              setInterest(interest);
            }}
          />
          <Button title="Apply Changes" onPress={() => Save()} />
        </ScrollView>
      )}
    </View>
  );
}

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
});

// const mapDispatchProps = (dispatch) =>
//   bindActionCreators({ updateUserFeedPosts }, dispatch);

export default connect(mapStateToProps, null)(Edit);

import React, { useContext, useLayoutEffect, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  StyleSheet,
  TextInput,
  FlatList,
  Linking,
  Animated,
  Easing,
  Modal,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStack } from "../../App";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useUserProfile } from "../socket/UseUserProfile";
import { uploadProfileImage } from "../api/UserService";
import { AuthContext } from "../components/AuthProvider";
import { useWebSocket } from "../socket/WebSocketProvider";

type ProfileScreenProp = NativeStackNavigationProp<RootStack, "ProfileScreen">;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenProp>();
  const userProfile = useUserProfile();
  const auth = useContext(AuthContext);
  const { sendMessage } = useWebSocket();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [imageLoading, setImageLoading] = useState(false);

  // Dynamic Editable profile state
  const [profile, setProfile] = useState({
    about: "Hey there! I am using TalkSpot.",
    links: [] as string[],
    image: null as string | null,
  });

  // Load backend profile data into state smoothly
  useEffect(() => {
    if (userProfile) {
      setProfile({
        about: userProfile.about && userProfile.about.trim().length > 0 
          ? userProfile.about 
          : "Hey there! I am using TalkSpot.",
        links: Array.isArray(userProfile.links) ? userProfile.links : [],
        image: userProfile.profileImage ?? null,
      });
    }
  }, [userProfile]);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editField, setEditField] = useState<"about" | "link" | null>(null);
  const [editValue, setEditValue] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "My Profile",
      headerStyle: { backgroundColor: "#7B51D3" },
      headerTintColor: "white",
      headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
    });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.exp),
    }).start();
  }, [navigation]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8, // Slightly reduced quality for fast uploads & instant response
    });

    if (!result.canceled && auth?.userId) {
      const selectedUri = result.assets[0].uri;
      setImageLoading(true);
      setProfile((prev) => ({ ...prev, image: selectedUri }));

      try {
        await uploadProfileImage(String(auth.userId), selectedUri);
      } catch (error) {
        console.error("Image upload failed:", error);
      } finally {
        setImageLoading(false);
      }
    }
  };

  const openEditModal = (field: "about" | "link") => {
    setEditField(field);
    setEditValue(field === "link" ? "" : profile.about);
    setModalVisible(true);
  };

  const saveEdit = () => {
    if (editField === "link" && editValue.trim() !== "") {
      const updatedLinks = [...profile.links, editValue.trim()];
      setProfile((prev) => ({ ...prev, links: updatedLinks }));
      sendMessage({
        type: "update_profile_info",
        about: profile.about,
        links: updatedLinks,
      });
    } else if (editField === "about") {
      const updatedAbout = editValue.trim();
      setProfile((prev) => ({ ...prev, about: updatedAbout }));
      sendMessage({
        type: "update_profile_info",
        about: updatedAbout,
        links: profile.links,
      });
    }

    setModalVisible(false);
    setEditField(null);
    setEditValue("");
  };

  const removeLink = (index: number) => {
    const updatedLinks = profile.links.filter((_, i) => i !== index);
    setProfile((prev) => ({ ...prev, links: updatedLinks }));
    sendMessage({
      type: "update_profile_info",
      about: profile.about,
      links: updatedLinks,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3E8FF" }}>
      <StatusBar barStyle="light-content" backgroundColor="#7B51D3" />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        
        {/* Profile Image Component */}
        <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
          <View style={styles.imageWrapper}>
            {profile.image ? (
              <Image
                key={profile.image} // Fast re-render key
                className="w-36 h-36 rounded-full border-4 border-white"
                source={{ uri: profile.image }}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />
            ) : (
              <View className="w-36 h-36 rounded-full bg-purple-200 justify-center items-center border-4 border-white">
                <Feather name="user" size={60} color="#7B51D3" />
              </View>
            )}

            {imageLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#7B51D3" />
              </View>
            )}
          </View>

          <TouchableOpacity className="my-2 items-center" onPress={pickImage}>
            <Text className="font-bold text-purple-700 text-base">
              Change Profile Photo
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* User Name */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="user" size={20} color="#7B51D3" />
            <Text style={styles.cardTitle}>Name</Text>
          </View>
          <Text style={styles.cardValue}>
            {userProfile?.firstName} {userProfile?.lastName}
          </Text>
        </View>

        {/* Phone Number */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="phone" size={20} color="#7B51D3" />
            <Text style={styles.cardTitle}>Phone</Text>
          </View>
          <Text style={styles.cardValue}>
            {userProfile?.countryCode} {userProfile?.contactNo}
          </Text>
        </View>

        {/* About Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="info" size={20} color="#7B51D3" />
            <Text style={styles.cardTitle}>About</Text>
            <TouchableOpacity onPress={() => openEditModal("about")}>
              <MaterialIcons name="edit" size={20} color="#7B51D3" />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardValue}>{profile.about}</Text>
        </View>

        {/* Links Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="link" size={20} color="#7B51D3" />
            <Text style={styles.cardTitle}>Links</Text>
            <TouchableOpacity onPress={() => openEditModal("link")}>
              <MaterialIcons name="add" size={22} color="#7B51D3" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={profile.links}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.linkRow}>
                <TouchableOpacity onPress={() => Linking.openURL(item)}>
                  <Text style={styles.linkText}>{item}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeLink(index)}>
                  <MaterialIcons name="close" size={18} color="#E53E3E" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ color: "#888", fontStyle: "italic", marginTop: 4 }}>
                No links added yet.
              </Text>
            }
          />
        </View>
      </Animated.View>

      {/* Edit Modal Component */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit {editField === "link" ? "Link" : "About"}
            </Text>
            <TextInput
              style={styles.input}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={editField === "link" ? "https://example.com" : "Enter About text"}
              autoFocus
            />
            <View className="flex-row gap-3 w-full justify-end">
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "#333", fontWeight: "bold" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={saveEdit}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 16, paddingTop: 10 },
  imageWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.6)",
    width: 144,
    height: 144,
    borderRadius: 72,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    width: "100%",
    shadowColor: "#7B51D3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  cardTitle: { fontWeight: "bold", fontSize: 15, color: "#7B51D3", flex: 1, marginLeft: 8 },
  cardValue: { fontSize: 15, color: "#333", marginLeft: 2, marginTop: 2 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  linkText: { color: "#7B51D3", textDecorationLine: "underline", fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: "85%",
  },
  modalTitle: { fontWeight: "bold", fontSize: 17, color: "#7B51D3", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#7B51D3",
    borderRadius: 10,
    padding: 10,
    width: "100%",
    marginBottom: 16,
    fontSize: 15,
  },
  modalBtn: {
    backgroundColor: "#7B51D3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
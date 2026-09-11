import React, { useState, useContext } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CountryPicker, { Country, CountryCode } from "react-native-country-picker-modal";
import * as ImagePicker from "expo-image-picker";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { useUserRegistration } from "../components/UserContext";
import {
  validateFirstName,
  validateLastName,
  validateCountryCode,
  validatePhoneNo,
  validateProfileImage,
} from "../util/Validation";
import { createNewAccount } from "../api/UserService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStack } from "../../App";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { FloatingLabelInput } from "react-native-floating-label-input";
import AntDesign from "@expo/vector-icons/AntDesign";
import { AuthContext } from "../components/AuthProvider";
import * as Animatable from "react-native-animatable";

const { width, height } = Dimensions.get("window");

type SignUpProps = NativeStackNavigationProp<RootStack, "SignUpScreen">;

export default function TalkSpotSignUpScreen() {
  const navigation = useNavigation<SignUpProps>();
  const { userData, setUserData } = useUserRegistration();
  const auth = useContext(AuthContext);

  // Avatar & Image Upload
  const [image, setImage] = useState<string | null>(userData.profileImage || null);
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const avatars = [
    require("../../assets/avatar/avatar_1.png"),
    require("../../assets/avatar/avatar_2.png"),
    require("../../assets/avatar/avatar_3.png"),
    require("../../assets/avatar/avatar_4.png"),
    require("../../assets/avatar/avatar_5.png"),
    require("../../assets/avatar/avatar_6.png"),
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      setUserData((prev) => ({ ...prev, profileImage: uri }));
      setSelectedAvatar(null);
    }
  };

  // Form Fields
  const [firstName, setFirstName] = useState(userData.firstName || "");
  const [lastName, setLastName] = useState(userData.lastName || "");
  const [countryCode, setCountryCode] = useState<CountryCode>("LK");
  const [country, setCountry] = useState<Country | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [callingCode, setCallingCode] = useState("+94");
  const [phoneNo, setPhoneNo] = useState(userData.contactNo || "");
  const [loading, setLoading] = useState(false);
  const [buttonScale, setButtonScale] = useState(1);

  // Create Account Function
  const onCreateAccount = async () => {
    // Validation
    const firstNameError = validateFirstName(firstName);
    const lastNameError = validateLastName(lastName);
    const countryCodeError = validateCountryCode(callingCode);
    const phoneNoError = validatePhoneNo(phoneNo);
    const profileImageError = validateProfileImage(
      image ? { uri: image, type: "", fileSize: 0 } : null
    );

    if (firstNameError || lastNameError || countryCodeError || phoneNoError || profileImageError) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Warning",
        textBody:
          firstNameError ||
          lastNameError ||
          countryCodeError ||
          phoneNoError ||
          "Please select a profile image or avatar.",
      });
      return;
    }

    // Update userData
    const updatedUserData = {
      ...userData,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      countryCode: country ? `+${country.callingCode[0]}` : callingCode,
      contactNo: phoneNo.trim(),
      profileImage: image,
    };
    setUserData(updatedUserData);

    try {
      setLoading(true);
      const response = await createNewAccount(updatedUserData);

      if (response.status) {
        const newUserId = String(response.userId);

        if (auth) {
          // Set the real userId in AuthContext
          await auth.signUp(newUserId);
        }

        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: "Account created successfully! Redirecting to Home...",
        });

        // Wait a bit to ensure AuthContext updates, then navigate
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "HomeScreen" }],
          });
        }, 300); // 300ms is enough
      } else {
        Toast.show({
          type: ALERT_TYPE.WARNING,
          title: "Warning",
          textBody: response.message,
        });
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#9b5de5", "#7a33d8"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: width * 0.05,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo */}
            <Animatable.View
              animation="fadeInDown"
              duration={900}
              style={{ alignItems: "center", marginBottom: height * 0.04 }}
            >
              <Image
                source={require("../../assets/logo-white.png")}
                style={{
                  width: width * 0.45,
                  height: height * 0.15,
                  resizeMode: "contain",
                }}
              />
              <Animatable.Text
                animation="fadeIn"
                delay={400}
                className="text-white font-bold text-xl mt-2"
                style={{ fontSize: width * 0.055 }}
              >
                Welcome to TalkSpot
              </Animatable.Text>
            </Animatable.View>

            {/* Card */}
            <Animatable.View
              animation="fadeInUp"
              duration={900}
              style={{
                width: "100%",
                backgroundColor: "white",
                borderRadius: 28,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 5,
                padding: width * 0.05,
              }}
            >
              {/* Avatar Section */}
              <View style={{ alignItems: "center", marginBottom: height * 0.03 }}>
                <Text className="text-base font-bold text-purple-700 mb-3">
                  Choose Your Profile Picture
                </Text>
                <Pressable
                  style={{
                    height: width * 0.28,
                    width: width * 0.28,
                    borderRadius: width * 0.14,
                    backgroundColor: "#f3e8ff",
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: "#a78bfa",
                    borderStyle: "dashed",
                    marginBottom: 12,
                  }}
                  onPress={pickImage}
                >
                  {image ? (
                    <Animatable.Image
                      animation="bounceIn"
                      source={{ uri: image }}
                      style={{
                        height: width * 0.28,
                        width: width * 0.28,
                        borderRadius: width * 0.14,
                      }}
                    />
                  ) : (
                    <View style={{ alignItems: "center" }}>
                      <Text className="text-2xl font-bold text-purple-400">+</Text>
                      <Text className="text-sm font-semibold text-purple-400">Add Image</Text>
                    </View>
                  )}
                </Pressable>

                <FlatList
                  data={avatars}
                  horizontal
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <Animatable.View
                      animation={selectedAvatar === index ? "pulse" : undefined}
                      duration={600}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          const uri = Image.resolveAssetSource(item).uri;
                          setImage(uri);
                          setUserData((prev) => ({ ...prev, profileImage: uri }));
                          setSelectedAvatar(index);
                        }}
                      >
                        <Image
                          source={item}
                          style={{
                            width: width * 0.14,
                            height: width * 0.14,
                            marginHorizontal: 6,
                            borderWidth: selectedAvatar === index ? 3 : 2,
                            borderColor: selectedAvatar === index ? "#7a33d8" : "#e9d5ff",
                            borderRadius: width * 0.07,
                          }}
                        />
                      </TouchableOpacity>
                    </Animatable.View>
                  )}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 4 }}
                />
              </View>

              {/* Inputs */}
              <View style={{ marginBottom: 18 }}>
                <FloatingLabelInput
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  containerStyles={{
                    borderBottomWidth: 3,
                    borderBottomColor: "#9b5de5",
                    paddingVertical: 4,
                  }}
                  customLabelStyles={{
                    colorBlurred: "#a78bfa",
                    colorFocused: "#9b5de5",
                    fontSizeBlurred: 16,
                    fontSizeFocused: 12,
                    topFocused: -18,
                    leftFocused: 0,
                  }}
                  inputStyles={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#22223b",
                    paddingVertical: 8,
                  }}
                />
              </View>

              <View style={{ marginBottom: 18 }}>
                <FloatingLabelInput
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  containerStyles={{
                    borderBottomWidth: 3,
                    borderBottomColor: "#9b5de5",
                    paddingVertical: 4,
                  }}
                  customLabelStyles={{
                    colorBlurred: "#a78bfa",
                    colorFocused: "#9b5de5",
                    fontSizeBlurred: 16,
                    fontSizeFocused: 12,
                    topFocused: -21,
                    leftFocused: 0,
                  }}
                  inputStyles={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#22223b",
                    paddingVertical: 8,
                  }}
                />
              </View>

              {/* Country Picker & Phone */}
              <View style={{ marginBottom: 20 }}>
                <View
                  className="border-b-2 border-purple-500 flex-row items-center justify-center h-14 mb-3"
                  style={{ gap: 6 }}
                >
                  <Pressable onPress={() => setShowCountryPicker(true)}>
                    <View className="flex-row items-center">
                      <CountryPicker
                        countryCode={countryCode}
                        withFilter
                        withFlag
                        withCallingCode
                        visible={showCountryPicker}
                        onClose={() => setShowCountryPicker(false)}
                        onSelect={(c) => {
                          setCountryCode(c.cca2);
                          setCountry(c);
                          setShowCountryPicker(false);
                          setCallingCode(`+${c.callingCode[0]}`);
                        }}
                      />
                      <AntDesign name="down" size={18} color="#7a33d8" style={{ marginTop: 6 }} />
                    </View>
                  </Pressable>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "center" }}>
                  <TextInput
                    inputMode="tel"
                    editable={false}
                    style={{
                      height: 56,
                      fontWeight: "bold",
                      fontSize: 18,
                      borderTopWidth: 2,
                      borderBottomWidth: 2,
                      borderColor: "#a78bfa",
                      width: "20%",
                      textAlign: "center",
                      borderTopLeftRadius: 12,
                      borderBottomLeftRadius: 12,
                      backgroundColor: "#faf5ff",
                    }}
                    placeholder="+94"
                    value={country ? `+${country.callingCode[0]}` : callingCode}
                    onChangeText={setCallingCode}
                  />
                  <TextInput
                    inputMode="tel"
                    style={{
                      height: 56,
                      fontWeight: "bold",
                      fontSize: 18,
                      borderTopWidth: 2,
                      borderBottomWidth: 2,
                      borderColor: "#a78bfa",
                      width: "75%",
                      paddingHorizontal: 10,
                      borderTopRightRadius: 12,
                      borderBottomRightRadius: 12,
                      marginLeft: 4,
                      backgroundColor: "#faf5ff",
                    }}
                    placeholder="77 #### ###"
                    value={phoneNo}
                    onChangeText={setPhoneNo}
                  />
                </View>
              </View>

              {/* Create Account Button */}
              <Animatable.View
                animation="pulse"
                iterationCount="infinite"
                iterationDelay={3000}
                style={{ width: "100%" }}
              >
                <Pressable
                  disabled={loading}
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: 56,
                    borderRadius: 28,
                    overflow: "hidden",
                  }}
                  onPressIn={() => setButtonScale(0.97)}
                  onPressOut={() => setButtonScale(1)}
                  onPress={onCreateAccount}
                >
                  <Animatable.View
                    animation={loading ? undefined : "bounceIn"}
                    duration={400}
                    style={{
                      transform: [{ scale: buttonScale }],
                      width: "100%",
                      height: 56,
                      borderRadius: 28,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "transparent",
                    }}
                  >
                    <LinearGradient
                      colors={["#9b5de5", "#7a33d8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: "100%",
                        height: 56,
                        borderRadius: 28,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text className="text-lg font-bold text-white">Create Account</Text>
                      )}
                    </LinearGradient>
                  </Animatable.View>
                </Pressable>
                <Pressable
                  style={{ marginTop: 18, alignItems: "center" }}
                  onPress={() => navigation.navigate("SignInScreen")}
                >
                  <Text style={{ color: "#7a33d8", fontWeight: "600" }}>
                    Already have an account? Sign in
                  </Text>
                </Pressable>
              </Animatable.View>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

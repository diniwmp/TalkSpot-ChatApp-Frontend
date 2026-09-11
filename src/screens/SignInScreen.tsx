import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CountryPicker, { Country, CountryCode } from "react-native-country-picker-modal";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { validateCountryCode, validatePhoneNo } from "../util/Validation";
import { signInWithPhone } from "../api/UserService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStack } from "../../App";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from "@expo/vector-icons/AntDesign";
import { AuthContext } from "../components/AuthProvider";

const { width, height } = Dimensions.get("window");

type SignInProps = NativeStackNavigationProp<RootStack, "SignInScreen">;

export default function SignInScreen() {
  const navigation = useNavigation<SignInProps>();
  const auth = useContext(AuthContext);

  const [countryCode, setCountryCode] = useState<CountryCode>("LK");
  const [country, setCountry] = useState<Country | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [callingCode, setCallingCode] = useState("+94");
  const [phoneNo, setPhoneNo] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    const countryCodeError = validateCountryCode(callingCode);
    const phoneNoError = validatePhoneNo(phoneNo);

    if (countryCodeError || phoneNoError) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Warning",
        textBody: countryCodeError || phoneNoError || "Please check your details.",
      });
      return;
    }

    try {
      setLoading(true);
      const finalCountryCode = country ? `+${country.callingCode[0]}` : callingCode;
      const response = await signInWithPhone(finalCountryCode, phoneNo.trim());

      if (response.status) {
        if (auth) {
          await auth.signUp(String(response.userId)); // reuses the same login-state setter as sign up
        }
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Welcome back",
          textBody: `Signed in as ${response.firstName}`,
        });
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
            <View style={{ alignItems: "center", marginBottom: height * 0.04 }}>
              <Image
                source={require("../../assets/logo-white.png")}
                style={{
                  width: width * 0.45,
                  height: height * 0.15,
                  resizeMode: "contain",
                }}
              />
              <Text
                className="text-white font-bold text-xl mt-2"
                style={{ fontSize: width * 0.055 }}
              >
                Welcome back to TalkSpot
              </Text>
            </View>

            {/* Card */}
            <View
              style={{
                width: "100%",
                backgroundColor: "white",
                borderRadius: 28,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 5,
                padding: width * 0.06,
              }}
            >
              {/* Country Picker & Phone */}
              <View style={{ marginBottom: 24 }}>
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

              {/* Sign In Button */}
              <Pressable
                disabled={loading}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  height: 56,
                  borderRadius: 28,
                  overflow: "hidden",
                }}
                onPress={onSignIn}
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
                    <Text className="text-lg font-bold text-white">Sign In</Text>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Go to Sign Up */}
              <Pressable
                style={{ marginTop: 18, alignItems: "center" }}
                onPress={() => navigation.navigate("SignUpScreen")}
              >
                <Text style={{ color: "#7a33d8", fontWeight: "600" }}>
                  New here? Create an account
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

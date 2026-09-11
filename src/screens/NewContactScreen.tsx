
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, Text, TouchableOpacity, View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStack } from "../../App";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect, useState } from "react";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { FloatingLabelInput } from "react-native-floating-label-input";
import CountryPicker, { Country, CountryCode } from "react-native-country-picker-modal";
import { validateCountryCode, validateFirstName, validateLastName, validatePhoneNo } from "../util/Validation";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { useSendNewContact } from "../socket/UseSendNewContact";

type NewContactScreenProp = NativeStackNavigationProp<RootStack, "NewContactScreen">;

export default function NewContactScreen() {
  const navigation = useNavigation<NewContactScreenProp>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>("LK");
  const [country, setCountry] = useState<Country | null>(null);
  const [show, setShow] = useState(false);
  const [callingCode, setCallingCode] = useState("+94");
  const [phoneNo, setPhoneNo] = useState("");

  const newContact = useSendNewContact();
  const sendNewContact = newContact.sendNewContact;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
      headerLeft: () => (
        <View className="flex-row items-center gap-x-2">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-sharp" size={24} color="#7B51D3" />
          </TouchableOpacity>
          <Text className="text-purple-700 font-bold text-lg">New Contact</Text>
        </View>
      ),
    });
  }, [navigation]);

  const sendData = () => {
    sendNewContact({
      id: 0,
      firstName,
      lastName,
      countryCode: callingCode,
      contactNo: phoneNo,
      createdAt: "",
      updatedAt: "",
      status: "",
      about: undefined,
      links: undefined
    });
    setFirstName("");
    setLastName("");
    setCallingCode("+94");
    setPhoneNo("");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="#7B51D3" barStyle="light-content" />
      <View className="flex-1 px-5 pt-6">
        {/* First Name */}
        <View className="flex-row items-center gap-x-3 h-14 mb-4">
          <Feather name="user" size={24} color="#7B51D3" />
          <View className="flex-1 h-14">
            <FloatingLabelInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              customLabelStyles={{
                colorFocused: "#7B51D3",
                colorBlurred: "#A3A3A3",
              }}
              inputStyles={{ color: "#333", fontWeight: "600" }}
              containerStyles={{
                borderWidth: 1,
                borderColor: "#7B51D3",
                borderRadius: 12,
                paddingHorizontal: 10,
                backgroundColor: "#F7F2FF",
              }}
            />
          </View>
        </View>

        {/* Last Name */}
        <View className="flex-row items-center gap-x-3 h-14 mb-4">
          <Feather name="user" size={24} color="#7B51D3" />
          <View className="flex-1 h-14">
            <FloatingLabelInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              customLabelStyles={{
                colorFocused: "#7B51D3",
                colorBlurred: "#A3A3A3",
              }}
              inputStyles={{ color: "#333", fontWeight: "600" }}
              containerStyles={{
                borderWidth: 1,
                borderColor: "#7B51D3",
                borderRadius: 12,
                paddingHorizontal: 10,
                backgroundColor: "#F7F2FF",
              }}
            />
          </View>
        </View>

        {/* Country Picker */}
        <View className="flex-row items-center h-14 mb-4 border-b-2 border-purple-300">
          <CountryPicker
            countryCode={countryCode}
            withFilter
            withFlag
            withCallingCode
            withCountryNameButton
            visible={show}
            onClose={() => setShow(false)}
            onSelect={(c) => {
              setCountryCode(c.cca2);
              setCountry(c);
              setShow(false);
            }}
          />
          <AntDesign name="caret-down" size={18} color="#7B51D3" style={{ marginTop: 5 }} />
        </View>

        {/* Phone Number */}
        <View className="flex-row items-center h-14 gap-x-2 mb-6">
          <Feather name="phone" size={24} color="#7B51D3" />
          <View className="w-28">
            <FloatingLabelInput
              label=""
              editable={false}
              value={country ? `+${country.callingCode}` : callingCode}
              inputStyles={{ color: "#333", fontWeight: "600" }}
              containerStyles={{
                borderWidth: 1,
                borderColor: "#7B51D3",
                borderRadius: 12,
                paddingHorizontal: 10,
                backgroundColor: "#F7F2FF",
              }}
            />
          </View>
          <View className="flex-1">
            <FloatingLabelInput
              label="Phone"
              inputMode="tel"
              value={phoneNo}
              onChangeText={setPhoneNo}
              customLabelStyles={{
                colorFocused: "#7B51D3",
                colorBlurred: "#A3A3A3",
              }}
              inputStyles={{ color: "#333", fontWeight: "600" }}
              containerStyles={{
                borderWidth: 1,
                borderColor: "#7B51D3",
                borderRadius: 12,
                paddingHorizontal: 10,
                backgroundColor: "#F7F2FF",
              }}
            />
          </View>
        </View>

        <Pressable
          className="bg-purple-700 h-14 rounded-full items-center justify-center"
          onPress={() => {
            const firstNameValid = validateFirstName(firstName);
            const lastNameValid = validateLastName(lastName);
            const countryCodeValid = validateCountryCode(callingCode);
            const phoneNoValid = validatePhoneNo(phoneNo);

            if (firstNameValid) {
              Toast.show({ type: ALERT_TYPE.WARNING, title: "Warning", textBody: firstNameValid });
            } else if (lastNameValid) {
              Toast.show({ type: ALERT_TYPE.WARNING, title: "Warning", textBody: lastNameValid });
            } else if (countryCodeValid) {
              Toast.show({ type: ALERT_TYPE.WARNING, title: "Warning", textBody: countryCodeValid });
            } else if (phoneNoValid) {
              Toast.show({ type: ALERT_TYPE.WARNING, title: "Warning", textBody: phoneNoValid });
            } else {
              sendData();
            }
          }}
        >
          <Text className="text-white font-bold text-lg">Save Contact</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

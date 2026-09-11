// src/screens/SplashScreen.tsx
import { Image, StatusBar, Text, View } from "react-native";
import "../../global.css";
import CircleShape from "../components/CircleShape";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStack } from "../../App";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";

type Props = NativeStackNavigationProp<RootStack, "SplashScreen">;

export default function SplashScreen() {
  const navigation = useNavigation<Props>();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const { applied } = useTheme();

  const logo =
    applied === "light"
      ? require("../../assets/logo.png")
      : require("../../assets/lightLogo.png");

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 3000 });
    scale.value = withTiming(1, { duration: 3000 });
    // const timer = setTimeout(() => {
    //   navigation.navigate("SignUpScreen");
    // }, 3000);

    // return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-[#F8F4FF]">
      <StatusBar hidden />

      {/* Purple Gradient Circles */}
      <CircleShape
        width={250}
        height={250}
        borderRadius={999}
        fillColor="#A78BFA"
        topValue={-50}
        leftValue={-80}
      />
      <CircleShape
        width={200}
        height={200}
        borderRadius={999}
        fillColor="#8B5CF6"
        bottomValue={-40}
        rightValue={-70}
      />
      <CircleShape
        width={120}
        height={120}
        borderRadius={999}
        fillColor="#C4B5FD"
        topValue={100}
        rightValue={40}
      />

      {/* Animated Logo */}
      <Animated.View style={animatedStyle} className="z-10">
        <Image source={logo} style={{ height: 180, width: 220 }} />
      </Animated.View>

      {/* Footer Text */}
      <Animated.View className="absolute bottom-20" style={animatedStyle}>
        <View className="justify-center items-center">
          <Text className="text-xs font-bold text-[#6B21A8]">
            POWERED BY: {process.env.EXPO_PUBLIC_APP_OWNER}
          </Text>
          <Text className="text-xs font-bold text-[#6B21A8] mt-1">
            VERSION: {process.env.EXPO_PUBLIC_APP_VERSION}
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ChatsScreen from "./ChatsScreen";
import StatusScreen from "./StatusScreen";
import CallsScreen from "./CallsScreen";
import SettingScreen from "./SettingScreen"; // Import your settings screen
import { Ionicons } from "@expo/vector-icons";

const Tabs = createBottomTabNavigator();

export default function HomeTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, focused }) => {
          let iconName = "chatbubble-ellipses";
          let iconColor = focused ? "#7B51D3" : "#A3A3A3"; // Purple when active
          if (route.name === "Chats") iconName = "chatbubble-ellipses";
          else if (route.name === "Status") iconName = "time";
          else if (route.name === "Calls") iconName = "call";
          else if (route.name === "Settings") iconName = "settings-outline";
          return <Ionicons name={iconName as any} size={28} color={iconColor} />;
        },
        tabBarLabelStyle: { fontSize: 16, fontWeight: "bold" },
        tabBarActiveTintColor: "#7B51D3",
        tabBarInactiveTintColor: "#A3A3A3",
        tabBarStyle: {
          height: 80,
          backgroundColor: "#fff",
          paddingTop: 1,
        },
      })}
    >
      <Tabs.Screen name="Chats" component={ChatsScreen} options={{ headerShown: false }} />
      <Tabs.Screen name="Status" component={StatusScreen} />
      <Tabs.Screen name="Calls" component={CallsScreen} />
      <Tabs.Screen name="Settings" component={SettingScreen} />
    </Tabs.Navigator>
  );
}

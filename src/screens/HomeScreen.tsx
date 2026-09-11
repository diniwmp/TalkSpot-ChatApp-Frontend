import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStack } from "../../App";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContext, useLayoutEffect, useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useChatList } from "../socket/UseChatList";
import { formatChatTime } from "../util/DateFormatter";
import { Chat } from "../socket/chat";
import { AuthContext } from "../components/AuthProvider";

type HomeScreenProps = NativeStackNavigationProp<RootStack, "HomeScreen">;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenProps>();
  const [search, setSearch] = useState("");
  const chatList = useChatList();
  const [isModalVisible, setModalVisible] = useState(false);
  const auth = useContext(AuthContext);
  const { signOut } = useContext(AuthContext)!;

 useLayoutEffect(() => {
  navigation.setOptions({
    title: "TalkSpot",
    headerStyle: { backgroundColor: "#F4EEFB" },
    headerTitleStyle: { fontWeight: "bold", color: "#7B51D3" },
    headerRight: () => (
      <View className="flex-row space-x-4 mr-3">
        {/* Menu / Ellipsis */}
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="#7B51D3" />
        </TouchableOpacity>

        {/* Modal */}
        <Modal
          animationType="fade"
          visible={isModalVisible}
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable
            className="flex-1 bg-transparent"
            onPress={() => setModalVisible(false)}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View
                className="justify-end items-end p-5"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <View className="bg-white rounded-md w-72 p-3">
                  <TouchableOpacity
                    className="h-14 my-2 justify-center items-start border-b-2 border-gray-100"
                    onPress={() => {
                      navigation.navigate("SettingScreen");
                      setModalVisible(false);
                    }}
                  >
                    <Text className="font-bold text-lg text-gray-700">Settings</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="h-14 my-2 justify-center items-start border-b-2 border-gray-100"
                    onPress={() => {
                      navigation.navigate("ProfileScreen");
                      setModalVisible(false);
                    }}
                  >
                    <Text className="font-bold text-lg text-gray-700">My Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="h-14 my-2 justify-center items-start border-b-2 border-gray-100"
                    onPress={async () => {
                      await signOut();
                      setModalVisible(false);
                    }}
                  >
                    <Text className="font-bold text-lg text-gray-700">Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    ),
    contentStyle: { marginBottom: 0 },
  });
}, [navigation, isModalVisible]);


  const filterdChats = [...chatList]
    .filter((chat) => {
      return (
        chat.friendName.toLowerCase().includes(search.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort(
      (a, b) =>
        new Date(b.lastTimeStamp).getTime() -
        new Date(a.lastTimeStamp).getTime()
    );

  const renderItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      className="flex-row items-center py-3 px-3 bg-white rounded-2xl mx-2 my-1 shadow-sm"
      onPress={() => {
        navigation.navigate("SingleChatScreen", {
          chatId: item.friendId,
          friendName: item.friendName,
          lastSeenTime: formatChatTime(item.lastTimeStamp),
          profileImage: item.profileImage
            ? item.profileImage
            : `https://ui-avatars.com/api/?name=${item.friendName.replace(
                " ",
                "+"
              )}&background=random`,
        });
      }}
    >
      <Image
        source={{
          uri: item.profileImage
            ? item.profileImage
            : `https://ui-avatars.com/api/?name=${item.friendName.replace(
                " ",
                "+"
              )}&background=7B51D3&color=fff`,
        }}
        className="h-14 w-14 rounded-full border-2 border-[#C9A8F4]"
      />
      <View className="flex-1 ms-3">
        <View className="flex-row justify-between items-center">
          <Text
            className="font-semibold text-lg text-[#4B1DAE]"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.friendName}
          </Text>
          <Text className="text-xs text-gray-500">
            {formatChatTime(item.lastTimeStamp)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text
            className="text-gray-500 flex-1 text-sm"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View className="bg-[#7B51D3] rounded-full px-2 py-1 ms-2">
              <Text className="font-bold text-xs text-white">
                {item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F4EEFB]">
      <StatusBar backgroundColor="#7B51D3" barStyle="light-content" />
      {/* Search Bar */}
      <View className="items-center flex-row mx-4 bg-white border border-[#E0CCFA] rounded-full px-3 h-12 mt-3 shadow-sm">
        <Ionicons name="search" size={20} color="#7B51D3" />
        <TextInput
          className="flex-1 text-base font-semibold ps-2 text-[#4B1DAE]"
          placeholder="Search chats..."
          placeholderTextColor="#A788E2"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Chat List */}
      <FlatList
        data={filterdChats}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 10 }}
      />

      {/* New Chat Button */}
      <TouchableOpacity
        className="absolute bottom-16 right-6 bg-[#7B51D3] h-16 w-16 rounded-full justify-center items-center shadow-lg"
        onPress={() => navigation.navigate("NewChatScreen")}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}



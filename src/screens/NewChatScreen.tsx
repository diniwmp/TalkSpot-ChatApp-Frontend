
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useLayoutEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStack } from "../../App";
import { useNavigation } from "@react-navigation/native";
import {
  FlatList,
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { User } from "../socket/chat";
import { useUserList } from "../socket/UseUserList";

type NewChatScreenProp = NativeStackNavigationProp<RootStack, "NewChatScreen">;

export default function NewChatScreen() {
  const navigation = useNavigation<NewChatScreenProp>();
  const [search, setSearch] = useState("");
  const users = useUserList();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
      headerLeft: () => (
        <View className="items-center flex-row gap-x-2">
          <TouchableOpacity
            className="justify-center items-center"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back-sharp" size={24} color="#7B51D3" />
          </TouchableOpacity>
          <View className="flex-col">
            <Text className="text-lg font-bold text-gray-700">Select Contact</Text>
            <Text className="text-sm font-medium text-gray-500">
              {users.length} contacts
            </Text>
          </View>
        </View>
      ),
      headerRight: () => <View></View>,
    });
  }, [navigation, users]);

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      className="justify-start items-center gap-x-3 px-3 py-3 flex-row bg-white mt-1 rounded-xl shadow-sm"
      onPress={() => {
        navigation.replace("SingleChatScreen", {
          chatId: item.id,
          friendName: `${item.firstName} ${item.lastName}`,
          lastSeenTime: item.updatedAt,
          profileImage: item.profileImage
            ? item.profileImage
            : `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}&background=random`,
        });
      }}
    >
      <View>
        <TouchableOpacity className="h-14 w-14 rounded-full border border-gray-300 justify-center items-center">
          <Image
            source={{
              uri: item.profileImage
                ? item.profileImage
                : `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}&background=random`,
            }}
            className="h-14 w-14 rounded-full"
          />
        </TouchableOpacity>
      </View>
      <View className="flex-col gap-y-1 flex-1">
        <Text className="font-bold text-lg text-gray-700">
          {item.firstName} {item.lastName}
        </Text>
        <Text className="text-sm italic text-gray-500">
          {item.status === "ACTIVE"
            ? "Already in Friend List; Message Now"
            : "Hey there! I am using TalkSpot"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const filterdUsers = [...users]
    .filter((user) => {
      return (
        user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        user.contactNo.includes(search)
      );
    })
    .sort((a, b) => a.firstName.localeCompare(b.firstName));

  return (
    <SafeAreaView className="flex-1 bg-[#F1EAFE]">
      <StatusBar hidden={false} translucent={true} />
      <View className="flex-1">
        {/* Search Bar */}
        <View className="items-center flex-row mx-3 mt-3 bg-white px-3 h-14 rounded-full shadow-sm">
          <Ionicons name="search" size={20} color="#7B51D3" />
          <TextInput
            className="flex-1 text-lg font-medium ps-2 text-gray-700"
            placeholder="Search"
            placeholderTextColor="#A3A3A3"
            value={search}
            onChangeText={(text) => setSearch(text)}
          />
        </View>

        {/* New Contact Button */}
        <View className="px-3 my-3 border-b border-purple-300 pb-2">
          <TouchableOpacity
            className="justify-start gap-x-3 flex-row items-center h-14"
            onPress={() => navigation.navigate("NewContactScreen")}
          >
            <View className="bg-[#7B51D3] items-center justify-center w-12 h-12 rounded-full">
              <Feather name="user-plus" size={24} color="white" />
            </View>
            <Text className="text-lg font-bold text-gray-700">New Contact</Text>
          </TouchableOpacity>
        </View>

        {/* User List */}
        <View className="mt-2 flex-1">
          <FlatList
            data={filterdUsers}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

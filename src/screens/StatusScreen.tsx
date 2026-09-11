import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useWebSocket } from "../socket/WebSocketProvider";

interface StatusItem {
  id: string;
  name: string;
  image: string;
  time: string;
}

export default function StatusScreen() {
  const { sendMessage, lastMessage } = useWebSocket();
  const [modalVisible, setModalVisible] = useState(false);
  const [viewStatusModal, setViewStatusModal] = useState(false);
  const [activeViewImage, setActiveViewImage] = useState<string | null>(null);

  const [myStatus, setMyStatus] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<StatusItem[]>([]);

  useEffect(() => {
    sendMessage({ type: "get_statuses" });
  }, []);

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.type === "statuses_data" && data.payload) {
          // Update My Status
          if (data.payload.myStatus) {
            setMyStatus(data.payload.myStatus.image);
          } else {
            setMyStatus(null);
          }

          // Update Friends Statuses
          if (Array.isArray(data.payload.friendStatuses)) {
            setStatuses(data.payload.friendStatuses);
          }
        }
      } catch (e) {
        console.error("Error parsing status message:", e);
      }
    }
  }, [lastMessage]);

  // Pick Image Function
  const pickStatusImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setModalVisible(false);

      sendMessage({
        type: "upload_status",
        mediaUrl: selectedUri,
      });
    }
  };

  const handleViewStatus = (imageUri: string) => {
    setActiveViewImage(imageUri);
    setViewStatusModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-purple-50">
      {/* Header */}
      <View className="px-5 py-3 flex-row items-center justify-between">
        <Text className="text-2xl font-extrabold text-purple-700">Status</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={30} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      {/* My Status Section */}
      <TouchableOpacity
        className="flex-row items-center p-3 bg-white mx-3 rounded-2xl shadow-sm"
        onPress={() => {
          if (myStatus) {
            handleViewStatus(myStatus);
          } else {
            setModalVisible(true);
          }
        }}
      >
        <View className="relative">
          {myStatus ? (
            <Image
              source={{ uri: myStatus }}
              className="w-16 h-16 rounded-full border-2 border-purple-500"
            />
          ) : (
            <View className="w-16 h-16 rounded-full bg-purple-200 justify-center items-center border-2 border-purple-300">
              <Ionicons name="person-outline" size={32} color="#7C3AED" />
            </View>
          )}

          <TouchableOpacity
            className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-1"
            onPress={(e) => {
              e.stopPropagation();
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={16} color="white" />
          </TouchableOpacity>
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-lg font-bold text-purple-800">My Status</Text>
          <Text className="text-sm text-gray-500">
            {myStatus ? "Tap to view your update" : "Tap '+' to add a status update"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Recent Updates Section */}
      <Text className="text-base text-gray-600 font-semibold mt-5 mb-2 px-5">
        Recent Updates
      </Text>

      {statuses.length === 0 ? (
        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="images-outline" size={48} color="#A78BFA" />
          <Text className="text-gray-500 mt-2 text-center font-medium">
            No status updates available.
          </Text>
        </View>
      ) : (
        <FlatList
          data={statuses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center p-3 bg-white mx-3 mb-3 rounded-2xl shadow-sm"
              onPress={() => handleViewStatus(item.image)}
            >
              <Image
                source={{ uri: item.image }}
                className="w-16 h-16 rounded-full border-2 border-purple-400"
              />
              <View className="ml-3">
                <Text className="text-lg font-semibold text-purple-700">
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-500">{item.time}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Add Status Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center">
          <View className="bg-white p-6 rounded-2xl w-80">
            <Text className="text-xl font-bold text-purple-700 mb-3 text-center">
              Add New Status
            </Text>
            <TouchableOpacity
              onPress={pickStatusImage}
              className="bg-purple-600 p-3 rounded-xl mb-3"
            >
              <Text className="text-center text-white font-semibold">
                Upload Image / Video
              </Text>
            </TouchableOpacity>
            <Pressable
              onPress={() => setModalVisible(false)}
              className="bg-gray-200 p-3 rounded-xl"
            >
              <Text className="text-center text-gray-700 font-semibold">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Full Screen View Modal */}
      <Modal
        visible={viewStatusModal}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setViewStatusModal(false)}
      >
        <View className="flex-1 bg-black justify-center items-center relative">
          <TouchableOpacity
            className="absolute top-12 right-6 z-10 p-2 bg-black/50 rounded-full"
            onPress={() => setViewStatusModal(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          {activeViewImage && (
            <Image
              source={{ uri: activeViewImage }}
              className="w-full h-5/6 resize-mode-contain"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
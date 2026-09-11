import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStack } from "../../App";
import { useLayoutEffect, useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSingleChat } from "../socket/UseSingleChat";
import { Chat } from "../socket/chat";
import { formatChatTime } from "../util/DateFormatter";
import { useSendChat } from "../socket/UseSendChat";
import { useWebSocket } from "../socket/WebSocketProvider";

type SingleChatScreenProps = NativeStackScreenProps<
  RootStack,
  "SingleChatScreen"
>;

export default function SingleChatScreen({
  route,
  navigation,
}: SingleChatScreenProps) {
  const { chatId, friendName, lastSeenTime, profileImage } = route.params;

  const singleChat = useSingleChat(chatId);
  const initialMessages = singleChat.messages;
  const friend = singleChat.friend;

  const [messagesList, setMessagesList] = useState<Chat[]>([]);
  const sendMessage = useSendChat();
  const { sendMessage: sendWsMessage, lastMessage } = useWebSocket();

  const [input, setInput] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [callingModal, setCallingModal] = useState(false);
  const [activeCallType, setActiveCallType] = useState<"VOICE" | "VIDEO">("VOICE");

  // Selected message state for deletion
  const [selectedMessage, setSelectedMessage] = useState<Chat | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    setMessagesList(initialMessages);
  }, [initialMessages]);

  // Listen for WebSocket Message Deletion Signal
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);

        if (data.type === "call_response_signal") {
          setCallingModal(false);
        }

        // Real-time Message Removal Handling
        if (data.type === "message_deleted_signal") {
          const deletedId = data.messageId;
          setMessagesList((prevList) =>
            prevList.filter((m) => m.id !== deletedId)
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [lastMessage]);

  const startCall = (callType: "VOICE" | "VIDEO") => {
    setMenuVisible(false);
    setActiveCallType(callType);
    setCallingModal(true);

    sendWsMessage({
      type: "initiate_call",
      toUserId: chatId,
      callerName: friend ? `${friend.firstName} ${friend.lastName}` : friendName,
      callType: callType,
    });
  };

  const cancelCall = () => {
    setCallingModal(false);
    sendWsMessage({
      type: "call_response",
      toUserId: chatId,
      action: "MISSED",
      channelName: "talkspot_cancelled",
      callType: activeCallType,
    });
  };

  // Delete for Everyone Handler
  const handleDeleteForEveryone = () => {
    if (selectedMessage) {
      sendWsMessage({
        type: "delete_message_everyone",
        messageId: selectedMessage.id,
        friendId: chatId,
      });
    }
    setDeleteModalVisible(false);
    setSelectedMessage(null);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
      headerStyle: { backgroundColor: "#F4F0FF" },
      headerLeft: () => (
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-sharp" size={24} color="#7A33D8" />
          </TouchableOpacity>
          <Image
            source={{ uri: profileImage }}
            className="h-14 w-14 rounded-full border-2 border-purple-500"
          />
          <View className="space-y-1">
            <Text className="font-bold text-lg text-gray-900">
              {friend ? friend.firstName + " " + friend.lastName : friendName}
            </Text>
            <Text className="text-xs text-purple-700 italic">
              {friend?.status === "ONLINE"
                ? "Online"
                : `Last seen ${formatChatTime(friend?.updatedAt ?? lastSeenTime)}`}
            </Text>
          </View>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity
          className="me-3"
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#7A33D8" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, friend, profileImage, friendName, lastSeenTime]);

  const renderItem = ({ item }: { item: Chat }) => {
    const isMe = item.from.id !== chatId;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => {
          if (isMe) {
            setSelectedMessage(item);
            setDeleteModalVisible(true);
          }
        }}
        className={`my-1 px-4 py-2 max-w-[75%] ${
          isMe
            ? "self-end bg-purple-600 rounded-tl-xl rounded-bl-xl rounded-br-xl"
            : "self-start bg-gray-200 rounded-tr-xl rounded-bl-xl rounded-br-xl"
        }`}
      >
        <Text className={`${isMe ? "text-white" : "text-gray-800"} text-base`}>
          {item.message}
        </Text>
        <View className="flex-row justify-end items-center mt-1">
          <Text
            className={`${
              isMe ? "text-white/80" : "text-gray-500"
            } text-xs me-2 italic`}
          >
            {formatChatTime(item.createdAt)}
          </Text>
          {isMe && (
            <Ionicons
              name={
                item.status === "READ"
                  ? "checkmark-done-sharp"
                  : item.status === "DELIVERED"
                  ? "checkmark-done-sharp"
                  : "checkmark"
              }
              size={18}
              color={item.status === "READ" ? "#3B82F6" : "#9ca3af"}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleSendChat = () => {
    if (!input.trim()) return;
    sendMessage(chatId, input);
    setInput("");
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F4F0FF]"
      edges={["top", "right", "left"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F4F0FF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? 73 : 100}
        className="flex-1"
      >
        <FlatList
          data={messagesList}
          renderItem={renderItem}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
          inverted
        />

        <View className="flex-row items-end p-3 bg-white border-t border-gray-200">
          <TextInput
            value={input}
            onChangeText={setInput}
            multiline
            placeholder="Type a message"
            className="flex-1 min-h-14 max-h-32 px-5 py-3 bg-gray-100 rounded-full text-base"
          />
          <TouchableOpacity
            className="bg-purple-600 w-14 h-14 justify-center items-center rounded-full ms-2 shadow-lg"
            onPress={handleSendChat}
          >
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Dropdown Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.15)" }}
          onPress={() => setMenuVisible(false)}
        >
          <View className="absolute top-12 right-4 bg-white rounded-2xl shadow-xl w-48 overflow-hidden py-1 border border-purple-100">
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 active:bg-purple-50"
              onPress={() => startCall("VOICE")}
            >
              <Ionicons name="call-outline" size={20} color="#7A33D8" />
              <Text className="ms-3 text-base font-semibold text-gray-800">
                Voice Call
              </Text>
            </TouchableOpacity>

            <View className="h-[1px] bg-gray-100 mx-2" />

            <TouchableOpacity
              className="flex-row items-center px-4 py-3 active:bg-purple-50"
              onPress={() => startCall("VIDEO")}
            >
              <Ionicons name="videocam-outline" size={20} color="#7A33D8" />
              <Text className="ms-3 text-base font-semibold text-gray-800">
                Video Call
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* 🗑️ Delete for Everyone Modal Only */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" }}
          onPress={() => setDeleteModalVisible(false)}
        >
          <View className="bg-white rounded-t-3xl p-6 shadow-2xl">
            <Text className="text-lg font-bold text-gray-800 mb-4 text-center">
              Delete Message
            </Text>

            <TouchableOpacity
              onPress={handleDeleteForEveryone}
              className="flex-row items-center py-3.5 px-4 bg-red-50 rounded-2xl mb-3"
            >
              <Ionicons name="trash" size={22} color="#E53E3E" />
              <Text className="ms-3 text-base font-bold text-red-600">
                Delete for Everyone
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDeleteModalVisible(false)}
              className="py-3 items-center"
            >
              <Text className="text-gray-500 font-semibold text-base">Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Outgoing Call Modal */}
      <Modal visible={callingModal} transparent animationType="fade">
        <View className="flex-1 bg-purple-950 justify-between items-center py-20">
          <View className="items-center mt-12">
            <Image
              source={{ uri: profileImage }}
              className="w-32 h-32 rounded-full border-4 border-purple-400 mb-4"
            />
            <Text className="text-white text-2xl font-bold">
              {friend ? `${friend.firstName} ${friend.lastName}` : friendName}
            </Text>
            <Text className="text-purple-300 mt-2 text-base font-medium animate-pulse">
              Ringing...
            </Text>
          </View>

          <TouchableOpacity
            onPress={cancelCall}
            className="w-16 h-16 bg-red-600 rounded-full justify-center items-center shadow-lg"
          >
            <Ionicons name="close" size={36} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
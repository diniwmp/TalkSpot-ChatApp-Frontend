import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useWebSocket } from "../socket/WebSocketProvider";

interface CallLogItem {
  id: number;
  callerId: number;
  receiverId: number;
  name: string;
  type: "VOICE" | "VIDEO";
  status: "MISSED" | "ACCEPTED" | "REJECTED";
  isOutgoing: boolean;
  time: string;
  profileImage?: string;
}

export default function CallsScreen() {
  const { sendMessage, lastMessage } = useWebSocket();
  const [callLogs, setCallLogs] = useState<CallLogItem[]>([]);

  // Incoming Call State
  const [incomingCall, setIncomingCall] = useState<{
    fromUserId: number;
    callerName: string;
    callType: "VOICE" | "VIDEO";
    channelName: string;
  } | null>(null);

  // Outgoing Calling Overlay State
  const [callingModal, setCallingModal] = useState<boolean>(false);
  const [activeCallType, setActiveCallType] = useState<"VOICE" | "VIDEO">("VOICE");
  const [targetName, setTargetName] = useState<string>("");
  const [targetImage, setTargetImage] = useState<string | undefined>(undefined);
  const [targetUserId, setTargetUserId] = useState<number | null>(null);
  const [activeCall, setActiveCall] = useState<boolean>(false);

  // Fetch Call Logs on Open
  useEffect(() => {
    sendMessage({ type: "get_call_logs" });
  }, []);

  // Handle Real-time WebSocket Signals
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);

        // Update Call Logs
        if (data.type === "call_logs" && Array.isArray(data.payload)) {
          setCallLogs(data.payload);
        }

        // Incoming Call Popup
        if (data.type === "incoming_call_signal") {
          setIncomingCall({
            fromUserId: data.fromUserId,
            callerName: data.callerName,
            callType: data.callType,
            channelName: data.channelName,
          });
        }

        // Call Response (Accepted/Rejected/Missed)
        if (data.type === "call_response_signal") {
          setCallingModal(false);
          if (data.action === "ACCEPTED") {
            setActiveCall(true);
          } else {
            setActiveCall(false);
            setIncomingCall(null);
            sendMessage({ type: "get_call_logs" });
          }
        }
      } catch (e) {
        console.error("Signal Error:", e);
      }
    }
  }, [lastMessage]);

  const startDirectCall = (item: CallLogItem) => {
    const destinationUserId = item.isOutgoing ? item.receiverId : item.callerId;
    
    if (!destinationUserId) {
      console.warn("User ID missing for call log");
      return;
    }

    setTargetUserId(destinationUserId);
    setActiveCallType(item.type);
    setTargetName(item.name);
    setTargetImage(item.profileImage);
    setCallingModal(true); 

    sendMessage({
      type: "initiate_call",
      toUserId: destinationUserId,
      callerName: "TalkSpot User",
      callType: item.type,
    });
  };

  const cancelOutgoingCall = () => {
    setCallingModal(false);
    if (targetUserId) {
      sendMessage({
        type: "call_response",
        toUserId: targetUserId,
        action: "MISSED",
        channelName: "talkspot_cancelled",
        callType: activeCallType,
      });
    }
    sendMessage({ type: "get_call_logs" });
  };

  // Answer Incoming Call
  const acceptCall = () => {
    if (incomingCall) {
      sendMessage({
        type: "call_response",
        toUserId: incomingCall.fromUserId,
        action: "ACCEPTED",
        channelName: incomingCall.channelName,
        callType: incomingCall.callType,
      });
      setActiveCall(true);
    }
  };

  const rejectCall = (action: "ACCEPTED" | "REJECTED" | "MISSED" = "REJECTED") => {
    if (incomingCall) {
      sendMessage({
        type: "call_response",
        toUserId: incomingCall.fromUserId,
        action: action,
        channelName: incomingCall.channelName,
        callType: incomingCall.callType,
      });
    }
    setIncomingCall(null);
    setActiveCall(false);
  };

  const handleClearAllHistory = () => {
    Alert.alert(
      "Clear Call History",
      "Are you sure you want to delete all call logs permanently?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            sendMessage({ type: "clear_all_call_logs" });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-purple-50">
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between bg-white shadow-sm">
        <Text className="text-2xl font-extrabold text-purple-700">Calls</Text>
        
        {callLogs.length > 0 && (
          <TouchableOpacity
            onPress={handleClearAllHistory}
            className="bg-purple-100 p-2.5 rounded-full"
          >
            <Ionicons name="trash-outline" size={22} color="#7C3AED" />
          </TouchableOpacity>
        )}
      </View>

      {/* Call History List */}
      {callLogs.length === 0 ? (
        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="call-outline" size={50} color="#A78BFA" />
          <Text className="text-gray-500 mt-2 font-medium">
            No call history available.
          </Text>
        </View>
      ) : (
        <FlatList
          data={callLogs}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          renderItem={({ item }) => (
            <View className="flex-row items-center p-3 bg-white mx-3 my-1.5 rounded-2xl shadow-sm justify-between">
              <View className="flex-row items-center flex-1">
                <Image
                  source={
                    item.profileImage
                      ? { uri: item.profileImage }
                      : require("../../assets/defaultProfile.jpg")
                  }
                  className="w-14 h-14 rounded-full border-2 border-purple-300"
                />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-bold text-gray-800">
                    {item.name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    {item.status === "MISSED" || item.status === "REJECTED" ? (
                      <Feather name="arrow-down-left" size={16} color="#E53E3E" />
                    ) : item.isOutgoing ? (
                      <Feather name="arrow-up-right" size={16} color="#3182CE" />
                    ) : (
                      <Feather name="arrow-down-left" size={16} color="#38A169" />
                    )}
                    <Text
                      className={`text-xs ml-1 font-semibold ${
                        item.status === "MISSED" || item.status === "REJECTED"
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {item.status === "MISSED"
                        ? "Missed Call"
                        : item.status === "REJECTED"
                        ? "Declined Call"
                        : item.time}
                    </Text>
                  </View>
                </View>
              </View>

              {}
              <TouchableOpacity
                className="p-2.5 bg-purple-100 rounded-full ml-2"
                onPress={() => startDirectCall(item)}
              >
                <Ionicons
                  name={item.type === "VIDEO" ? "videocam" : "call"}
                  size={20}
                  color="#7C3AED"
                />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal visible={callingModal} transparent animationType="fade">
        <View className="flex-1 bg-purple-950 justify-between items-center py-20">
          <View className="items-center mt-12">
            <Image
              source={
                targetImage
                  ? { uri: targetImage }
                  : require("../../assets/defaultProfile.jpg")
              }
              className="w-32 h-32 rounded-full border-4 border-purple-400 mb-4"
            />
            <Text className="text-white text-2xl font-bold">{targetName}</Text>
            <Text className="text-purple-300 mt-2 text-base font-medium animate-pulse">
              Ringing...
            </Text>
          </View>

          <TouchableOpacity
            onPress={cancelOutgoingCall}
            className="w-16 h-16 bg-red-600 rounded-full justify-center items-center shadow-lg"
          >
            <Ionicons name="close" size={36} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={incomingCall !== null} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-center items-center p-5">
          <View className="bg-white rounded-3xl p-6 w-80 items-center shadow-xl">
            <View className="w-24 h-24 rounded-full bg-purple-100 justify-center items-center mb-4">
              <Ionicons name="person" size={50} color="#7C3AED" />
            </View>
            <Text className="text-xl font-bold text-gray-800 mb-1">
              {incomingCall?.callerName}
            </Text>
            <Text className="text-gray-500 text-sm mb-6">
              Incoming {incomingCall?.callType === "VIDEO" ? "Video" : "Voice"} Call...
            </Text>

            <View className="flex-row gap-8">
              <TouchableOpacity
                onPress={() => rejectCall("REJECTED")}
                className="w-16 h-16 bg-red-500 rounded-full justify-center items-center"
              >
                <Ionicons name="close" size={32} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={acceptCall}
                className="w-16 h-16 bg-green-500 rounded-full justify-center items-center"
              >
                <Ionicons name="call" size={28} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={activeCall} transparent={false} animationType="fade">
        <View className="flex-1 bg-purple-900 justify-between items-center py-16">
          <View className="items-center mt-10">
            <Text className="text-white text-2xl font-bold">
              {incomingCall?.callerName ?? targetName ?? "In Call"}
            </Text>
            <Text className="text-purple-200 mt-2">Connected</Text>
          </View>

          <View className="flex-row gap-6 mb-10">
            <TouchableOpacity className="p-4 bg-purple-700 rounded-full">
              <Ionicons name="mic-off" size={26} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => rejectCall("ACCEPTED")}
              className="p-4 bg-red-600 rounded-full"
            >
              <Ionicons
                name="call"
                size={32}
                color="white"
                style={{ transform: [{ rotate: "135deg" }] }}
              />
            </TouchableOpacity>

            <TouchableOpacity className="p-4 bg-purple-700 rounded-full">
              <Ionicons name="volume-high" size={26} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
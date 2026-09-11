import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  // Interactive Local States for UI Toggles
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isAppLockEnabled, setIsAppLockEnabled] = useState(false);
  const [lowDataUsage, setLowDataUsage] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out from TalkSpot?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => {} },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-purple-50">
      {/* Header */}
      <View className="px-5 py-4 bg-white shadow-sm flex-row items-center justify-between">
        <Text className="text-2xl font-extrabold text-purple-700">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 py-4">
        {/* Account & Security Section */}
        <Text className="text-xs font-bold text-purple-800 uppercase px-2 mb-2 tracking-wider">
          Account & Security
        </Text>
        <View className="bg-white rounded-2xl p-2 shadow-sm border border-purple-100 mb-5">
          <TouchableOpacity className="flex-row items-center justify-between p-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center">
                <Ionicons name="key-outline" size={20} color="#7C3AED" />
              </View>
              <Text className="ml-3 text-base font-semibold text-gray-800">
                Account & Privacy
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C4B5FD" />
          </TouchableOpacity>

          <View className="h-[1px] bg-purple-50 mx-3" />

          {/* App Lock Switch */}
          <View className="flex-row items-center justify-between p-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center">
                <Ionicons name="finger-print-outline" size={20} color="#7C3AED" />
              </View>
              <Text className="ml-3 text-base font-semibold text-gray-800">
                Biometric App Lock
              </Text>
            </View>
            <Switch
              value={isAppLockEnabled}
              onValueChange={setIsAppLockEnabled}
              trackColor={{ false: "#E9D5FF", true: "#C084FC" }}
              thumbColor={isAppLockEnabled ? "#7C3AED" : "#F3E8FF"}
            />
          </View>

          <View className="h-[1px] bg-purple-50 mx-3" />

          <TouchableOpacity className="flex-row items-center justify-between p-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center">
                <Ionicons name="shield-checkmark-outline" size={20} color="#7C3AED" />
              </View>
              <Text className="ml-3 text-base font-semibold text-gray-800">
                Two-Step Verification
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C4B5FD" />
          </TouchableOpacity>
        </View>

        {/* Chats & Display Section */}
        <Text className="text-xs font-bold text-purple-800 uppercase px-2 mb-2 tracking-wider">
          Chats & Preferences
        </Text>
        <View className="bg-white rounded-2xl p-2 shadow-sm border border-purple-100 mb-5">
          {/* Dark Mode Switch */}
          <View className="flex-row items-center justify-between p-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center">
                <Ionicons name="moon-outline" size={20} color="#7C3AED" />
              </View>
              <Text className="ml-3 text-base font-semibold text-gray-800">
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: "#E9D5FF", true: "#C084FC" }}
              thumbColor={isDarkMode ? "#7C3AED" : "#F3E8FF"}
            />
          </View>

          <View className="h-[1px] bg-purple-50 mx-3" />

          <TouchableOpacity className="flex-row items-center justify-between p-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center">
                <Ionicons name="image-outline" size={20} color="#7C3AED" />
              </View>
              <Text className="ml-3 text-base font-semibold text-gray-800">
                Chat Wallpaper
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C4B5FD" />
          </TouchableOpacity>

          <View className="h-[1px] bg-purple-50 mx-3" />

          {/* Notifications Switch */}
          <View className="flex-row items-center justify-between p-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center">
                <Ionicons name="notifications-outline" size={20} color="#7C3AED" />
              </View>
              <Text className="ml-3 text-base font-semibold text-gray-800">
                Notifications
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#E9D5FF", true: "#C084FC" }}
              thumbColor={notificationsEnabled ? "#7C3AED" : "#F3E8FF"}
            />
          </View>
        </View>

        {/* Calls & Data Section */}
        <Text className="text-xs font-bold text-purple-800 uppercase px-2 mb-2 tracking-wider">
          Calls & Storage
        </Text>
        <View className="bg-white rounded-2xl p-2 shadow-sm border border-purple-100 mb-5">
          <View className="flex-row items-center justify-between p-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center">
                <Ionicons name="call-outline" size={20} color="#7C3AED" />
              </View>
              <View className="ml-3">
                <Text className="text-base font-semibold text-gray-800">
                  Use Less Data for Calls
                </Text>
                <Text className="text-xs text-gray-400">
                  Optimize Agora call data
                </Text>
              </View>
            </View>
            <Switch
              value={lowDataUsage}
              onValueChange={setLowDataUsage}
              trackColor={{ false: "#E9D5FF", true: "#C084FC" }}
              thumbColor={lowDataUsage ? "#7C3AED" : "#F3E8FF"}
            />
          </View>

          <View className="h-[1px] bg-purple-50 mx-3" />

          <TouchableOpacity className="flex-row items-center justify-between p-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center">
                <Ionicons name="folder-open-outline" size={20} color="#7C3AED" />
              </View>
              <Text className="ml-3 text-base font-semibold text-gray-800">
                Storage & Cache
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C4B5FD" />
          </TouchableOpacity>
        </View>

        {/* Help & Logout */}
        <View className="bg-white rounded-2xl p-2 shadow-sm border border-purple-100 mb-8">
          <TouchableOpacity className="flex-row items-center justify-between p-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center">
                <Ionicons name="help-circle-outline" size={20} color="#7C3AED" />
              </View>
              <Text className="ml-3 text-base font-semibold text-gray-800">
                Help & Support
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C4B5FD" />
          </TouchableOpacity>

          <View className="h-[1px] bg-purple-50 mx-3" />

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-between p-3"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-red-100 items-center justify-center">
                <Ionicons name="log-out-outline" size={20} color="#E53E3E" />
              </View>
              <Text className="ml-3 text-base font-bold text-red-600">
                Log Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Version Info */}
        <View className="items-center mb-10">
          <Text className="text-xs font-extrabold text-purple-400 tracking-widest uppercase">
            TalkSpot
          </Text>
          <Text className="text-xs text-gray-400 mt-0.5">Version 1.0.0 </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
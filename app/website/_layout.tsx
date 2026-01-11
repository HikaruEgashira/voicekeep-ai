import "@/global.css";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ScrollView, Platform } from "react-native";

export default function WebsiteLayout() {
  // ウェブサイトはモバイルアプリのプロバイダーなしで動作
  if (Platform.OS === "web") {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: "#FFFFFF" }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Slot />
        <StatusBar style="dark" />
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      <StatusBar style="auto" />
    </View>
  );
}

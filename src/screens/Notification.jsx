import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const notifications = [
  {
    id: "1",
    icon: "☕",
    description:
      "WorkHive tặng bạn 30% cho lần đặt chỗ tiếp theo. Áp dụng ngay nào, đừng để lỡi 🔥",
    time: "2 hours Ago",
    section: "Hôm nay",
  },
  {
    id: "2",
    icon: "🏢",
    description:
      "Bamos có view cực chill mà bạn chưa thử nè! 📊 Book ngay để trải nghiệm nào! 😎",
    time: "2 hours Ago",
    section: "Hôm nay",
  },
  {
    id: "3",
    icon: "🎉",
    description:
      "Đặt chỗ của bạn đã thành công. Đừng quên check-in tại Bamos! 🎉",
    time: "2 hours Ago",
    section: "Hôm nay",
  },
  {
    id: "4",
    icon: "🛒",
    description: "Thanh toán đã thành công, đặt chỗ đang được xử lý",
    time: "2 hours Ago",
    section: "Hôm qua",
  },
  {
    id: "5",
    icon: "🎉",
    description:
      "Bạn ơi, Kana sắp tổ chức sự kiện Đàn len vào 20/10/2025. Tham gia ngay 🎶",
    time: "2 hours Ago",
    section: "Hôm qua",
  },
];

const NotificationScreen = ({ navigation }) => {
  const groupedNotifications = {};

  notifications.forEach((notification) => {
    if (!groupedNotifications[notification.section]) {
      groupedNotifications[notification.section] = [];
    }
    groupedNotifications[notification.section].push(notification);
  });

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity style={styles.notificationItem} key={item.id}>
      <View style={styles.iconContainer}>
        <Text style={styles.emojiIcon}>{item.icon}</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.message}>{item.description}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={Object.keys(groupedNotifications)}
        keyExtractor={(section) => section}
        renderItem={({ item: section }) => (
          <View>
            <Text style={styles.sectionTitle}>{section}</Text>
            {groupedNotifications[section].map((notification) =>
              renderNotificationItem({ item: notification })
            )}
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  list: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 16,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  emojiIcon: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
});

export default NotificationScreen;

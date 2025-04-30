import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../contexts/AuthContext";
import dayjs from "dayjs";

const NotificationScreen = ({ navigation }) => {
  const { userToken, userData } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groupedNotifications, setGroupedNotifications] = useState({});

  const groupNotificationsByDate = (notifs) => {
    const grouped = {};

    notifs.forEach((notification) => {
      // Get date from timestamp
      const date = dayjs(notification.createdAt).format("YYYY-MM-DD");
      
      // Set section header based on how recent the date is
      let sectionTitle;
      const today = dayjs().format("YYYY-MM-DD");
      const yesterday = dayjs().subtract(1, 'day').format("YYYY-MM-DD");
      
      if (date === today) {
        sectionTitle = "Hôm nay";
      } else if (date === yesterday) {
        sectionTitle = "Hôm qua";
      } else {
        sectionTitle = dayjs(date).format("DD/MM/YYYY");
      }

      // Initialize section array if not exists
      if (!grouped[sectionTitle]) {
        grouped[sectionTitle] = [];
      }
      
      // Add notification to section
      grouped[sectionTitle].push(notification);
    });

    return grouped;
  };

  const fetchNotifications = useCallback(async () => {
    if (!userData || !userData.sub || !userToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://workhive.info.vn:8443/users/usernotification/${userData.sub}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      
      // Transform notification data
      const formattedNotifications = data.customerNotificationDTOs
        .map(notification => ({
          id: notification.userNotificationId,
          title: notification.title,
          description: notification.description,
          read: notification.isRead === 1,
          time: dayjs(notification.createAt).format("HH:mm, DD/MM/YYYY"),
          createdAt: new Date(notification.createAt).getTime(),
        }))
        .sort((a, b) => b.createdAt - a.createdAt); // newest first

      setNotifications(formattedNotifications);
      setGroupedNotifications(groupNotificationsByDate(formattedNotifications));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData, userToken]);

  const markAsRead = async (id) => {
    if (!userToken) return;

    // Update local state first for better user experience
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );

    // Update grouped notifications
    setGroupedNotifications(groupNotificationsByDate(notifications));

    try {
      const response = await fetch(
        `https://workhive.info.vn:8443/users/updateusernotification/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Revert change if failed
      fetchNotifications();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getIconForNotification = (title) => {
    // Choose appropriate icon based on notification title
    if (title?.toLowerCase().includes("đặt chỗ") || title?.toLowerCase().includes("booking")) {
      return "calendar-outline";
    } else if (title?.toLowerCase().includes("nạp tiền") || title?.toLowerCase().includes("thanh toán")) {
      return "cash-outline";
    } else if (title?.toLowerCase().includes("hoàn tiền") || title?.toLowerCase().includes("refund")) {
      return "refresh-circle-outline";
    } else if (title?.toLowerCase().includes("khuyến mãi") || title?.toLowerCase().includes("giảm giá") || title?.toLowerCase().includes("ưu đãi")) {
      return "pricetag-outline";
    } else {
      return "notifications-outline";
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, item.read && styles.notificationItemRead]} 
      onPress={() => !item.read && markAsRead(item.id)}
      key={item.id}
    >
      <View style={[styles.iconContainer, item.read ? styles.iconRead : styles.iconUnread]}>
        <Ionicons name={getIconForNotification(item.title)} size={20} color={item.read ? "#999" : "#835101"} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, item.read && styles.titleRead]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.message, item.read && styles.messageRead]}>
          {item.description}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
        <Text style={styles.loadingText}>Đang tải thông báo...</Text>
      </View>
    );
  }

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

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Không có thông báo nào</Text>
        </View>
      ) : (
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#835101"]}
            />
          }
        />
      )}
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
    color: "#835101",
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  notificationItemRead: {
    backgroundColor: "#f9f9f9",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconUnread: {
    backgroundColor: "#FFF0E0",
  },
  iconRead: {
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    flex: 1,
    position: "relative",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  titleRead: {
    fontWeight: "400",
    color: "#666",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
    marginBottom: 4,
  },
  messageRead: {
    color: "#666",
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
  unreadDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B6B",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default NotificationScreen;

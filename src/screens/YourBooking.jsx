/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const BookingScreen = () => {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData, userToken } = useContext(AuthContext);
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Success");

  useEffect(() => {
    if (isFocused) {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          display: "flex",
          elevation: 5,
          backgroundColor: "#ffffff",
          height: Platform.OS === 'ios' ? 60 + (insets.bottom || 0) : 65,
          paddingBottom: Platform.OS === 'ios' ? (insets.bottom || 0) : 0,
          ...styles.shadow,
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        },
      });
    }
  }, [isFocused, navigation, insets]);

  useEffect(() => {
    fetchBookingHistory();
    const unsubscribe = navigation.addListener("focus", () => {
      fetchBookingHistory();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchBookingHistory = async () => {
    try {
      const response = await axios.get(
        `http://35.78.210.59:8080/users/booking/historybookings?UserId=${userData.sub}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.data && response.data.bookingHistories) {
        const sortedBookings = response.data.bookingHistories.sort((a, b) => {
          return new Date(b.booking_CreatedAt) - new Date(a.booking_CreatedAt); // Sort by newest
        });
        setBookings(sortedBookings);
      }
    } catch (error) {
      alert("Lỗi khi tải lịch sử đặt chỗ:", error);
      Alert.alert(
        "Lỗi",
        "Không thể tải lịch sử đặt chỗ. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Success":
        return "Đặt chỗ thành công";
      case "Pending":
        return "Đang chờ xử lý";
      case "Cancelled":
        return "Đặt chỗ đã hủy";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Success":
        return "#4CAF50";
      case "Pending":
        return "#FFC107";
      case "Cancelled":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => navigation.navigate("BookingDetail", { booking: item })}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.workspaceImageContainer}>
          <Image
            source={{ uri: item.bookingHistoryWorkspaceImages[0]?.imageUrl }}
            style={styles.workspaceImage}
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.workspaceName}>{item.workspace_Name}</Text>
          <Text style={styles.licenseAddress} numberOfLines={2}>
            {item.license_Address}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.booking_Status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(item.booking_Status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bookingInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color="#835101" />
          <Text style={styles.infoText}>
            {formatDate(item.booking_StartDate)} -{" "}
            {formatDate(item.booking_EndDate)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={18} color="#835101" />
          <Text style={styles.infoText}>
            Sức chứa: {item.workspace_Capacity} người
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={18} color="#835101" />
          <Text style={styles.infoText}>Thanh toán: {item.payment_Method}</Text>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Tổng tiền:</Text>
        <Text style={styles.priceValue}>{formatPrice(item.booking_Price)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#835101" />
          <Text style={styles.loadingText}>Đang tải lịch sử đặt chỗ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Filter bookings based on the active tab
  const filteredBookings =
    activeTab === "Chưa đánh giá"
      ? bookings.filter(
          (item) => item.booking_Status === "Success" && item.isReview === 0
        )
      : bookings.filter((item) => item.booking_Status === activeTab);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lịch sử đặt chỗ</Text>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "Success" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("Success")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Success" && styles.activeTabText,
              ]}
            >
              Thành công
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "Cancelled" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("Cancelled")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Cancelled" && styles.activeTabText,
              ]}
            >
              Đã hủy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "Chưa đánh giá" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("Chưa đánh giá")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Chưa đánh giá" && styles.activeTabText,
              ]}
            >
              Chưa đánh giá
            </Text>
          </TouchableOpacity>
        </View>

        {filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color="#CCCCCC" />
            <Text style={styles.emptyText}>
              {activeTab === "Success"
                ? "Bạn chưa có lịch sử đặt chỗ thành công nào"
                : activeTab === "Cancelled"
                  ? "Bạn chưa có lịch sử đặt chỗ thất bại nào"
                  : "Bạn đã đánh giá tất cả không gian"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredBookings}
            renderItem={renderBookingItem}
            keyExtractor={(item) => item.booking_Id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
  },
  // Tab styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: "#835101",
  },
  tabText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#835101",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  listContainer: {
    padding: 15,
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: "row",
  },
  workspaceImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 15,
  },
  workspaceImage: {
    width: "100%",
    height: "100%",
  },
  headerInfo: {
    flex: 1,
  },
  workspaceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  licenseAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 12,
  },
  bookingInfo: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#835101",
  },
});

export default BookingScreen;

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const BookingDetailScreen = ({ route }) => {
  const { booking } = route.params;
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });
    } else {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "flex" } });
    }
  }, [isFocused]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "Success":
        return "#4CAF50";
      case "Pending":
        return "#FFC107";
      case "Fail":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const renderImageItem = ({ item }) => (
    <Image source={{ uri: item.imageUrl }} style={styles.galleryImage} />
  );

  const renderAmenityItem = ({ item }) => (
    <View style={styles.amenityItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.amenityImage} />
      <View style={styles.amenityInfo}>
        <Text style={styles.amenityName}>{item.name}</Text>
        <View style={styles.amenityPriceRow}>
          <Text style={styles.amenityPrice}>{formatPrice(item.unitPrice)}</Text>
          <Text style={styles.amenityQuantity}>x{item.quantity}</Text>
        </View>
      </View>
    </View>
  );

  const renderBeverageItem = ({ item }) => (
    <View style={styles.beverageItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.beverageImage} />
      <View style={styles.beverageInfo}>
        <Text style={styles.beverageName}>{item.name}</Text>
        <View style={styles.beveragePriceRow}>
          <Text style={styles.beveragePrice}>
            {formatPrice(item.unitPrice)}
          </Text>
          <Text style={styles.beverageQuantity}>x{item.quantity}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#835101" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đặt chỗ</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Workspace Images Gallery */}
        <View style={styles.galleryContainer}>
          <FlatList
            data={booking.bookingHistoryWorkspaceImages}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
          />
        </View>

        {/* Workspace Info */}
        <View style={styles.infoSection}>
          <Text style={styles.workspaceName}>{booking.workspace_Name}</Text>
          <View style={styles.licenseRow}>
            <Ionicons name="business-outline" size={18} color="#666" />
            <Text style={styles.licenseName}>{booking.license_Name}</Text>
          </View>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.address}>{booking.license_Address}</Text>
          </View>
        </View>

        {/* Booking Status */}
        <View style={styles.statusSection}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(booking.booking_Status) },
            ]}
          >
            <Text style={styles.statusText}>{booking.booking_Status}</Text>
          </View>
          <Text style={styles.bookingId}>
            Mã đặt chỗ: #{booking.booking_Id}
          </Text>
        </View>

        {/* Booking Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Thông tin đặt chỗ</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời gian bắt đầu:</Text>
            <Text style={styles.detailValue}>
              {formatDate(booking.booking_StartDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời gian kết thúc:</Text>
            <Text style={styles.detailValue}>
              {formatDate(booking.booking_EndDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Loại không gian:</Text>
            <Text style={styles.detailValue}>{booking.workspace_Category}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sức chứa:</Text>
            <Text style={styles.detailValue}>
              {booking.workspace_Capacity} người
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Diện tích:</Text>
            <Text style={styles.detailValue}>{booking.workspace_Area} m²</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời gian dọn dẹp:</Text>
            <Text style={styles.detailValue}>
              {booking.workspace_CleanTime} phút
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phương thức thanh toán:</Text>
            <Text style={styles.detailValue}>{booking.payment_Method}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngày đặt:</Text>
            <Text style={styles.detailValue}>
              {formatDate(booking.booking_CreatedAt)}
            </Text>
          </View>

          {booking.promotion_Code && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã khuyến mãi:</Text>
              <Text style={styles.detailValue}>{booking.promotion_Code}</Text>
            </View>
          )}

          {booking.discount > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Giảm giá:</Text>
              <Text style={styles.detailValue}>{booking.discount}%</Text>
            </View>
          )}
        </View>

        {/* Amenities */}
        {booking.bookingHistoryAmenities &&
          booking.bookingHistoryAmenities.length > 0 && (
            <View style={styles.amenitiesSection}>
              <Text style={styles.sectionTitle}>Tiện ích đã đặt</Text>
              <FlatList
                data={booking.bookingHistoryAmenities}
                renderItem={renderAmenityItem}
                keyExtractor={(item, index) => `amenity-${index}`}
                scrollEnabled={false}
              />
            </View>
          )}

        {/* Beverages */}
        {booking.bookingHistoryBeverages &&
          booking.bookingHistoryBeverages.length > 0 && (
            <View style={styles.beveragesSection}>
              <Text style={styles.sectionTitle}>Đồ uống đã đặt</Text>
              <FlatList
                data={booking.bookingHistoryBeverages}
                renderItem={renderBeverageItem}
                keyExtractor={(item, index) => `beverage-${index}`}
                scrollEnabled={false}
              />
            </View>
          )}

        {/* Total Price */}
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Tổng tiền:</Text>
          <Text style={styles.priceValue}>
            {formatPrice(booking.booking_Price)}
          </Text>
        </View>

        {/* Review Button */}
        {booking.booking_Status === "Success" && booking.isReview === 0 && (
  <TouchableOpacity
    style={styles.reviewButton}
    onPress={() =>
      navigation.navigate("ReviewScreen", {
        bookingId: booking.booking_Id,
        workspaceName: booking.workspace_Name,
        licenseAddress: booking.license_Address,
        capacity: booking.workspace_Capacity,
        area: booking.workspace_Area,
        category: booking.workspace_Category,
        workspaceImage: booking.bookingHistoryWorkspaceImages[0]?.imageUrl, // Pass the first image URL
      })
    }
  >
    <Text style={styles.reviewButtonText}>Đánh giá</Text>
  </TouchableOpacity>
)}
        {/* Rebooking Button */}
        {booking.booking_Status === "Success" && (
          <TouchableOpacity style={styles.rebookButton}>
            <Text style={styles.rebookButtonText}>Đặt lại</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  placeholder: {
    width: 40,
  },
  galleryContainer: {
    height: 200,
    backgroundColor: "#000",
  },
  galleryImage: {
    width: Dimensions.get("window").width,
    height: 200,
    resizeMode: "cover",
  },
  infoSection: {
    backgroundColor: "#FFFFFF",
    padding: 15,
  },
  workspaceName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
  },
  licenseRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  licenseName: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  address: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  statusSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  bookingId: {
    fontSize: 14,
    color: "#666",
  },
  detailsSection: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
  },
  amenitiesSection: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginTop: 10,
  },
  amenityItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  amenityImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  amenityInfo: {
    marginLeft: 15,
    flex: 1,
    justifyContent: "center",
  },
  amenityName: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  amenityPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  amenityPrice: {
    fontSize: 14,
    color: "#835101",
    fontWeight: "500",
  },
  amenityQuantity: {
    fontSize: 14,
    color: "#666",
  },
  beveragesSection: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginTop: 10,
  },
  beverageItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  beverageImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  beverageInfo: {
    marginLeft: 15,
    flex: 1,
    justifyContent: "center",
  },
  beverageName: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  beveragePriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  beveragePrice: {
    fontSize: 14,
    color: "#835101",
    fontWeight: "500",
  },
  beverageQuantity: {
    fontSize: 14,
    color: "#666",
  },
  priceSection: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 18,
    color: "#835101",
    fontWeight: "bold",
  },
  reviewButton: {
    backgroundColor: "#835101",
    marginHorizontal: 15,
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  reviewButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  rebookButton: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#835101",
  },
  rebookButtonText: {
    color: "#835101",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BookingDetailScreen;

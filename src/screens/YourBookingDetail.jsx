import React, { useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import dayjs from "dayjs";

const BookingDetailScreen = ({ route }) => {
  const { booking } = route.params;
  const navigation = useNavigation();
  const [isCancelBookingModal, setIsCancelBookingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { userToken, userData } = useContext(AuthContext);
  const [bookingData, setBookingData] = useState(booking);

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

  const handleCancelBooking = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://workhive.info.vn:8443/users/cancelbooking",
        { bookingId: bookingData.booking_Id },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      if (response.status === 200) {
        Alert.alert(
          "Hủy đặt chỗ thành công",
          "Đơn đặt chỗ của bạn đã được hủy. Nếu được hoàn tiền, số tiền sẽ được hoàn về ví của bạn trong vòng 7 ngày làm việc.",
          [
            {
              text: "OK",
              onPress: () => {
                setIsCancelBookingModal(false);
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert("Lỗi", "Không thể hủy đặt chỗ. Vui lòng thử lại sau.");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi khi hủy đặt chỗ";
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
            data={bookingData.bookingHistoryWorkspaceImages}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
          />
        </View>

        {/* Workspace Info */}
        <View style={styles.infoSection}>
          <Text style={styles.workspaceName}>{bookingData.workspace_Name}</Text>
          <View style={styles.licenseRow}>
            <Ionicons name="business-outline" size={18} color="#666" />
            <Text style={styles.licenseName}>{bookingData.license_Name}</Text>
          </View>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.address}>{bookingData.license_Address}</Text>
          </View>
        </View>

        {/* Booking Status */}
        <View style={styles.statusSection}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(bookingData.booking_Status) },
            ]}
          >
            <Text style={styles.statusText}>
              {" "}
              {getStatusText(bookingData.booking_Status)}
            </Text>
          </View>
          <Text style={styles.bookingId}>
            Mã đặt chỗ: #{bookingData.booking_Id}
          </Text>
        </View>

        {/* Booking Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Thông tin đặt chỗ</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời gian bắt đầu:</Text>
            <Text style={styles.detailValue}>
              {formatDate(bookingData.booking_StartDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời gian kết thúc:</Text>
            <Text style={styles.detailValue}>
              {formatDate(bookingData.booking_EndDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Loại không gian:</Text>
            <Text style={styles.detailValue}>
              {bookingData.workspace_Category}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sức chứa:</Text>
            <Text style={styles.detailValue}>
              {bookingData.workspace_Capacity} người
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Diện tích:</Text>
            <Text style={styles.detailValue}>
              {bookingData.workspace_Area} m²
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời gian dọn dẹp:</Text>
            <Text style={styles.detailValue}>
              {bookingData.workspace_CleanTime} phút
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phương thức thanh toán:</Text>
            <Text style={styles.detailValue}>{bookingData.payment_Method}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngày đặt:</Text>
            <Text style={styles.detailValue}>
              {formatDate(bookingData.booking_CreatedAt)}
            </Text>
          </View>

          {bookingData.promotion_Code && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã khuyến mãi:</Text>
              <Text style={styles.detailValue}>
                {bookingData.promotion_Code}
              </Text>
            </View>
          )}

          {bookingData.discount > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Giảm giá:</Text>
              <Text style={styles.detailValue}>{bookingData.discount}%</Text>
            </View>
          )}
        </View>

        {/* Amenities */}
        {bookingData.bookingHistoryAmenities &&
          bookingData.bookingHistoryAmenities.length > 0 && (
            <View style={styles.amenitiesSection}>
              <Text style={styles.sectionTitle}>Tiện ích đã đặt</Text>
              <FlatList
                data={bookingData.bookingHistoryAmenities}
                renderItem={renderAmenityItem}
                keyExtractor={(item, index) => `amenity-${index}`}
                scrollEnabled={false}
              />
            </View>
          )}

        {/* Beverages */}
        {bookingData.bookingHistoryBeverages &&
          bookingData.bookingHistoryBeverages.length > 0 && (
            <View style={styles.beveragesSection}>
              <Text style={styles.sectionTitle}>Đồ uống đã đặt</Text>
              <FlatList
                data={bookingData.bookingHistoryBeverages}
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
            {formatPrice(bookingData.booking_Price)}
          </Text>
        </View>

        {/* Review Button */}
        {bookingData.booking_Status === "Success" &&
          bookingData.isReview === 0 && (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() =>
                navigation.navigate("ReviewScreen", {
                  bookingId: bookingData.booking_Id,
                  workspaceName: bookingData.workspace_Name,
                  licenseAddress: bookingData.license_Address,
                  capacity: bookingData.workspace_Capacity,
                  area: bookingData.workspace_Area,
                  category: bookingData.workspace_Category,
                  workspaceImage:
                    bookingData.bookingHistoryWorkspaceImages[0]?.imageUrl, // Pass the first image URL
                })
              }
            >
              <Text style={styles.reviewButtonText}>Đánh giá</Text>
            </TouchableOpacity>
          )}

        {/* Rebooking Button */}
        {bookingData.booking_Status === "Success" && (
          <TouchableOpacity style={styles.rebookButton}>
            <Text style={styles.rebookButtonText}>Đặt lại</Text>
          </TouchableOpacity>
        )}

        {/* Cancel Booking Button - Only show for upcoming bookings that haven't started yet */}
        {bookingData.booking_Status === "Success" &&
          dayjs(bookingData.booking_StartDate).diff(dayjs(), "hour") > 0 && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsCancelBookingModal(true)}
            >
              <Text style={styles.cancelButtonText}>Hủy đặt chỗ</Text>
            </TouchableOpacity>
          )}
      </ScrollView>

      {/* Cancel Booking Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCancelBookingModal}
        onRequestClose={() => setIsCancelBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIcon}>
                <Ionicons name="alert-triangle" size={24} color="#835101" />
              </View>
              <Text style={styles.modalTitle}>Chính sách hủy đặt chỗ</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setIsCancelBookingModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.policySection}>
                <Text style={styles.policySectionTitle}>
                  1. Điều kiện hủy và hoàn tiền
                </Text>
                <View style={styles.policyItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="#835101"
                    style={styles.policyIcon}
                  />
                  <Text style={styles.policyText}>
                    <Text style={styles.policyHighlight}>
                      Hủy trước ít nhất 8 giờ
                    </Text>{" "}
                    so với thời gian đặt chỗ bắt đầu: Hoàn 100% giá trị đặt chỗ.
                  </Text>
                </View>
                <View style={styles.policyItem}>
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color="#835101"
                    style={styles.policyIcon}
                  />
                  <Text style={styles.policyText}>
                    <Text style={styles.policyHighlight}>
                      Hủy sau thời hạn 8 giờ:
                    </Text>{" "}
                    Không hỗ trợ hoàn tiền.
                  </Text>
                </View>
              </View>

              <View style={styles.policySection}>
                <Text style={styles.policySectionTitle}>
                  2. Quy trình hoàn tiền
                </Text>
                <View style={styles.policyItem}>
                  <Ionicons
                    name="wallet"
                    size={16}
                    color="#835101"
                    style={styles.policyIcon}
                  />
                  <Text style={styles.policyText}>
                    Tiền hoàn trả sẽ được chuyển về{" "}
                    <Text style={styles.policyHighlight}>Ví WorkHive</Text>{" "}
                    trong vòng{" "}
                    <Text style={styles.policyHighlight}>7 ngày làm việc</Text>.
                  </Text>
                </View>
                <View style={styles.policyItem}>
                  <Ionicons
                    name="time"
                    size={16}
                    color="#835101"
                    style={styles.policyIcon}
                  />
                  <Text style={styles.policyText}>
                    Thời gian hoàn tiền có thể thay đổi tùy theo quy trình xử lý
                    nhà cung cấp dịch vụ thanh toán.
                  </Text>
                </View>
              </View>

              <View style={styles.policySection}>
                <Text style={styles.policySectionTitle}>
                  3. Lưu ý quan trọng
                </Text>
                <View style={styles.policyItem}>
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color="#835101"
                    style={styles.policyIcon}
                  />
                  <Text style={styles.policyText}>
                    Thời gian hủy được tính dựa trên thời điểm bắt đầu sử dụng
                    dịch vụ, không phải thời điểm đặt chỗ.
                  </Text>
                </View>
              </View>

              <Text style={styles.confirmationText}>
                Bạn có xác nhận hủy đơn đặt chỗ này không?
              </Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsCancelBookingModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  isLoading && styles.disabledButton,
                ]}
                disabled={isLoading}
                onPress={handleCancelBooking}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>
                    Xác nhận hủy
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 5,
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
  cancelButton: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#835101",
  },
  cancelButtonText: {
    color: "#835101",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalHeaderIcon: {
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    flex: 1,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalBody: {
    padding: 15,
  },
  policySection: {
    marginBottom: 15,
  },
  policySectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
  },
  policyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  policyIcon: {
    marginRight: 10,
  },
  policyText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  policyHighlight: {
    fontWeight: "bold",
    color: "#835101",
  },
  confirmationText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginTop: 20,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  modalCancelButton: {
    backgroundColor: "#E0E0E0",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: "#333",
  },
  modalConfirmButton: {
    backgroundColor: "#F44336",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  modalConfirmButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  disabledButton: {
    backgroundColor: "#BDBDBD",
  },
});

export default BookingDetailScreen;

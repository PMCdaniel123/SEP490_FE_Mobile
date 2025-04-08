import { useContext, useEffect, useState, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Alert,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useCart } from "../contexts/CartContext";
import { formatCurrency } from "../constants";
import Icon from "react-native-vector-icons/MaterialIcons";
import { BlurView } from "expo-blur";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { RadioButton } from "react-native-paper";
import { WebView } from "react-native-webview";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

function Checkout() {
  const navigation = useNavigation();
  const { userData, userToken } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useCart();
  const {
    workspaceId,
    startTime,
    endTime,
    beverageList,
    amenityList,
    total,
    category,
  } = state;
  const [promotion, setPromotion] = useState(null);
  const [promotionList, setPromotionList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("1");
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);
  const webViewRef = useRef(null);

  useEffect(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    const fetchWorkspaceDetails = async () => {
      try {
        const response = await axios.get(
          `http://35.78.210.59:8080/workspaces/${workspaceId}`
        );
        setWorkspace(response.data?.getWorkSpaceByIdResult || null);
      } catch (error) {
        alert("Error fetching workspace details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceDetails();
    fetchPromotions({ workspaceId });
  }, [workspaceId]);

  const fetchPromotions = async ({ workspaceId }) => {
    try {
      const response = await axios.get(
        `http://35.78.210.59:8080/workspaces/${workspaceId}/promotions`
      );
      const now = dayjs();
      const formattedDate = (
        Array.isArray(response.data?.promotions)
          ? response.data?.promotions
          : []
      ).filter((item) => {
        const startDate = dayjs(item.startDate);
        const endDate = dayjs(item.endDate);

        const isValidTime =
          startDate.isValid() &&
          endDate.isValid() &&
          ((startDate.isSameOrBefore(now, "date") &&
            endDate.isSameOrAfter(now, "date")) ||
            startDate.isAfter(now, "date")) &&
          item.status === "Active";

        return isValidTime;
      });
      setPromotionList(formattedDate);
    } catch (error) {
      alert("Error fetching promotion details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    const amenitiesRequest = amenityList.map((amenity) => ({
      id: amenity.id,
      quantity: amenity.quantity,
    }));
    const beveragesRequest = beverageList.map((beverage) => ({
      id: beverage.id,
      quantity: beverage.quantity,
    }));
    const request = {
      userId: Number(userData?.sub),
      workspaceId: Number(workspaceId),
      startDate: startTime,
      endDate: endTime,
      amenities: amenitiesRequest,
      beverages: beveragesRequest,
      promotionCode: promotion?.code || "",
      price: total,
      workspaceTimeCategory: category,
    };
    setLoading(true);
    try {
      const response = await axios.post(
        `http://35.78.210.59:8080/users/bookingformobile`,
        {
          ...request,
        }
      );

      // Store booking information for later use
      const bookingInfo = {
        bookingId: response.data.bookingId,
        orderCode: response.data.orderCode,
        status: response.data.status,
      };

      // Save to local state for use after payment
      setBookingInfo(bookingInfo);

      dispatch({ type: "CLEAR_CART" });
      setCheckoutUrl(response.data.checkoutUrl);
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Handle deep links when the app is already open
    const handleUrl = (event) => {
      const { url } = event;
      handleDeepLink(url);
    };

    // Add event listener for URL changes
    Linking.addEventListener("url", handleUrl);

    // Check for initial URL that launched the app
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      // Clean up event listener
      Linking.removeEventListener("url", handleUrl);
    };
  }, [handleDeepLink]);

  // Function to handle deep links
  const handleDeepLink = useCallback(
    (url) => {
      if (url && url.includes("success")) {
        try {
          // Extract parameters from URL
          const queryString = url.split("?")[1];
          const urlParams = new URLSearchParams(queryString);
          const params = {};

          // Convert URLSearchParams to a regular object
          urlParams.forEach((value, key) => {
            params[key] = value;
          });

          // Navigate to success screen with parameters
          navigation.navigate("SuccessPage", params);
        } catch (error) {
          // If there's an error parsing the URL, navigate to success page with minimal params
          navigation.navigate("SuccessPage", { status: "PAID" });
        }
      } else if (url && url.includes("cancel")) {
        navigation.navigate("FailPage");
      }
    },
    [navigation]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.rowBetwween} key={item.id}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={{ uri: item.imgUrl }}
          style={{ width: 60, height: 60, borderRadius: 4, marginRight: 12 }}
        />
        <View>
          <Text style={{ fontSize: 14, fontWeight: "bold" }} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 12, color: "#666" }}>
            Đơn giá: {formatCurrency(item.price)}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 12, color: "#666" }}>x{item.quantity}</Text>
    </View>
  );

  return checkoutUrl ? (
    <>
      <WebView
        ref={webViewRef}
        source={{ uri: checkoutUrl }}
        onNavigationStateChange={(navState) => {
          // PayOS typically redirects to a success URL after payment
          if (
            navState.url.includes("result") ||
            navState.url.includes("success") ||
            navState.url.includes("callback") ||
            navState.url.includes("return")
          ) {
            // Check if the URL contains success indicators
            const isSuccess =
              navState.url.includes("success=true") ||
              navState.url.includes("status=success") ||
              navState.url.includes("status=PAID") ||
              navState.url.toLowerCase().includes("success");

            if (isSuccess && bookingInfo) {
              // Navigate to success screen with booking information
              navigation.navigate("SuccessPage", {
                OrderCode: bookingInfo.orderCode,
                BookingId: bookingInfo.bookingId,
                status: "PAID",
                cancel: false,
              });
            }
          }
        }}
        onShouldStartLoadWithRequest={(request) => {
          // Handle redirects to custom URL schemes or success pages
          if (
            request.url.startsWith("mobile://") ||
            (request.url.includes("result") &&
              request.url.toLowerCase().includes("success"))
          ) {
            if (bookingInfo) {
              navigation.navigate("SuccessPage", {
                OrderCode: bookingInfo.orderCode,
                BookingId: bookingInfo.bookingId,
                status: "PAID",
                cancel: false,
              });
            }
            return false; // Prevent WebView from loading this URL
          }
          return true; // Allow all other URLs to load
        }}
        injectedJavaScript={`
          (function() {
            // Listen for payment success events
            function checkForSuccess() {
              const successElements = document.querySelectorAll('.success-message, .payment-success, .transaction-complete');
              if (successElements.length > 0) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'payment_success'
                }));
              }
              
              // Check URL for success indicators
              if (window.location.href.includes('success') || 
                  window.location.href.includes('result') ||
                  window.location.href.includes('complete')) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'payment_success',
                  url: window.location.href
                }));
              }
            }
            
            // Run checks periodically
            setInterval(checkForSuccess, 1000);
            
            // Also check on page load
            window.addEventListener('load', checkForSuccess);
            
            // Monitor URL changes
            var oldPushState = history.pushState;
            history.pushState = function(state, title, url) {
              if (url) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'url_change',
                  url: url
                }));
                
                if (url.includes('success') || url.includes('result')) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'payment_success',
                    url: url
                  }));
                }
              }
              return oldPushState.apply(history, arguments);
            };
          })();
        `}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);

            if (data.type === "payment_success" && bookingInfo) {
              navigation.navigate("SuccessPage", {
                OrderCode: bookingInfo.orderCode,
                BookingId: bookingInfo.bookingId,
                status: "PAID",
                cancel: false,
              });
            }

            if (
              data.type === "url_change" &&
              data.url &&
              (data.url.includes("success") || data.url.includes("result"))
            ) {
              if (bookingInfo) {
                navigation.navigate("SuccessPage", {
                  OrderCode: bookingInfo.orderCode,
                  BookingId: bookingInfo.bookingId,
                  status: "PAID",
                  cancel: false,
                });
              }
            }
          } catch (error) {
            // Ignore parsing errors
          }
        }}
      />
    </>
  ) : (
    <>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.navigate("WorkspaceDetail", { id: workspaceId })
            }
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.screenTitleContainer}>
          <Text style={styles.screenTitle}>Thanh toán</Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.headerContainer}>Thông tin người dùng</Text>
          <View style={styles.rowBetweenVertical4}>
            <Text style={styles.boldText}>Tên:</Text>
            <Text style={styles.boldText}>{userProfile?.name}</Text>
          </View>
          <View style={styles.rowBetweenVertical4}>
            <Text style={styles.boldText}>Số điện thoại:</Text>
            <Text>{userProfile?.phone}</Text>
          </View>
          <View style={styles.rowBetweenVertical4}>
            <Text style={styles.boldText}>Email:</Text>
            <Text>{userProfile?.email}</Text>
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.headerContainer}>Thông tin đơn đặt chỗ</Text>
          <View style={styles.listItemCard}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: workspace?.images[0]?.imgUrl }}
                style={styles.listItemImage}
              />
            </View>
            <View style={styles.listItemInfo}>
              <Text style={styles.listItemName} numberOfLines={1}>
                {workspace?.name}
              </Text>
              <View style={styles.listItemLocation}>
                <Icon name="location-on" size={14} color="#666" />
                <Text style={styles.listItemLocationText} numberOfLines={2}>
                  {workspace?.address}
                </Text>
              </View>
              <View style={styles.detailContainer}>
                <View style={styles.rowBetwween}>
                  <Text style={styles.text11color666}>Loại:</Text>
                  <Text style={styles.text11color666}>
                    {workspace?.category}
                  </Text>
                </View>
                <View style={styles.rowBetwween}>
                  <Text style={styles.text11color666}>Diện tích:</Text>
                  <Text style={styles.text11color666}>
                    {workspace?.area} m²
                  </Text>
                </View>
                <View style={styles.rowBetwween}>
                  <Text style={styles.text11color666}>Sức chứa:</Text>
                  <Text style={styles.text11color666}>
                    {workspace?.capacity} người
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.rowBetweenVertical4}>
            <Text style={styles.boldText}>Thời gian bắt đầu:</Text>
            <Text>{startTime}</Text>
          </View>
          <View style={styles.rowBetweenVertical4}>
            <Text style={styles.boldText}>Thời gian kết thúc:</Text>
            <Text>{endTime}</Text>
          </View>
          {amenityList.length + beverageList.length > 0 && (
            <View style={styles.serviceContainer}>
              <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                Kèm theo:
              </Text>
              {amenityList.length > 0 &&
                amenityList.map((item) => renderItem({ item }))}
              {beverageList.length > 0 &&
                beverageList.map((item) => renderItem({ item }))}
            </View>
          )}
        </View>
        <View style={styles.gap10SectionContainer}>
          <View style={styles.rowBetwween}>
            <Text style={styles.boldText}>Tạm tính:</Text>
            <Text>{formatCurrency(total)}</Text>
          </View>
          <View style={styles.promotionSectionContainer}>
            <Text style={styles.boldText}>Mã khuyến mại:</Text>
            <Text>
              {promotion
                ? promotion.code + " - " + promotion.discount + "%"
                : ""}
            </Text>
          </View>
          <View style={styles.rowBetwween}>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>Tổng cộng:</Text>
            <Text
              style={{ fontWeight: "bold", fontSize: 18, color: "#835101" }}
            >
              {formatCurrency(
                promotion ? total - (promotion.discount / 100) * total : total
              )}
            </Text>
          </View>
        </View>
        <View style={styles.gap10SectionContainer}>
          <TouchableOpacity
            style={styles.rowBetwween}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.boldText}>Áp dụng mã khuyến mại</Text>
            <Ionicons name="chevron-forward-sharp" size={20} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.gap10SectionContainer}>
          <Text style={styles.boldText}>Chọn phương thức thanh toán</Text>
          <RadioButton.Group
            onValueChange={setPaymentMethod}
            value={paymentMethod}
          >
            <View style={styles.rowCenterVertical4}>
              <RadioButton value="1" color="#835101" />
              <Image
                source={require("../../assets/images/vietqr.png")}
                style={{ width: 80, height: 24, marginRight: 12 }}
              />
              <Text>Thanh toán bằng ngân hàng</Text>
            </View>
            <View style={styles.rowCenterVertical4}>
              <RadioButton value="2" color="#835101" />
              <Image
                source={require("../../assets/images/logo.png")}
                style={{ width: 80, height: 64, marginRight: 12 }}
              />
              <Text>Thanh toán bằng WorkHive Wallet</Text>
            </View>
          </RadioButton.Group>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            Thanh toán
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <BlurView intensity={60} style={styles.blurView}>
          <View style={styles.promotionContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
                ×
              </Text>
            </TouchableOpacity>
            <Text style={styles.promotionTitle}>Danh sách mã khuyến mãi</Text>
            {promotionList.length > 0 ? (
              promotionList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    width: "100%",
                    padding: 12,
                    marginVertical: 6,
                    borderRadius: 10,
                    backgroundColor: "#F5F5F5",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                    borderWidth: promotion?.code === item.code ? 1 : 0,
                    borderColor: promotion?.code === item.code ? "#835101" : "",
                  }}
                  onPress={() => {
                    setPromotion({ code: item.code, discount: item.discount });
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.promotionHeaderContainer}>
                    <Text style={styles.promotionCode}>{item.code}</Text>
                    <Text style={{ fontSize: 16, color: "#835101" }}>
                      {item.discount}%
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: "#888" }}>
                    ({dayjs(item.startDate).format("HH:mm DD/MM/YYYY")} -{" "}
                    {dayjs(item.endDate).format("HH:mm DD/MM/YYYY")})
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ fontSize: 14, color: "#888" }}>
                Không có khuyến mãi nào.
              </Text>
            )}
          </View>
        </BlurView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    position: "absolute",
    top: 30,
    left: 10,
    right: 10,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listItemCard: {
    flexDirection: "row",
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  imageContainer: {
    width: 120,
    height: 160,
  },
  listItemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  listItemInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  listItemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  listItemLocation: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  listItemLocationText: {
    fontSize: 11,
    color: "#666",
    flex: 1,
    marginLeft: 2,
  },
  backButton: { backgroundColor: "#835101", padding: 8, borderRadius: 50 },
  screenTitleContainer: {
    alignItems: "center",
    marginTop: 20,
    padding: 16,
  },
  screenTitle: { fontSize: 24, fontWeight: "bold" },
  sectionContainer: {
    paddingHorizontal: 12,
    paddingVertical: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  gap10SectionContainer: {
    paddingHorizontal: 12,
    paddingVertical: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
    gap: 10,
  },
  rowBetwween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowBetweenVertical4: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  rowCenterVertical4: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  boldText: {
    fontWeight: "bold",
  },
  headerContainer: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#835101",
    marginBottom: 10,
    textAlign: "center",
  },
  text11color666: {
    fontSize: 11,
    color: "#666",
  },
  detailContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  serviceContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    flexDirection: "column",
    gap: 8,
  },
  promotionSectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  checkoutButton: {
    padding: 16,
    backgroundColor: "#835101",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 20,
    marginHorizontal: 12,
  },
  blurView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  promotionContainer: {
    width: 320,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#835101",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FF4D4D",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  promotionHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  promotionCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});

export default Checkout;

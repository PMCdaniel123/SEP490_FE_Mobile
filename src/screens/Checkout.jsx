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

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  useEffect(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    const fetchWorkspaceDetails = async () => {
      try {
        const response = await axios.get(
          `https://workhive.info.vn:8443/workspaces/${workspaceId}`
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
        `https://workhive.info.vn:8443/workspaces/${workspaceId}/promotions`
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userData || !userData.sub) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://workhive.info.vn:8443/users/${userData.sub}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        if (response.data && response.data.user) {
          setUserProfile(response.data.user);
        } else {
          setError("Không thể tải thông tin người dùng");
        }
      } catch (error) {
        alert("Lỗi khi tải hồ sơ:", error);
        setError("Đã xảy ra lỗi khi tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userData, userToken]);

  const handleCheckout = async () => {
    if (paymentMethod === "2") {
      setConfirmModalVisible(true);
      return;
    }

    proceedWithCheckout();
  };

  const proceedWithCheckout = async () => {
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
      const isWalletPayment = paymentMethod === "2";
      const apiUrl = isWalletPayment
        ? `https://workhive.info.vn:8443/users/bookingbyworkhivewallet`
        : `https://workhive.info.vn:8443/users/bookingformobile`;

      console.log("Using API endpoint:", apiUrl);

      const response = await axios.post(apiUrl, {
        ...request,
      });

      if (isWalletPayment) {
        if (
          response.data &&
          response.data.notification === "Ví của bạn đã bị khóa" &&
          response.data.isLock === 1
        ) {
          Alert.alert(
            "Lỗi thanh toán",
            "Ví của bạn hiện đang bị khóa do thực hiện yêu cầu rút tiền"
          );
          return;
        }

        // Payment successful
        dispatch({ type: "CLEAR_CART" });
        navigation.navigate("SuccessPage", {
          OrderCode: response.data.orderCode,
          BookingId: response.data.bookingId,
          status: "PAID",
          cancel: false,
        });
        return;
      }

      // For regular payment methods
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
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Đã xảy ra lỗi khi thanh toán"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fix for Linking API - using the subscription pattern instead of event listeners
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Check for initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Return cleanup function that removes the event listener
    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);

  const handleDeepLink = useCallback(
    (url) => {
      if (!url) return;

      const lowerUrl = url.toLowerCase();
      const queryString = url.includes("?") ? url.split("?")[1] : "";
      const urlParams = new URLSearchParams(queryString);
      const params = {};

      urlParams.forEach((value, key) => {
        params[key] = value;
      });

      // Success scenario
      const isSuccess =
        lowerUrl.includes("success=true") ||
        lowerUrl.includes("status=success") ||
        lowerUrl.includes("status=paid") ||
        lowerUrl.includes("result=success") ||
        lowerUrl.includes("result=paid") ||
        lowerUrl.includes("success");

      // Cancel or failure scenario
      const isCancelled =
        lowerUrl.includes("cancel") ||
        lowerUrl.includes("status=cancel") ||
        lowerUrl.includes("fail") ||
        lowerUrl.includes("status=failed");

      if (isSuccess) {
        navigation.navigate("SuccessPage", {
          ...params,
          status: "PAID",
          cancel: false,
        });
      } else if (isCancelled) {
        navigation.navigate("FailPage", {
          OrderCode: bookingInfo.orderCode,
          BookingId: bookingInfo.bookingId,
          workspaceId: workspaceId,
        });
      }
    },
    [navigation, bookingInfo, workspaceId]
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
          const url = navState.url.toLowerCase();

          const isSuccess =
            url.includes("success=true") ||
            url.includes("status=success") ||
            url.includes("status=paid") ||
            url.includes("success") ||
            url.includes("result=paid");

          const isCancelled =
            url.includes("cancel") ||
            url.includes("status=cancel") ||
            url.includes("fail") ||
            url.includes("status=failed");

          if (isSuccess && bookingInfo) {
            navigation.navigate("SuccessPage", {
              OrderCode: bookingInfo.orderCode,
              BookingId: bookingInfo.bookingId,
              status: "PAID",
              cancel: false,
            });
          } else if (isCancelled) {
            navigation.navigate("FailPage", {
              OrderCode: bookingInfo.orderCode,
              BookingId: bookingInfo.bookingId,
              workspaceId: workspaceId,
            });
          }
        }}
        onShouldStartLoadWithRequest={(request) => {
          const url = request.url.toLowerCase();

          // ✅ Handle cancel from mobile://cancel?... response
          if (url.startsWith("mobile://cancel")) {
            navigation.navigate("FailPage", {
              OrderCode: bookingInfo.orderCode,
              BookingId: bookingInfo.bookingId,
              workspaceId: workspaceId,
            });
            return false;
          }

          if (
            url.includes("cancel") ||
            url.includes("fail") ||
            url.includes("status=cancel")
          ) {
            navigation.navigate("FailPage", {
              OrderCode: bookingInfo.orderCode,
              BookingId: bookingInfo.bookingId,
              workspaceId: workspaceId,
            });
            return false;
          }

          if (
            url.startsWith("mobile://success") || // Some custom success scheme
            (url.includes("result") && url.includes("success"))
          ) {
            if (bookingInfo) {
              navigation.navigate("SuccessPage", {
                OrderCode: bookingInfo.orderCode,
                BookingId: bookingInfo.bookingId,
                status: "PAID",
                cancel: false,
              });
            }
            return false;
          }

          return true;
        }}
        injectedJavaScript={`
          (function() {
            function sendCancelMessage() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment_cancel',
                reason: 'User confirmed cancel'
              }));
            }
        
            function observeAndBindCancelButton() {
              const observer = new MutationObserver(() => {
                // Find the modal by checking for the "HỦY THANH TOÁN" title
                const cancelModal = Array.from(document.querySelectorAll("div"))
                  .find(div => div.innerText && div.innerText.includes("HỦY THANH TOÁN"));
        
                if (cancelModal) {
                  const confirmBtn = Array.from(cancelModal.querySelectorAll("button"))
                    .find(btn => btn.innerText.includes("Xác nhận hủy"));
        
                  if (confirmBtn && !confirmBtn.dataset.bound) {
                    confirmBtn.dataset.bound = "true";
                    confirmBtn.addEventListener("click", function() {
                      sendCancelMessage();
                    });
                  }
                }
              });
        
              observer.observe(document.body, { childList: true, subtree: true });
            }
        
            observeAndBindCancelButton();
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
            } else if (data.type === "payment_cancel") {
              navigation.navigate("FailPage", {
                OrderCode: bookingInfo.orderCode,
                BookingId: bookingInfo.bookingId,
                workspaceId: workspaceId,
              });
            }
          } catch (error) {
            alert("WebView message parse error:", error);
          }
        }}
      />
    </>
  ) : (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
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

        {/* User information card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={18} color="#835101" />
            <Text style={styles.cardHeaderText}>Thông tin người dùng</Text>
          </View>
          <View style={styles.userInfoRow}>
            <View style={styles.userInfoField}>
              <Text style={styles.fieldLabel}>Tên</Text>
              <Text style={styles.fieldValue}>{userProfile?.name}</Text>
            </View>
            <View style={styles.userInfoField}>
              <Text style={styles.fieldLabel}>Số điện thoại</Text>
              <Text style={styles.fieldValue}>{userProfile?.phone}</Text>
            </View>
          </View>
          <View style={styles.userInfoField}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>{userProfile?.email}</Text>
          </View>
        </View>

        {/* Workspace booking details card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={18} color="#835101" />
            <Text style={styles.cardHeaderText}>Chi tiết đặt chỗ</Text>
          </View>

          {/* Workspace info */}
          <View style={styles.workspaceCard}>
            <Image
              source={{ uri: workspace?.images[0]?.imgUrl }}
              style={styles.workspaceImage}
            />
            <View style={styles.workspaceInfo}>
              <Text style={styles.workspaceName} numberOfLines={1}>
                {workspace?.name}
              </Text>
              <View style={styles.locationRow}>
                <Icon name="location-on" size={14} color="#666" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {workspace?.address}
                </Text>
              </View>
              <View style={styles.workspaceFeatures}>
                <View style={styles.featureItem}>
                  <Icon name="category" size={14} color="#835101" />
                  <Text style={styles.featureText}>{workspace?.category}</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="straighten" size={14} color="#835101" />
                  <Text style={styles.featureText}>{workspace?.area} m²</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="people" size={14} color="#835101" />
                  <Text style={styles.featureText}>
                    {workspace?.capacity} người
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Booking time */}
          <View style={styles.bookingTimeContainer}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Bắt đầu:</Text>
              <View style={styles.timeValue}>
                <Ionicons name="time-outline" size={14} color="#835101" />
                <Text style={styles.timeText}>{startTime}</Text>
              </View>
            </View>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Kết thúc:</Text>
              <View style={styles.timeValue}>
                <Ionicons name="time-outline" size={14} color="#835101" />
                <Text style={styles.timeText}>{endTime}</Text>
              </View>
            </View>
          </View>

          {/* Additional services */}
          {(amenityList.length > 0 || beverageList.length > 0) && (
            <View style={styles.additionalServicesContainer}>
              <View style={styles.sectionDivider} />
              <Text style={styles.additionalServicesTitle}>
                <Ionicons name="add-circle-outline" size={16} color="#835101" />{" "}
                Dịch vụ bổ sung
              </Text>

              {amenityList.length > 0 && (
                <View style={styles.serviceSection}>
                  <Text style={styles.serviceSectionTitle}>Tiện ích:</Text>
                  {amenityList.map((item) => (
                    <View style={styles.serviceItem} key={item.id}>
                      <View style={styles.serviceItemLeft}>
                        <Image
                          source={{ uri: item.imgUrl }}
                          style={styles.serviceItemImage}
                        />
                        <View>
                          <Text
                            style={styles.serviceItemName}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <Text style={styles.serviceItemPrice}>
                            {formatCurrency(item.price)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.serviceItemQuantity}>
                        <Text style={styles.quantityText}>
                          x{item.quantity}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {beverageList.length > 0 && (
                <View style={styles.serviceSection}>
                  <Text style={styles.serviceSectionTitle}>Đồ uống:</Text>
                  {beverageList.map((item) => (
                    <View style={styles.serviceItem} key={item.id}>
                      <View style={styles.serviceItemLeft}>
                        <Image
                          source={{ uri: item.imgUrl }}
                          style={styles.serviceItemImage}
                        />
                        <View>
                          <Text
                            style={styles.serviceItemName}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <Text style={styles.serviceItemPrice}>
                            {formatCurrency(item.price)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.serviceItemQuantity}>
                        <Text style={styles.quantityText}>
                          x{item.quantity}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Payment summary card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cash-outline" size={18} color="#835101" />
            <Text style={styles.cardHeaderText}>Tổng thanh toán</Text>
          </View>

          {/* Promotion section */}
          <TouchableOpacity
            style={styles.promotionButton}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.promotionButtonLeft}>
              <Ionicons name="ticket-outline" size={20} color="#835101" />
              <Text style={styles.promotionText}>
                {promotion
                  ? `Mã giảm giá: ${promotion.code} (-${promotion.discount}%)`
                  : "Chọn mã khuyến mãi"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#835101" />
          </TouchableOpacity>

          {/* Price breakdown */}
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tạm tính:</Text>
              <Text style={styles.priceValue}>{formatCurrency(total)}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giảm giá:</Text>
              <Text style={styles.discountValue}>
                {promotion
                  ? "- " + formatCurrency((promotion.discount / 100) * total)
                  : "0 ₫"}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(
                  promotion ? total - (promotion.discount / 100) * total : total
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment methods card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet-outline" size={18} color="#835101" />
            <Text style={styles.cardHeaderText}>Phương thức thanh toán</Text>
          </View>

          <RadioButton.Group
            onValueChange={setPaymentMethod}
            value={paymentMethod}
          >
            {/* Bank payment */}
            <TouchableOpacity
              style={[
                styles.paymentMethodCard,
                paymentMethod === "1" && styles.paymentMethodCardSelected,
              ]}
              onPress={() => setPaymentMethod("1")}
            >
              <View style={styles.paymentMethodHeader}>
                <View style={styles.radioContainer}>
                  <RadioButton value="1" color="#835101" />
                </View>
                <View style={styles.paymentMethodContent}>
                  <View style={styles.paymentMethodMain}>
                    <Image
                      source={require("../../assets/images/vietqr.png")}
                      style={styles.paymentMethodImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.paymentMethodText}>Thanh toán QR</Text>
                  </View>
                  <Text style={styles.paymentMethodSubtext}>
                    Quét mã QR bằng ứng dụng ngân hàng của bạn
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* WorkHive Wallet payment */}
            <TouchableOpacity
              style={[
                styles.paymentMethodCard,
                paymentMethod === "2" && styles.paymentMethodCardSelected,
              ]}
              onPress={() => setPaymentMethod("2")}
            >
              <View style={styles.paymentMethodHeader}>
                <View style={styles.radioContainer}>
                  <RadioButton value="2" color="#835101" />
                </View>
                <View style={styles.paymentMethodContent}>
                  <View style={styles.paymentMethodMain}>
                    <Image
                      source={require("../../assets/images/logo.png")}
                      style={styles.walletMethodImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.paymentMethodText}>
                      WorkHive Wallet
                    </Text>
                  </View>
                  <Text style={styles.paymentMethodSubtext}>
                    Thanh toán bằng số dư trong tài khoản WorkHive của bạn
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </RadioButton.Group>
        </View>

        {/* Checkout button */}
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>
            Thanh toán{" "}
            {formatCurrency(
              promotion ? total - (promotion.discount / 100) * total : total
            )}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </ScrollView>

      {/* Promotion modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <BlurView intensity={60} style={styles.blurView}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mã khuyến mãi</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {promotionList.length > 0 ? (
                <ScrollView style={styles.promotionList}>
                  {promotionList.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.promotionItem,
                        promotion?.code === item.code &&
                          styles.promotionItemSelected,
                      ]}
                      onPress={() => {
                        setPromotion({
                          code: item.code,
                          discount: item.discount,
                        });
                        setModalVisible(false);
                      }}
                    >
                      <View style={styles.promotionItemContent}>
                        <View style={styles.promotionItemHeader}>
                          <View style={styles.promotionBadge}>
                            <Text style={styles.promotionBadgeText}>
                              -{item.discount}%
                            </Text>
                          </View>
                          <Text style={styles.promotionItemCode}>
                            {item.code}
                          </Text>
                        </View>

                        <Text style={styles.promotionItemDescription}>
                          Giảm {item.discount}% giá trị đơn hàng
                        </Text>

                        <View style={styles.promotionItemFooter}>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="#666"
                          />
                          <Text style={styles.promotionItemValidity}>
                            HSD: {dayjs(item.endDate).format("DD/MM/YYYY")}
                          </Text>
                        </View>
                      </View>

                      {promotion?.code === item.code && (
                        <View style={styles.promotionSelectedIcon}>
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#835101"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyPromotionContainer}>
                  <Ionicons name="ticket-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyPromotionText}>
                    Không có mã khuyến mãi nào
                  </Text>
                </View>
              )}
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* Confirmation modal */}
      <Modal visible={confirmModalVisible} transparent animationType="fade">
        <BlurView intensity={60} style={styles.blurView}>
          <View style={styles.confirmModalContainer}>
            <View style={styles.confirmModalIcon}>
              <Ionicons name="wallet-outline" size={40} color="#835101" />
            </View>

            <Text style={styles.confirmModalTitle}>Xác nhận thanh toán</Text>

            <Text style={styles.confirmModalDescription}>
              Bạn có chắc chắn muốn thanh toán bằng WorkHive Wallet không?
            </Text>

            <View style={styles.confirmModalAmount}>
              <Text style={styles.confirmModalAmountLabel}>Số tiền:</Text>
              <Text style={styles.confirmModalAmountValue}>
                {formatCurrency(
                  promotion ? total - (promotion.discount / 100) * total : total
                )}
              </Text>
            </View>

            <View style={styles.confirmModalActions}>
              <TouchableOpacity
                style={styles.confirmModalCancelButton}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.confirmModalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmModalConfirmButton}
                onPress={() => {
                  setConfirmModalVisible(false);
                  proceedWithCheckout();
                }}
              >
                <Text style={styles.confirmModalConfirmText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  header: {
    position: "absolute",
    top: 36,
    left: 12,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: "#835101",
    padding: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  screenTitleContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },

  // Card shared styles
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  cardHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#835101",
    marginLeft: 8,
  },

  // User info section
  userInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  userInfoField: {
    flex: 1,
    marginRight: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },

  // Workspace details
  workspaceCard: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  workspaceImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  workspaceInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  workspaceName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  workspaceFeatures: {
    flexDirection: "column",
    gap: 4,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },

  // Booking time section
  bookingTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 12,
  },
  timeItem: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  timeValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },

  // Additional services
  additionalServicesContainer: {
    marginTop: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#EFEFEF",
    marginVertical: 12,
  },
  additionalServicesTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#835101",
    marginBottom: 12,
  },
  serviceSection: {
    marginBottom: 12,
  },
  serviceSectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#555",
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  serviceItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  serviceItemImage: {
    width: 36,
    height: 36,
    borderRadius: 4,
    marginRight: 8,
  },
  serviceItemName: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  serviceItemPrice: {
    fontSize: 13,
    color: "#666",
  },
  serviceItemQuantity: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Payment summary section
  promotionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    borderStyle: "dashed",
  },
  promotionButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  promotionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#835101",
    marginLeft: 8,
  },
  priceBreakdown: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  discountValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FF6B6B",
  },
  divider: {
    height: 1,
    backgroundColor: "#EFEFEF",
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#835101",
  },

  // Payment methods
  paymentMethodCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  paymentMethodCardSelected: {
    borderColor: "#835101",
    borderWidth: 1.5,
    backgroundColor: "#FFF8F0",
  },
  paymentMethodHeader: {
    flexDirection: "row",
  },
  radioContainer: {
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentMethodContent: {
    flex: 1,
  },
  paymentMethodMain: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  paymentMethodImage: {
    width: 60,
    height: 24,
    marginRight: 12,
  },
  walletMethodImage: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  paymentMethodText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  paymentMethodSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  // Checkout button
  checkoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#835101",
    paddingVertical: 16,
    marginHorizontal: 12,
    marginBottom: 32,
    borderRadius: 12,
    shadowColor: "#835101",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },

  // Modal styles
  blurView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#835101",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  modalCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  promotionList: {
    maxHeight: 350,
  },
  promotionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  promotionItemSelected: {
    borderColor: "#835101",
    borderWidth: 1.5,
    backgroundColor: "#FFF8F0",
  },
  promotionItemContent: {
    flex: 1,
  },
  promotionItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  promotionBadge: {
    backgroundColor: "#835101",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  promotionBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  promotionItemCode: {
    fontSize: 16,
    fontWeight: "bold",
  },
  promotionItemDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  promotionItemFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  promotionItemValidity: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  promotionSelectedIcon: {
    marginLeft: 8,
  },
  emptyPromotionContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyPromotionText: {
    fontSize: 14,
    color: "#999",
    marginTop: 16,
  },

  // Confirmation modal
  confirmModalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  confirmModalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  confirmModalDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  confirmModalAmount: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  confirmModalAmountLabel: {
    fontSize: 14,
    color: "#666",
  },
  confirmModalAmountValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#835101",
  },
  confirmModalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  confirmModalCancelButton: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#835101",
  },
  confirmModalCancelText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#835101",
  },
  confirmModalConfirmButton: {
    flex: 1,
    backgroundColor: "#835101",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
    shadowColor: "#835101",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmModalConfirmText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default Checkout;

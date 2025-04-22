import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TextInput,
  Modal,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { WebView } from 'react-native-webview';
import * as Linking from 'expo-linking';

const WalletScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userData, userToken } = useContext(AuthContext);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [rawAmount, setRawAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("wallet");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentWebViewVisible, setPaymentWebViewVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [orderCode, setOrderCode] = useState(null);
  const [customerWalletId, setCustomerWalletId] = useState(null);

  const predefinedAmounts = [100000, 200000, 500000, 1000000];

  // Refresh wallet when coming back to this screen with a refresh param
  useEffect(() => {
    if (route.params?.refresh) {
      const refreshData = async () => {
        await fetchBalance();
        await fetchTransactions();
      };
      refreshData();
    }
  }, [route.params]);

  useEffect(() => {
    const loadData = async () => {
      await fetchBalance();
      await fetchTransactions();
    };

    loadData();
  }, [userData, userToken, fetchBalance, fetchTransactions]);

  // Handle deep links for payment callbacks
  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);

  const handleDeepLink = useCallback(async (event) => {
    const { url } = event;
    if (!url) return;

    const lowerUrl = url.toLowerCase();

    // Success case
    if (lowerUrl.includes('mobile://success') || 
        lowerUrl.includes('status=success') || 
        lowerUrl.includes('status=paid')) {
      
      try {
        const storedAmount = await AsyncStorage.getItem("amount");
        setPaymentWebViewVisible(false);
        
        Alert.alert(
          "Nạp tiền thành công",
          `Bạn đã nạp thành công ${storedAmount} vào ví WorkHive`,
          [{ text: "OK", onPress: () => {
            fetchBalance();
            fetchTransactions();
          }}]
        );
        
        await AsyncStorage.removeItem("customerWalletId");
        await AsyncStorage.removeItem("orderCode");
        await AsyncStorage.removeItem("amount");
      } catch (error) {
        console.error("Error handling success deeplink:", error);
      }
    }
    
    // Cancel/Failure case
    if (lowerUrl.includes('mobile://cancel') || 
        lowerUrl.includes('status=cancel') || 
        lowerUrl.includes('cancel=true')) {
      
      setPaymentWebViewVisible(false);
      
      // Navigate to fail screen with wallet parameters
      navigation.navigate("Trang chủ", {
        screen: "FailPage",
        params: {
          source: 'wallet',
          customerWalletId,
          orderCode
        }
      });
    }
  }, [navigation, fetchBalance, fetchTransactions, customerWalletId, orderCode]);

  const fetchBalance = useCallback(async () => {
    if (!userData || !userData.sub) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://workhive.info.vn:8443/users/wallet/getamountwalletbyuserid?UserId=${userData.sub}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.data) {
        setBalance(response.data.amount);
      }
    } catch (error) {
      setError("Không thể tải thông tin ví. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [userData, userToken]);

  const fetchTransactions = useCallback(async () => {
    if (!userData || !userData.sub) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://workhive.info.vn:8443/users/wallet/getalltransactionhistorybyuserid/${userData.sub}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.data && response.data.userTransactionHistoryDTOs) {
        const formattedTransactions =
          response.data.userTransactionHistoryDTOs.map((tx, index) => {
            return {
              id: index + 1,
              type: tx.description.toLowerCase().includes("thanh toán")
                ? "payment"
                : tx.description.toLowerCase().includes("hoàn")
                  ? "refund"
                  : "deposit",
              amount: tx.amount,
              date: tx.created_At,
              paymentMethod: "Chuyển khoản ngân hàng",
              description: tx.description,
              status:
                tx.status === "PAID"
                  ? "Hoàn thành"
                  : tx.status === "Active"
                    ? "Hoàn tiền"
                    : "Thất bại",
            };
          });
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      setError("Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [userData, userToken]);

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setRawAmount(parseFloat(amount.replace(/[^0-9]/g, "")));
    setIsModalOpen(true);
  };

  const handleWebViewNavigationStateChange = (newNavState) => {
    const { url } = newNavState;
    
    // Handle mobile:// schemes
    if (url && url.startsWith('mobile://')) {
      handleDeepLink({ url });
      return;
    }
    
    // Success cases
    if (url && (
      url.toLowerCase().includes('success=true') ||
      url.toLowerCase().includes('status=success') ||
      url.toLowerCase().includes('status=paid')
    )) {
      handleDeepLink({ url });
      return;
    }
    
    // Cancel/Failure cases
    if (url && (
      url.toLowerCase().includes('cancel') ||
      url.toLowerCase().includes('status=cancel') ||
      url.toLowerCase().includes('fail')
    )) {
      handleDeepLink({ url });
      return;
    }
  };

  const confirmDeposit = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert("Lỗi", "Vui lòng chọn phương thức thanh toán");
      return;
    }

    setIsModalOpen(false);
    setLoading(true);

    try {
      // Create a properly formatted request payload with explicit string conversion of amount
      const requestPayload = {
        userId: Number(userData.sub),
        amount: rawAmount.toString()  // Ensure amount is a string
      };

      console.log("Sending request with payload:", JSON.stringify(requestPayload));

      const response = await axios.post(
        `https://workhive.info.vn:8443/users/wallet/userdepositformobile`,
        requestPayload,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API response received:", JSON.stringify(response.data));

      if (response.data && response.data.checkoutUrl) {
        await AsyncStorage.setItem("customerWalletId", String(response.data.customerWalletId || ""));
        await AsyncStorage.setItem("orderCode", String(response.data.orderCode || ""));
        await AsyncStorage.setItem("amount", String(rawAmount));
        
        // Set the state values for direct use in this component
        setCustomerWalletId(response.data.customerWalletId);
        setOrderCode(response.data.orderCode);
        setPaymentUrl(response.data.checkoutUrl);
        setPaymentWebViewVisible(true);
      } else {
        throw new Error("Phản hồi không hợp lệ từ máy chủ");
      }
    } catch (error) {
      console.error("Lỗi khi nạp tiền:", error.response ? error.response.data : error.message);
      Alert.alert(
        "Lỗi",
        "Có lỗi xảy ra khi nạp tiền. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "";
    return value.toLocaleString("vi-VN") + " đ";
  };

  const handleAmountChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");

    if (numericValue === "") {
      setAmount("");
      setRawAmount(0);
      return;
    }

    const numberValue = parseInt(numericValue, 10);
    setRawAmount(numberValue);
    setAmount(formatCurrency(numberValue));
  };

  const selectPredefinedAmount = (value) => {
    setRawAmount(value);
    setAmount(formatCurrency(value));
  };

  const renderTransactionItem = ({ item }) => {
    const isIncoming = item.type === "deposit" || item.type === "refund";

    return (
      <View style={styles.transactionItem}>
        <View
          style={[
            styles.transactionIcon,
            { backgroundColor: isIncoming ? "#E6F7ED" : "#FFEBEE" },
          ]}
        >
          <Icon
            name={isIncoming ? "arrow-downward" : "arrow-upward"}
            size={20}
            color={isIncoming ? "#4CAF50" : "#F44336"}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>
            {item.type === "payment"
              ? "Thanh toán"
              : item.type === "refund"
                ? "Hoàn tiền"
                : "Nạp tiền"}
          </Text>
          <Text style={styles.transactionDate}>
            {new Date(item.date).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text
            style={[
              styles.amountText,
              { color: isIncoming ? "#4CAF50" : "#F44336" },
            ]}
          >
            {isIncoming ? "+" : "-"} {formatCurrency(item.amount)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "Hoàn thành" ? "#E6F7ED" : "#FFEBEE",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: item.status === "Hoàn thành" ? "#4CAF50" : "#F44336" },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ví WorkHive</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#835101" />
          <Text style={styles.loadingText}>Đang tải thông tin ví...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Payment WebView Modal
  const renderPaymentWebViewModal = () => (
    <Modal
      visible={paymentWebViewVisible}
      animationType="slide"
      onRequestClose={() => {
        Alert.alert(
          'Xác nhận hủy',
          'Bạn có chắc chắn muốn hủy giao dịch này?',
          [
            { text: 'Không', style: 'cancel' },
            { 
              text: 'Có', 
              onPress: () => {
                setPaymentWebViewVisible(false);
                navigation.navigate("Trang chủ", {
                  screen: "FailPage",
                  params: {
                    source: 'wallet',
                    customerWalletId,
                    orderCode
                  }
                });
              }
            },
          ]
        );
      }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              Alert.alert(
                'Xác nhận hủy',
                'Bạn có chắc chắn muốn hủy giao dịch này?',
                [
                  { text: 'Không', style: 'cancel' },
                  { 
                    text: 'Có', 
                    onPress: () => {
                      setPaymentWebViewVisible(false);
                      navigation.navigate("Trang chủ", {
                        screen: "FailPage",
                        params: {
                          source: 'wallet',
                          customerWalletId,
                          orderCode
                        }
                      });
                    }
                  },
                ]
              );
            }}
          >
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
          <View style={{ width: 40 }} />
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#835101" />
            <Text style={styles.loadingText}>Đang tải trang thanh toán...</Text>
          </View>
        )}
        
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          originWhitelist={['*', 'http://*', 'https://*', 'mobile://*']}
          onShouldStartLoadWithRequest={(request) => {
            // Handle mobile:// schemes explicitly
            if (request.url.startsWith('mobile://')) {
              // Process the URL directly here
              handleDeepLink({ url: request.url });
              // Return false to prevent WebView from trying to load this URL
              return false;
            }
            // Allow all other URLs to load
            return true;
          }}
          injectedJavaScript={`
            (function() {
              // Intercept all link clicks to handle mobile:// schemes
              document.addEventListener('click', function(e) {
                const anchor = e.target.closest('a');
                if (anchor && anchor.href && anchor.href.startsWith('mobile://')) {
                  e.preventDefault();
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'url_scheme',
                    url: anchor.href
                  }));
                  return false;
                }
              }, true);

              // Override window.open for mobile:// URLs
              (function() {
                const originalOpen = window.open;
                window.open = function(url) {
                  if (url && url.startsWith('mobile://')) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'url_scheme',
                      url: url
                    }));
                    return true;
                  }
                  return originalOpen.apply(this, arguments);
                };
              })();
            })();
          `}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'url_scheme' && data.url) {
                handleDeepLink({ url: data.url });
              }
            } catch (error) {
              console.error('WebView message parse error:', error);
            }
          }}
        />
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderPaymentWebViewModal()}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ví WorkHive</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "wallet" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("wallet")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "wallet" && styles.activeTabText,
            ]}
          >
            Ví của tôi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "history" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.activeTabText,
            ]}
          >
            Lịch sử giao dịch
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "wallet" ? (
        <ScrollView style={styles.content}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Icon name="wallet" size={24} color="#835101" />
              <Text style={styles.balanceTitle}>Số dư ví</Text>
            </View>
            <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={fetchBalance}
            >
              <Icon name="refresh" size={20} color="#835101" />
            </TouchableOpacity>
          </View>

          <View style={styles.depositSection}>
            <Text style={styles.sectionTitle}>Nạp tiền vào ví</Text>

            <View style={styles.amountInputContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="Nhập số tiền"
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
              />
              {amount !== "" && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setAmount("")}
                >
                  <Icon name="close" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.quickAmountLabel}>Chọn nhanh:</Text>
            <View style={styles.predefinedAmountsContainer}>
              {predefinedAmounts.map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.predefinedAmountButton,
                    rawAmount === value && styles.selectedAmountButton,
                  ]}
                  onPress={() => selectPredefinedAmount(value)}
                >
                  <Text
                    style={[
                      styles.predefinedAmountText,
                      rawAmount === value && styles.selectedAmountText,
                    ]}
                  >
                    {formatCurrency(value)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.depositButton,
                (!amount || parseFloat(amount.replace(/[^0-9]/g, "")) <= 0) &&
                  styles.disabledButton,
              ]}
              onPress={handleDeposit}
              disabled={
                !amount || parseFloat(amount.replace(/[^0-9]/g, "")) <= 0
              }
            >
              <Text style={styles.depositButtonText}>Nạp tiền</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Hướng dẫn sử dụng ví</Text>
            <View style={styles.helpItem}>
              <Icon
                name="info-outline"
                size={20}
                color="#835101"
                style={styles.helpIcon}
              />
              <Text style={styles.helpText}>
                Nạp tiền vào ví để thanh toán nhanh chóng cho các dịch vụ của
                WorkHive
              </Text>
            </View>
            <View style={styles.helpItem}>
              <Icon
                name="info-outline"
                size={20}
                color="#835101"
                style={styles.helpIcon}
              />
              <Text style={styles.helpText}>
                Số dư ví sẽ được cập nhật ngay sau khi giao dịch thành công
              </Text>
            </View>
            <View style={styles.helpItem}>
              <Icon
                name="info-outline"
                size={20}
                color="#835101"
                style={styles.helpIcon}
              />
              <Text style={styles.helpText}>
                Liên hệ hỗ trợ nếu bạn gặp vấn đề với giao dịch
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.historyContainer}>
          {transactions.length > 0 ? (
            <FlatList
              data={transactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.transactionsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="receipt-long" size={60} color="#CCCCCC" />
              <Text style={styles.emptyStateText}>Chưa có giao dịch nào</Text>
              <Text style={styles.emptyStateSubtext}>
                Các giao dịch của bạn sẽ hiển thị ở đây
              </Text>
            </View>
          )}
        </View>
      )}
{/* phuong thuc thanh toan */}
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn phương thức thanh toán</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalAmountText}>
              Số tiền nạp:{" "}
              <Text style={styles.modalAmountValue}>
                {formatCurrency(rawAmount)}
              </Text>
            </Text>

            <View style={styles.paymentMethodsContainer}>
              <TouchableOpacity
                style={[
                  styles.paymentMethodButton,
                  selectedPaymentMethod === "Chuyển khoản ngân hàng" &&
                    styles.selectedPaymentMethod,
                ]}
                onPress={() =>
                  setSelectedPaymentMethod("Chuyển khoản ngân hàng")
                }
              >
                <Image
                  source={require("../../assets/images/vietqr.png")}
                  style={styles.paymentMethodIcon}
                />
                <Text style={styles.paymentMethodText}>
                  Chuyển khoản ngân hàng
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  !selectedPaymentMethod && styles.disabledButton,
                ]}
                onPress={confirmDeposit}
                disabled={!selectedPaymentMethod}
              >
                <Text style={styles.confirmButtonText}>
                  Xác nhận thanh toán
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  tabButton: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: "#835101",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#835101",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#835101",
  },
  refreshButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  depositSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  amountInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  quickAmountLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  predefinedAmountsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  predefinedAmountButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedAmountButton: {
    borderColor: "#835101",
    backgroundColor: "#f8f1e7",
  },
  predefinedAmountText: {
    fontSize: 14,
    color: "#666",
  },
  selectedAmountText: {
    color: "#835101",
    fontWeight: "500",
  },
  depositButton: {
    backgroundColor: "#835101",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  depositButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.7,
  },
  helpSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  helpItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  helpIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  historyContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  transactionsList: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: "#666",
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 16,
    color: "#333",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalAmountText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
  },
  modalAmountValue: {
    fontWeight: "bold",
    color: "#835101",
  },
  paymentMethodsContainer: {
   

    marginBottom: 24,
  },
  paymentMethodButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  selectedPaymentMethod: {
    borderColor: "#835101",
    backgroundColor: "#f8f1e7",
  },
  paymentMethodIcon: {
    width: 190,
    height: 60,
    marginBottom: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#835101",
    marginLeft: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default WalletScreen;

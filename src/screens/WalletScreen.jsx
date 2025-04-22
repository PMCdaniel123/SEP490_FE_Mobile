import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import * as Linking from 'expo-linking';
import { Ionicons } from "@expo/vector-icons";

// Import wallet components
import {
  WalletHeader,
  BalanceCard,
  DepositSection,
  TransactionHistory,
  WalletTabs,
  PaymentMethodModal,
  PaymentWebViewModal,
  BankInfoForm,
  WithdrawalRequest
} from '../components/wallet';

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
  const [bankInfo, setBankInfo] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isWalletLocked, setIsWalletLocked] = useState(false);

  const predefinedAmounts = [100000, 200000, 500000, 1000000];

  // Refresh wallet when coming back to this screen with a refresh param
  useEffect(() => {
    if (route.params?.refresh) {
      const refreshData = async () => {
        await fetchBalance();
        await fetchTransactions();
        await fetchBankInfo();
      };
      refreshData();
    }
  }, [route.params]);

  useEffect(() => {
    const loadData = async () => {
      await fetchBalance();
      await fetchTransactions();
      await fetchBankInfo();
    };

    loadData();
  }, [userData, userToken]);

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
  }, [navigation, customerWalletId, orderCode]);

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

  const fetchBankInfo = useCallback(async () => {
    if (!userData || !userData.sub) return;

    try {
      const response = await axios.get(
        `https://workhive.info.vn:8443/users/wallet/getcustomerwalletinformation/${userData.sub}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.data) {
        setBankInfo({
          bankName: response.data.bankName || '',
          bankNumber: response.data.bankNumber || '',
          bankAccountName: response.data.bankAccountName || ''
        });
        
        // Check if wallet is locked
        if (response.data.isLock === 1) {
          setIsWalletLocked(true);
        } else {
          setIsWalletLocked(false);
        }
      }
    } catch (error) {
      // 404 means no bank info yet, which is ok
      if (error.response && error.response.status !== 404) {
        console.error('Error fetching bank info:', error);
      }
      setIsWalletLocked(false); // Reset lock status on error
    }
  }, [userData, userToken]);

  const handleDeposit = () => {
    if (!amount || parseFloat(amount.replace(/[^0-9]/g, "")) <= 0) {
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

  const handleBankInfoUpdated = (info) => {
    setBankInfo(info);
    fetchBankInfo();
  };

  const handleWithdrawalSuccess = () => {
    // Refresh all wallet data to reflect possible changes 
    // in balance, transactions, and lock status
    fetchBalance();
    fetchTransactions();
    fetchBankInfo(); // This will update the isWalletLocked state
  };

  if (loading && transactions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <WalletHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#835101" />
          <Text style={styles.loadingText}>Đang tải thông tin ví...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PaymentWebViewModal 
        isVisible={paymentWebViewVisible}
        onClose={() => setPaymentWebViewVisible(false)}
        paymentUrl={paymentUrl}
        loading={loading}
        setLoading={setLoading}
        customerWalletId={customerWalletId}
        orderCode={orderCode}
        onWebViewNavigationStateChange={handleWebViewNavigationStateChange}
      />
      
      <WalletHeader />
      <WalletTabs activeTab={activeTab} setActiveTab={setActiveTab} isWalletLocked={isWalletLocked} />
      
      {isWalletLocked && (
        <View style={styles.lockedBanner}>
          <Ionicons name="warning-outline" size={20} color="#B45309" />
          <Text style={styles.lockedBannerText}>Ví của bạn đang bị khóa.</Text>
        </View>
      )}

      {activeTab === "wallet" && (
        <ScrollView style={styles.content}>
          <BalanceCard 
            balance={balance} 
            onRefresh={fetchBalance} 
            formatCurrency={formatCurrency} 
          />
          
          <DepositSection 
            amount={amount}
            onAmountChange={handleAmountChange}
            onDeposit={handleDeposit}
            rawAmount={rawAmount}
            predefinedAmounts={predefinedAmounts}
            formatCurrency={formatCurrency}
            selectPredefinedAmount={selectPredefinedAmount}
            isWalletLocked={isWalletLocked}
          />
        </ScrollView>
      )}
      
      {activeTab === "history" && (
        <View style={styles.historyContainer}>
          <TransactionHistory 
            transactions={transactions}
            formatCurrency={formatCurrency}
          />
        </View>
      )}
      
      {activeTab === "bankInfo" && (
        <View style={styles.content}>
          <BankInfoForm
            onBankInfoUpdated={handleBankInfoUpdated}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
          />
        </View>
      )}
      
      {activeTab === "withdrawal" && (
        <View style={styles.content}>
          <WithdrawalRequest
            balance={balance}
            bankInfo={bankInfo}
            onBankInfoTabClick={() => setActiveTab("bankInfo")}
            onWithdrawalSuccess={handleWithdrawalSuccess}
          />
        </View>
      )}

      <PaymentMethodModal 
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rawAmount={rawAmount}
        formatCurrency={formatCurrency}
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
        onConfirm={confirmDeposit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
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
  content: {
    flex: 1,
    padding: 16,
  },
  historyContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  lockedBannerText: {
    marginLeft: 10,
    color: '#B45309',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

export default WalletScreen;

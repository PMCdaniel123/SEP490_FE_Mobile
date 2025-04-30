import { useRoute, useNavigation } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const FailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { OrderCode, BookingId, source, customerWalletId, workspaceId } = route.params || {};
  
  console.log("FailScreen received params:", JSON.stringify(route.params));

  // Check if this is a wallet-related failure or a booking failure
  const isWalletFailure = source === 'wallet' || (route.params && !BookingId && customerWalletId);

  const handleGoHome = () => {
    navigation.navigate("HomeMain");
  };

  useEffect(() => {
    const handleFailure = async () => {
      if (isWalletFailure) {
        // Handle wallet deposit failure
        try {
          // Clear any stored wallet transaction data
          await AsyncStorage.removeItem("customerWalletId");
          await AsyncStorage.removeItem("orderCode");
          await AsyncStorage.removeItem("amount");
        } catch (error) {
          console.error("Error clearing wallet transaction data:", error);
        }
      } else if (OrderCode !== null && BookingId !== null) {
        // Handle booking failure
        try {
          await axios.put(
            `https://workhive.info.vn:8443/users/booking/updatetimestatus`,
            {
              bookingId: BookingId,
              orderCode: OrderCode,
            }
          );
        } catch (error) {
          console.error("Error updating workspace time status:", error);
        }
      }
    };

    handleFailure();
  }, [OrderCode, BookingId, isWalletFailure]);

  return (
    <View style={styles.container}>
      <View style={styles.failCard}>
        <Ionicons
          name="close-circle"
          size={80}
          color="#FF3B30"
          style={styles.icon}
        />
        <Text style={styles.title}>Thanh toán thất bại!</Text>
        
        {isWalletFailure && (
          <Text style={styles.message}>
            Nạp tiền vào ví WorkHive không thành công. Vui lòng thử lại sau.
          </Text>
        )}
        
        {!isWalletFailure && (
          <Text style={styles.message}>
            Đặt chỗ không thành công. Vui lòng thử lại sau.
          </Text>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleGoHome}
          >
            <Text style={styles.primaryButtonText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  failCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF3B30",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  button: {
    backgroundColor: "#835101",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#835101",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FailScreen;

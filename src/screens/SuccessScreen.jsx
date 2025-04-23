import { useRoute, useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { usePushNotifications } from "../../usePushNotification";

const SuccessScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { OrderCode, BookingId } = route.params || {};
  const { expoPushToken, notification } = usePushNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const handleNotification = async () => {
      const data = {
        fcmToken: expoPushToken?.data ?? "",
        title: "Thanh toán thành công",
        body: "Cảm ơn bạn đã sử dụng dịch vụ của WorkHive. Chúc bạn có những trải nghiệm thật tuyệt vời!!!",
      };
      console.log(data);
      try {
        await axios.post(
          `https://workhive.info.vn:8443/sendnotificationformobile`,
          {
            ...data,
          }
        );
        setLoading(false);
      } catch (error) {
        alert(error);
        setLoading(false);
      }
    };
    handleNotification();
  }, [expoPushToken]);

  const handleGoHome = () => {
    navigation.navigate("HomeMain");
  };

  const handleViewBooking = () => {
    navigation.navigate("Đặt chỗ", { screen: "YourBooking" });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.successCard}>
        <Ionicons
          name="checkmark-circle"
          size={80}
          color="#4CAF50"
          style={styles.icon}
        />
        <Text style={styles.title}>Thanh toán thành công!</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleViewBooking}>
            <Text style={styles.buttonText}>Xem đặt chỗ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleGoHome}
          >
            <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  successCard: {
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
    color: "#333",
    marginBottom: 24,
    textAlign: "center",
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
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#835101",
  },
  secondaryButtonText: {
    color: "#835101",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SuccessScreen;

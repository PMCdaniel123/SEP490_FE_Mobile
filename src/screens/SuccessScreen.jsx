import { useNavigation } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LottieView from "lottie-react-native";

const SuccessScreen = () => {
  const navigation = useNavigation();

  const handleGoHome = () => {
    navigation.navigate("HomeMain");
  };

  const handleViewBooking = () => {
    navigation.navigate("Đặt chỗ", { screen: "YourBooking" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.successCard}>
        <LottieView
          source={require("../../assets/animations/success.json")}
          autoPlay
          loop
          style={styles.lottie}
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
  lottie: {
    width: 200,
    height: 200,
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

import { useRoute } from "@react-navigation/native";

const CheckoutSuccessScreen = () => {
  const route = useRoute();
  const { OrderCode, BookingId } = route.params || {};

  return (
    <View>
      <Text>Checkout Successful 🎉</Text>
      <Text>Order Code: {OrderCode}</Text>
      <Text>Booking ID: {BookingId}</Text>
    </View>
  );
};

export default CheckoutSuccessScreen;

import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
} from "react-native";
import { formatCurrency } from "../../constants";
import { useState, useRef, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import { BlurView } from "expo-blur";
import { MaterialIcons } from "@expo/vector-icons";

function AmenityItem({ amenity }) {
  const [modalVisible, setModalVisible] = useState(false);
  const { dispatch, state } = useCart();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  
  const isInCart = state.amenityList.some((item) => item.id === amenity.id);

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      modalScaleAnim.setValue(0);
    }
  }, [modalVisible, modalScaleAnim]);

  const handleAddToCart = () => {
    animatePress();
    dispatch({
      type: "ADD_AMENITY",
      payload: {
        id: amenity.id,
        name: amenity.name,
        imgUrl: amenity.imgUrl,
        price: amenity.price,
        quantity: 1,
      },
    });
    dispatch({ type: "CALCULATE_TOTAL" });
    setModalVisible(false);
  };

  return (
    <>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.card, isInCart && styles.cardInCart]}
          onPress={() => {
            animatePress();
            setModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Image source={{ uri: amenity.imgUrl }} style={styles.image} />
          {isInCart && (
            <View style={styles.inCartBadge}>
              <MaterialIcons name="check-circle" size={20} color="#fff" />
            </View>
          )}
          <View style={styles.info}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatCurrency(amenity.price)}</Text>
              <Text style={styles.priceUnit}>/đơn vị</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {amenity.name}
            </Text>
            <View style={styles.detailRow}>
              <MaterialIcons name="category" size={14} color="#666" />
              <Text style={styles.detail} numberOfLines={1}>
                {amenity.category}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="inventory" size={14} color="#666" />
              <Text style={styles.detail} numberOfLines={1}>
                Còn {amenity.quantity}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={modalVisible} transparent animationType="none">
        <BlurView intensity={60} style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [
                  { scale: modalScaleAnim },
                  {
                    translateY: modalScaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            
            <Image source={{ uri: amenity.imgUrl }} style={styles.modalImage} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{amenity.name}</Text>
              <Text style={styles.modalPrice}>
                {formatCurrency(amenity.price)}
                <Text style={styles.modalPriceUnit}>/đơn vị</Text>
              </Text>
            </View>

            <View style={styles.modalDetails}>
              <View style={styles.modalDetailRow}>
                <MaterialIcons name="category" size={20} color="#835101" />
                <Text style={styles.modalDetailText}>
                  Loại: {amenity.category}
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <MaterialIcons name="inventory" size={20} color="#835101" />
                <Text style={styles.modalDetailText}>
                  Số lượng còn lại: {amenity.quantity}
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <MaterialIcons name="description" size={20} color="#835101" />
                <Text style={styles.modalDetailText}>
                  {amenity.description || "Không có mô tả"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.modalButton, isInCart && styles.modalButtonInCart]}
              onPress={handleAddToCart}
              disabled={isInCart}
            >
              <MaterialIcons 
                name={isInCart ? "check-circle" : "add-shopping-cart"} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.modalButtonText}>
                {isInCart ? "Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </BlurView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    marginRight: 12,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  cardInCart: {
    borderColor: "#835101",
    borderWidth: 2,
  },
  image: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  inCartBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#835101",
    borderRadius: 12,
    padding: 4,
  },
  info: {
    padding: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#835101",
  },
  priceUnit: {
    fontSize: 12,
    color: "#666",
    marginLeft: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  detail: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "90%",
    maxWidth: 400,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 4,
  },
  modalImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#835101",
  },
  modalPriceUnit: {
    fontSize: 14,
    color: "#666",
    fontWeight: "normal",
  },
  modalDetails: {
    padding: 16,
    gap: 12,
  },
  modalDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalDetailText: {
    fontSize: 14,
    color: "#444",
    flex: 1,
  },
  modalButton: {
    backgroundColor: "#835101",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  modalButtonInCart: {
    backgroundColor: "#4CAF50",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AmenityItem;

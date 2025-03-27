import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatCurrency } from "../../constants";
import { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { BlurView } from "expo-blur";

function AmenityItem({ amenity }) {
  const [modalVisible, setModalVisible] = useState(false);
  const { dispatch } = useCart();

  const handleAddToCart = () => {
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
      <TouchableOpacity
        style={styles.card}
        onPress={() => setModalVisible(true)}
      >
        <Image source={{ uri: amenity.imgUrl }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.price}>{formatCurrency(amenity.price)}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {amenity.name}
          </Text>
          <Text style={styles.detail} numberOfLines={1}>
            Loại: {amenity.category}
          </Text>
          <Text style={styles.detail} numberOfLines={1}>
            Số lượng: {amenity.quantity}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <BlurView intensity={60} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Image source={{ uri: amenity.imgUrl }} style={styles.modalImage} />
            <Text style={styles.modalTitle}>{amenity.name}</Text>
            <Text style={styles.modalText}>Loại: {amenity.category}</Text>
            <Text style={styles.modalText}>
              Đơn giá: {formatCurrency(amenity.price)}
            </Text>
            <Text style={styles.modalText}>Số lượng: {amenity.quantity}</Text>
            <Text style={styles.modalText}>
              Mô tả: {amenity.description || "Không có mô tả"}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.modalButtonText}>📌 Thêm vào giỏ hàng</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  detail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#835101",
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    width: 300,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  modalImage: {
    width: 210,
    height: 210,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 6,
    color: "#555",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FF4D4D",
    width: 26,
    height: 26,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  modalButton: {
    marginTop: 16,
    backgroundColor: "#835101",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AmenityItem;

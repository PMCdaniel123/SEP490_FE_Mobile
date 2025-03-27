import React from "react";
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

const ImageList = ({ images, onBackPress }) => {
  if (!images || images.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={{ backgroundColor: "#835101", padding: 8, borderRadius: 50 }}
          onPress={onBackPress}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: "#835101", padding: 8, borderRadius: 50 }}
        >
          <Ionicons name="share-social" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {images.map((image) => (
          <Image
            key={image.id}
            source={{ uri: image.imgUrl }}
            style={styles.image}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  header: {
    position: "absolute",
    top: 20,
    left: 10,
    right: 10,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  image: {
    width: screenWidth,
    height: 300,
    resizeMode: "cover",
  },
});

export default ImageList;

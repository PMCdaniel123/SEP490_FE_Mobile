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

const ImageList = ({ images, onBackPress, onHomePress }) => {
  if (!images || images.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onBackPress}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onHomePress}
          >
            <Ionicons name="home" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.iconButton}
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
    top: 30,
    left: 10,
    right: 10,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftButtons: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    backgroundColor: "#835101", 
    padding: 8, 
    borderRadius: 50,
  },
  image: {
    width: screenWidth,
    height: 300,
    resizeMode: "cover",
  },
});

export default ImageList;

import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function HorizontalCard({
  name,
  image,
  rating,
  origin,
  isFavorite,
  onFavoritePress,
  onPress,
  isTopOfTheWeek,
}) {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= rating ? "star" : "star-o"}
          size={16}
          color="#FFD700"
          style={styles.star}
        />
      );
    }
    return stars;
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.description}>
          {renderStars()} {rating}
        </Text>
        <Text style={styles.description}>{origin}</Text>
        <View style={styles.footer}>
          {isTopOfTheWeek && (
            <Text style={styles.topOfWeek}>⚡ Top Of The Week</Text>
          )}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onFavoritePress(name)}
          >
            <Icon
              name={isFavorite ? "heart" : "heart-o"}
              size={24}
              color="red"
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    position: "relative",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topOfWeek: {
    fontSize: 16,
    fontWeight: "bold",
    borderRadius: 12,
    color: "#B22222",
  },
  favoriteButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(255, 0, 0, 0.05)",
    borderRadius: 20,
    padding: 10,
  },
});

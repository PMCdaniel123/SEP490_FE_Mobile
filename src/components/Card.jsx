import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function Card({
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
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image }}
          style={styles.playerImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onFavoritePress(name)}
        >
          <Icon name={isFavorite ? "heart" : "heart-o"} size={24} color="red" />
        </TouchableOpacity>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{name}</Text>
        {isTopOfTheWeek && (
          <Text style={styles.captainText}>⚡ Top Of The Week</Text>
        )}
        <Text style={styles.position}>{origin}</Text>
        <Text style={styles.stats}>
          {renderStars()} {rating}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginTop: 20,
    width: "48%",
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
  },
  playerImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  favoriteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    borderRadius: 20,
    padding: 10,
  },
  playerInfo: {
    paddingVertical: 10,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  position: {
    fontSize: 14,
    color: "#444",
    marginBottom: 5,
  },
  stats: {
    fontSize: 12,
    color: "#666",
  },
  captainText: {
    fontSize: 16,
    fontWeight: "bold",
    borderRadius: 12,
    paddingVertical: 4,
    color: "#B22222",
    marginBottom: 5,
  },
});

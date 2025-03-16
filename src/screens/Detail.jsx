import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useState, useEffect } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { FavoritesContext } from "../contexts/favoritesContext";

export default function Detail({ route }) {
  const { data } = route.params;
  const { favorites, addToFavorites, alertRemoveItemFromFavorites } =
    useContext(FavoritesContext);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorite = favorites.some((favor) => favor.name === data.name);
    setIsFavorite(favorite);
  }, [favorites, data]);

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      alertRemoveItemFromFavorites(data.name);
      return;
    } else {
      addToFavorites(data);
    }
    setIsFavorite(!isFavorite);
  };

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No data available</Text>
      </View>
    );
  }

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= data.rating ? "star" : "star-o"}
          size={16}
          color="#FFD700"
          style={styles.star}
        />
      );
    }
    return stars;
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: data.image }}
        style={styles.playerImage}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.playerName}>{data.name}</Text>
        <Text style={styles.text}>Weight: {data.weight}</Text>
        <Text style={styles.text}>
          Rating: {renderStars()} {data.rating}
        </Text>
        <Text style={styles.text}>Price: {data.price}</Text>
        <Text style={styles.text}>Color: {data.color}</Text>
        <Text style={styles.text}>Bonus: {data.bonus}</Text>
        <Text style={styles.text}>Origin: {data.origin}</Text>
        {data.isTopOfTheWeek && (
          <Text style={styles.captainText}>⚡ Top of The Week</Text>
        )}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoriteToggle}
        >
          <Icon name={isFavorite ? "heart" : "heart-o"} size={24} color="red" />
          <Text style={styles.favoriteButtonText}>
            {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFDDDD",
  },
  errorText: {
    fontSize: 18,
    color: "#FF3333",
    fontWeight: "bold",
  },
  playerImage: {
    width: "100%",
    height: 400,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
  },
  infoContainer: {
    padding: 25,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    elevation: 8,
  },
  playerName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000",
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
    color: "#666",
  },
  captainText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
    padding: 6,
    alignSelf: "flex-start",
    borderRadius: 12,
    color: "#B22222",
    textShadowColor: "#FFF",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  favoriteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    alignSelf: "flex-start",
  },
  favoriteButtonText: {
    fontSize: 18,
    color: "#000",
    marginLeft: 10,
  },
});

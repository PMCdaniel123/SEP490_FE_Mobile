import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { FavoritesContext } from "../contexts/favoritesContext";
import Card from "../components/Card";

export default function Favorite() {
  const navigation = useNavigation();
  const {
    favorites,
    addToFavorites,
    alertRemoveItemFromFavorites,
    alertRemoveAllFromFavorites,
  } = useContext(FavoritesContext);  

  const handleCardPress = (item) => {
    navigation.navigate("Detail", { data: item });
  };

  const handleFavoritePress = (name) => {
    const selectedItem = favorites.find((item) => item.name === name);

    if (!selectedItem) {
      console.log("Item not found");
      return;
    }
    if (favorites.some((p) => p.name === name)) {
      alertRemoveItemFromFavorites(name);
    } else {
      addToFavorites(selectedItem);
    }
  };

  const handleRemoveAll = () => {
    alertRemoveAllFromFavorites();
  };

  const renderItem = ({ item }) => (
    <Card
      {...item}
      isFavorite={favorites.some((favorite) => favorite.name === item.name)}
      onFavoritePress={handleFavoritePress}
      onPress={() => handleCardPress(item)}
    />
  );

  if (favorites?.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>You don't have any favorite!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {favorites?.length > 1 && (
        <TouchableOpacity style={styles.trashIcon} onPress={handleRemoveAll}>
          <Icon name="trash" size={30} color="red" />
        </TouchableOpacity>
      )}
      <FlatList
        data={favorites}
        keyExtractor={(item, index) => `${index}-${item.name}`}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 10,
  },
  row: {
    justifyContent: "space-between",
  },
  trashIcon: {
    position: "absolute",
    right: 20,
    bottom: 20,
    zIndex: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 50,
    elevation: 5,
  },
});

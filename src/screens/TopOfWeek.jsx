import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { FavoritesContext } from "../contexts/favoritesContext";
import Card from "../components/Card";

export default function TopOfWeek() {
  const navigation = useNavigation();
  const { favorites, addToFavorites, alertRemoveItemFromFavorites } =
    useContext(FavoritesContext);
  const [filterList, setFilterList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(
          "https://672239742108960b9cc37869.mockapi.io/flowershop"
        );
        const data = await response.json();

        const filteredItems = data
          .flatMap((section) => section.data)
          .filter((item) => item.isTopOfTheWeek)
          .sort((a, b) => b.rating - a.rating);

        setFilterList(filteredItems);
      } catch (error) {
        console.log("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleCardPress = (item) => {
    navigation.navigate("Detail", { data: item });
  };

  const handleFavoritePress = (name) => {
    const selectedItem = filterList.find((item) => item.name === name);

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

  const renderItem = ({ item }) => (
    <Card
      {...item}
      isFavorite={favorites.some((favorite) => favorite.name === item.name)}
      onFavoritePress={handleFavoritePress}
      onPress={() => handleCardPress(item)}
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Of The Week</Text>
      {filterList.length > 0 ? (
        <FlatList
          data={filterList}
          renderItem={renderItem}
          keyExtractor={(item, sectionIndex) => `${sectionIndex}-${item.id}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noCaptainsText}>
          No captains found over 34 years old.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    color: "#470101",
    textAlign: "center",
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
  noCaptainsText: {
    fontSize: 18,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
});

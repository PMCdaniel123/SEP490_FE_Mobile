import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ScrollView,
  SectionList,
  Image,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { FavoritesContext } from "../contexts/favoritesContext";
import HorizontalCard from "../components/HorizontalCard";

export default function Home() {
  const navigation = useNavigation();
  const {
    favorites,
    addToFavorites,
    alertRemoveItemFromFavorites,
  } = useContext(FavoritesContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setItems(items);
    }, [items])
  );

  const fetchItems = async () => {
    try {
      const response = await fetch(
        "https://672239742108960b9cc37869.mockapi.io/flowershop"
      );
      const data = await response.json();
      setItems(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data");
      setLoading(false);
    }
  };

  const handleFavoritePress = (name) => {
    const selectedItem = items
      .flatMap((section) => section.data)
      .find((item) => item.name === name);

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

  const handleCardPress = (item) => {
    navigation.navigate("Detail", { data: item });
  };

  const renderItem = ({ item }) => (
    <HorizontalCard
      {...item}
      isFavorite={favorites.some((favorite) => favorite.name === item.name)}
      onFavoritePress={handleFavoritePress}
      onPress={() => handleCardPress(item)}
    />
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={items}
        keyExtractor={(item, sectionIndex) => `${sectionIndex}-${item.id}`}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 8,
    elevation: 3,
  },
});

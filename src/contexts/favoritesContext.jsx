import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem("favorites");
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.log("Failed to load favorite:", error);
    }
  };

  const addToFavorites = async (favorite) => {
    try {
      const isFavorite = favorites.some((item) => item.name === favorite.name);

      if (!isFavorite) {
        const updatedFavorites = [...favorites, favorite];
        setFavorites(updatedFavorites);
        await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      } else {
        Alert.alert("Already in Favorites", `${favorite.name} is already added to favorites.`);
      }
    } catch (error) {
      console.log("Failed to add to favorites:", error);
    }
  };

  const alertRemoveItemFromFavorites = (name) => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to remove this item from favorites?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => removeItemFromFavorites(name) },
      ]
    );
  };

  const removeItemFromFavorites = async (name) => {
    try {
      const updatedFavorites = favorites.filter((p) => p.name !== name);
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    } catch (error) {
      console.log("Failed to remove item from favorites:", error);
    }
  };

  const alertRemoveAllFromFavorites = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to remove all from favorites?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => removeAllFavorites() },
      ]
    );
  };

  const removeAllFavorites = async () => {
    try {
      setFavorites([]);
      await AsyncStorage.removeItem("favorites");
    } catch (error) {
      console.log("Failed to remove all from favorites:", error);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeItemFromFavorites,
        removeAllFavorites,
        alertRemoveItemFromFavorites,
        alertRemoveAllFromFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const highRatedSpaces = [
  {
    id: '1',
    name: 'Bàn cơ bản',
    location: 'Le Van Viet, Thu Duc',
    price: '30k/1 giờ',
    rating: 4.5,
    image: require('../../assets/images/workspace1.jpg'),
  },
  {
    id: '2',
    name: 'Opal Grove Inn',
    location: 'Le Van Viet, Thu Duc',
    price: '30k/1 giờ',
    rating: 4.5,
    image: require('../../assets/images/workspace2.jpg'),
  },
];

const HighRatedSpaces = () => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Không gian được đánh giá cao</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {highRatedSpaces.map((space) => (
          <TouchableOpacity key={space.id} style={styles.spaceCard}>
            <Image source={space.image} style={styles.spaceImage} />
            <TouchableOpacity style={styles.favoriteButton}>
              <Icon name="favorite-border" size={20} color="#FF5A5F" />
            </TouchableOpacity>
            <View style={styles.spaceInfo}>
              <Text style={styles.spaceName}>{space.name}</Text>
              <Text style={styles.spaceLocation}>{space.location}</Text>
              <View style={styles.priceRatingContainer}>
                <Text style={styles.spacePrice}>{space.price}</Text>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{space.rating}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#B25F00',
    fontWeight: '500',
  },
  spaceCard: {
    width: 250,
    marginLeft: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  spaceImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
  },
  spaceInfo: {
    padding: 12,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  spaceLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spacePrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
});

export default HighRatedSpaces;
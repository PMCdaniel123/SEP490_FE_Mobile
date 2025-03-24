import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const recommendedSpaces = [
  {
    id: '1',
    name: 'Bàn cơ bản',
    location: 'Tầng 5, 195 Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP. Hồ Chí Minh',
    price: '35K/1 Giờ',
    rating: 4.0,
    image: require('../../assets/images/workspace2.jpg'),
  },
];

const Recommendations = () => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Đề xuất dành cho bạn</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={[styles.filterButton, styles.activeFilterButton]}>
          <Text style={styles.activeFilterText}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Bàn đơn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Phòng họp</Text>
        </TouchableOpacity>
      </View>

      {/* Recommended Spaces List */}
      {recommendedSpaces.map((space) => (
        <TouchableOpacity key={space.id} style={styles.listItemCard}>
          <Image source={space.image} style={styles.listItemImage} />
          <View style={styles.listItemInfo}>
            <Text style={styles.listItemName}>{space.name}</Text>
            <View style={styles.listItemLocation}>
              <Icon name="location-on" size={14} color="#666" />
              <Text style={styles.listItemLocationText} numberOfLines={2}>
                {space.location}
              </Text>
            </View>
            <View style={styles.listItemFooter}>
              <Text style={styles.listItemPrice}>{space.price}</Text>
              <View style={styles.listItemRating}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.listItemRatingText}>{space.rating}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  activeFilterButton: {
    backgroundColor: '#B25F00',
  },
  filterText: {
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '500',
  },
  listItemCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  listItemImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  listItemInfo: {
    flex: 1,
    padding: 12,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listItemLocation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listItemLocationText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    marginLeft: 4,
  },
  listItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  listItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemRatingText: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
});

export default Recommendations;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useState({
    Address: '',
    Category: '',
    Is24h: '',
    Capacity: '',
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { label: 'Tất cả', value: '' },
    { label: 'Bàn cá nhân', value: 'bàn cá nhân' },
    { label: 'Phòng họp', value: 'phòng họp' },
    { label: 'Văn phòng', value: 'văn phòng' },
    { label: 'Phòng hội thảo', value: 'phòng hội thảo' },
  ];

  const is24hOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Mở cửa 24/7', value: '1' },
    { label: 'Giờ mở cửa cố định', value: '0' },
  ];

  const capacityOptions = [
    { label: 'Tất cả', value: '' },
    { label: '1-2 người', value: '2' },
    { label: '3-4 người', value: '4' },
    { label: '5-10 người', value: '10' },
    { label: 'Trên 10 người', value: '11' },
  ];

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setShowFilters(false); 
    
    try {
      const queryParams = new URLSearchParams();
      
      if (searchParams.Address) {
        queryParams.append('Address', searchParams.Address);
      }
      
      if (searchParams.Category) {
        queryParams.append('Category', searchParams.Category);
      }
      
      if (searchParams.Is24h) {
        queryParams.append('Is24h', searchParams.Is24h);
      }
      
      if (searchParams.Capacity) {
        queryParams.append('Capacity', searchParams.Capacity);
      }

      const response = await axios.get(
        `http://35.78.210.59:8080/users/searchbyfourcriteria?${queryParams.toString()}`
      );
      
      if (response.data && response.data.workspaces) {
        setSearchResults(response.data.workspaces);
        setSearchParams({
          Address: searchParams.Address,
          Category: '',
          Is24h: '',
          Capacity: '',
        });
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const renderWorkspaceItem = ({ item }) => {
    const imageUrl = item.images && item.images.length > 0 
      ? item.images[0].imgUrl 
      : 'https://via.placeholder.com/150';

    const lowestPrice = item.prices && item.prices.length > 0
      ? Math.min(...item.prices.map(p => p.price))
      : 0;

    return (
      <TouchableOpacity 
        style={styles.workspaceItem}
        onPress={() => navigation.navigate('WorkspaceDetail', { id: item.id })}
      >
        <Image source={{ uri: imageUrl }} style={styles.workspaceImage} />
        <View style={styles.workspaceInfo}>
          <Text style={styles.workspaceName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.locationRow}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.workspaceAddress} numberOfLines={2}>{item.address}</Text>
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <Text style={styles.priceText}>Từ {lowestPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={styles.facilitiesRow}>
            {item.is24h === 1 && (
              <View style={styles.facilityBadge}>
                <Icon name="access-time" size={12} color="#835101" />
                <Text style={styles.facilityText}>24/7</Text>
              </View>
            )}
            <View style={styles.facilityBadge}>
              <Icon name="people" size={12} color="#835101" />
              <Text style={styles.facilityText}>Tối đa {item.capacity} người</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Nhập địa chỉ, khu vực..."
            value={searchParams.Address}
            onChangeText={(text) => setSearchParams({ ...searchParams, Address: text })}
          />
          {searchParams.Address !== '' && (
            <TouchableOpacity
              onPress={() => setSearchParams({ ...searchParams, Address: '' })}
              style={styles.clearButton}
            >
              <Icon name="clear" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.filterButtonsRow}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon name="filter-list" size={20} color="#835101" />
            <Text style={styles.filterButtonText}>Bộ lọc</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText}>Tìm kiếm</Text>
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filterLabel}>Loại không gian:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={searchParams.Category}
                onValueChange={(value) => setSearchParams({ ...searchParams, Category: value })}
                style={styles.picker}
              >
                {categories.map((category, index) => (
                  <Picker.Item key={index} label={category.label} value={category.value} />
                ))}
              </Picker>
            </View>

            <Text style={styles.filterLabel}>Thời gian hoạt động:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={searchParams.Is24h}
                onValueChange={(value) => setSearchParams({ ...searchParams, Is24h: value })}
                style={styles.picker}
              >
                {is24hOptions.map((option, index) => (
                  <Picker.Item key={index} label={option.label} value={option.value} />
                ))}
              </Picker>
            </View>

            <Text style={styles.filterLabel}>Sức chứa:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={searchParams.Capacity}
                onValueChange={(value) => setSearchParams({ ...searchParams, Capacity: value })}
                style={styles.picker}
              >
                {capacityOptions.map((option, index) => (
                  <Picker.Item key={index} label={option.label} value={option.value} />
                ))}
              </Picker>
            </View>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#835101" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="search-off" size={48} color="#666" />
          <Text style={styles.emptyText}>Không tìm thấy kết quả phù hợp</Text>
          <Text style={styles.emptySubtext}>Vui lòng thử lại với các từ khóa khác</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderWorkspaceItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filterButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  filterButtonText: {
    marginLeft: 4,
    color: '#835101',
    fontWeight: '500',
  },
  searchButton: {
    backgroundColor: '#835101',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  filtersContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  resultsList: {
    padding: 16,
  },
  workspaceItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  workspaceImage: {
    width: 120,
    height: 160,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  workspaceInfo: {
    flex: 1,
    padding: 12,
  },
  workspaceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workspaceAddress: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#E6D5B8',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#835101',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#835101',
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  facilityText: {
    fontSize: 12,
    color: '#835101',
    marginLeft: 4,
  },
});

export default SearchScreen;

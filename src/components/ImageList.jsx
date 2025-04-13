import React, { useState, useRef } from "react";
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  SafeAreaView,
  StatusBar,
  Animated,
  Share,
  PanResponder,
  Clipboard,
  ToastAndroid,
  Platform,
  Alert,
} from "react-native";
import { Ionicons, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const ImageList = ({ images, workspaceId, onBackPress, onHomePress }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const scrollViewRef = useRef(null);
  const fullScreenFlatListRef = useRef(null);

  if (!images || images.length === 0) return null;

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / screenWidth);
    setActiveIndex(currentIndex);
  };

  const scrollToImage = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * screenWidth,
        animated: true,
      });
    }
  };

  const openGalleryModal = (index) => {
    setFullScreenIndex(index);
    setModalVisible(true);
  };

  const closeGalleryModal = () => {
    setModalVisible(false);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here you would implement the logic to save to favorites
  };

  const shareWorkspace = async () => {
    try {
      const shareUrl = `https://workhive-clients.vercel.app/workspace/${workspaceId}`;
      
      Clipboard.setString(shareUrl);
      
      const result = await Share.share({
        message: 'Xem không gian làm việc này trên WorkHive!',
        url: shareUrl,
        title: 'WorkHive - Cho không gian làm việc của bạn!',
      });
      
      if (result.action === Share.sharedAction) {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Đã sao chép liên kết!', ToastAndroid.SHORT);
        }
      } else if (result.action === Share.dismissedAction) {

        if (Platform.OS === 'android') {
          ToastAndroid.show('Đã sao chép liên kết!', ToastAndroid.SHORT);
        } else {
          Alert.alert('Info', 'Đã sao chép liên kết!');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Could not share this workspace.');
    }
  };

  const showShareOptions = () => {
    setModalVisible(false);
    setTimeout(() => {
      shareWorkspace();
    }, 300);
  };

  const renderGalleryItem = ({ item, index }) => {
    // Set up gesture handling for pinch-to-zoom
    const scale = new Animated.Value(1);
    const pan = new Animated.ValueXY();
    
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        pan.flattenOffset();
        
        // Reset position if released
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          friction: 5
        }).start();
        
        // Reset scale
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: false,
          friction: 3
        }).start();
      },
      onPanResponderDoubleCapture: () => {
        // Double tap to zoom in/out
        Animated.spring(scale, {
          toValue: scale._value === 1 ? 2 : 1,
          useNativeDriver: false,
          friction: 3
        }).start();
      }
    });

    return (
      <View style={styles.galleryItemContainer}>
        <Animated.View
          style={[
            styles.galleryImageWrapper,
            {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { scale: scale }
              ]
            }
          ]}
          {...panResponder.panHandlers}
        >
          <Image
            source={{ uri: item.imgUrl }}
            style={styles.galleryImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onBackPress}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onHomePress}
          >
            <Ionicons name="home" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.rightButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleFavorite}
          >
            <AntDesign 
              name={isFavorite ? "heart" : "hearto"} 
              size={20} 
              color={isFavorite ? "#ff4444" : "white"} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={shareWorkspace}
          >
            <Ionicons name="share-social" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        horizontal 
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ref={scrollViewRef}
      >
        {images.map((image, index) => (
          <TouchableOpacity 
            key={image.id} 
            onPress={() => openGalleryModal(index)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: image.imgUrl }}
              style={styles.image}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                activeIndex === index && styles.paginationDotActive,
              ]}
              onPress={() => scrollToImage(index)}
            />
          ))}
        </View>
      )}

      {/* Full Screen Gallery Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={closeGalleryModal}
      >
        <SafeAreaView style={styles.galleryModalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <View style={styles.galleryHeader}>
            <TouchableOpacity 
              style={styles.galleryCloseButton}
              onPress={closeGalleryModal}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.galleryCounter}>
              {fullScreenIndex + 1}/{images.length}
            </Text>
            <TouchableOpacity 
              style={styles.galleryShareButton}
              onPress={showShareOptions}
            >
              <Ionicons name="share-social" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            ref={fullScreenFlatListRef}
            data={images}
            renderItem={renderGalleryItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={fullScreenIndex}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.floor(
                event.nativeEvent.contentOffset.x / screenWidth + 0.5
              );
              setFullScreenIndex(newIndex);
            }}
          />
          
          <View style={styles.galleryPagination}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.galleryPaginationDot,
                  fullScreenIndex === index && styles.galleryPaginationDotActive,
                ]}
              />
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  header: {
    position: "absolute",
    top: 30,
    left: 10,
    right: 10,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftButtons: {
    flexDirection: "row",
    gap: 10,
  },
  rightButtons: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    backgroundColor: "#835101", 
    padding: 8, 
    borderRadius: 50,
  },
  image: {
    width: screenWidth,
    height: 300,
    resizeMode: "cover",
  },
  pagination: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    margin: 3,
  },
  paginationDotActive: {
    backgroundColor: "#FFFFFF",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  // Gallery Modal Styles
  galleryModalContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  galleryCloseButton: {
    padding: 8,
  },
  galleryShareButton: {
    padding: 8,
  },
  galleryCounter: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  galleryItemContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryImageWrapper: {
    width: screenWidth,
    height: screenHeight * 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  galleryPagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  galleryPaginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    margin: 3,
  },
  galleryPaginationDotActive: {
    backgroundColor: "#FFFFFF",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default ImageList;

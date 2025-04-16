import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/vi";

const AllFeedBackScreen = () => {
  const navigation = useNavigation();
  const { userData, userToken } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [feedbackIds, setFeedbackIds] = useState([]);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [ownerResponse, setOwnerResponse] = useState(null);
  const [loadingResponse, setLoadingResponse] = useState(false);

  useEffect(() => {
    fetchFeedbackBookings();
  }, [userData, userToken]);
  
  const fetchFeedbackBookings = async () => {
    if (!userData?.sub) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `https://workhive.info.vn:8443/user-feedback-bookings/${userData.sub}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const data = response.data;
      const sortedData = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const bookingsWithResponseInfo = await Promise.all(
        sortedData.map(async (booking) => {
          if (!booking.feedbackIds?.length) {
            return { ...booking, hasOwnerResponse: false };
          }

          const hasAnyResponse = await Promise.any(
            booking.feedbackIds.map(
              async (feedbackId) => await checkOwnerResponse(feedbackId)
            )
          ).catch(() => false);

          return { ...booking, hasOwnerResponse: hasAnyResponse };
        })
      );

      setBookings(bookingsWithResponseInfo);

      if (bookingsWithResponseInfo.length > 0) {
        const firstBooking = bookingsWithResponseInfo[0];
        setSelectedBooking(firstBooking);

        if (firstBooking.feedbackIds?.length) {
          const firstFeedbackId = firstBooking.feedbackIds[0];
          const feedbackData = await fetchFeedbackDetails(firstFeedbackId);

          const feedbackIdsWithData = firstBooking.feedbackIds.map((id) => ({
            id,
            bookingId: firstBooking.id,
            title: id === firstFeedbackId && feedbackData ? feedbackData.title : undefined,
          }));

          setFeedbackIds(feedbackIdsWithData);
          setSelectedFeedbackId(firstFeedbackId);
        }
      }
    } catch (error) {
      console.error("Error fetching feedback bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackDetails = async (feedbackId) => {
    try {
      const response = await axios.get(
        `https://workhive.info.vn:8443/feedbacks/${feedbackId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error(`Error fetching feedback details for ID ${feedbackId}:`, error);
    }
    return null;
  };

  const checkOwnerResponse = async (feedbackId) => {
    try {
      const response = await axios.get(
        `https://workhive.info.vn:8443/response-feedbacks/feedback/${feedbackId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          validateStatus: function (status) {
            return status >= 200 && status < 500; // Accept any status code except 500-level errors
          },
        }
      );
      
      return response.status === 200 && response.data && response.data.id;
    } catch (error) {
      console.error(`Error checking owner response for feedback ${feedbackId}:`, error);
    }
    return false;
  };

  const handleBookingSelect = async (booking) => {
    setSelectedBooking(booking);
    setExistingFeedback(null);
    setOwnerResponse(null);

    if (!booking.feedbackIds?.length) {
      setFeedbackIds([]);
      setSelectedFeedbackId(null);
      return;
    }

    const feedbackIdsWithBooking = booking.feedbackIds.map((id) => ({
      id,
      bookingId: booking.id,
    }));
    
    setFeedbackIds(feedbackIdsWithBooking);

    const firstFeedbackId = booking.feedbackIds[0];
    setSelectedFeedbackId(firstFeedbackId);

    const feedbackData = await fetchFeedbackDetails(firstFeedbackId);
    
    if (feedbackData) {
      setExistingFeedback(feedbackData);
      fetchOwnerResponse(firstFeedbackId);
      
      setFeedbackIds((prevFeedbacks) =>
        prevFeedbacks.map((feedback) =>
          feedback.id === firstFeedbackId
            ? { ...feedback, title: feedbackData.title }
            : feedback
        )
      );
    }
  };

  const handleFeedbackSelect = async (feedbackId) => {
    setSelectedFeedbackId(feedbackId);
    setExistingFeedback(null);
    setOwnerResponse(null);

    const feedbackData = await fetchFeedbackDetails(feedbackId);
    
    if (feedbackData) {
      setExistingFeedback(feedbackData);
      fetchOwnerResponse(feedbackId);
      
      setFeedbackIds((prevFeedbacks) =>
        prevFeedbacks.map((feedback) =>
          feedback.id === feedbackId
            ? { ...feedback, title: feedbackData.title }
            : feedback
        )
      );
    }
  };
  
  const fetchOwnerResponse = async (feedbackId) => {
    try {
      setLoadingResponse(true);
      const response = await axios.get(
        `https://workhive.info.vn:8443/response-feedbacks/feedback/${feedbackId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          validateStatus: function (status) {
            return status >= 200 && status < 500;
          },
        }
      );

      if (response.status === 200 && response.data && response.data.id) {
        setOwnerResponse(response.data);
      } else {
        setOwnerResponse(null);
      }
    } catch (error) {
      console.error("Error fetching owner response:", error);
      setOwnerResponse(null);
    } finally {
      setLoadingResponse(false);
    }
  };

  const FeedbackCard = ({ feedback }) => {
    if (!feedback) return null;
    
    return (
      <View style={styles.feedbackCard}>
        <View style={styles.feedbackHeader}>
          <Text style={styles.feedbackDate}>
            {dayjs(feedback.createdAt).format("DD/MM/YYYY HH:mm")}
          </Text>
        </View>
        
        <View style={styles.feedbackContent}>
          <Text style={styles.contentLabel}>Không gian làm việc:</Text>
          <Text style={styles.contentText}>{feedback.workspaceName}</Text>
        </View>
        
        <View style={styles.separator} />
        
        <View style={styles.feedbackContent}>
          <Text style={styles.contentLabel}>Nội dung phản hồi:</Text>
          <Text style={styles.descriptionText}>{feedback.description}</Text>
        </View>
        
        {feedback.imageUrls && feedback.imageUrls.length > 0 && (
          <View style={styles.imagesContainer}>
            <Text style={styles.contentLabel}>Hình ảnh đính kèm:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {feedback.imageUrls.map((url, index) => (
                <Image
                  key={index}
                  source={{ uri: url }}
                  style={styles.feedbackImage}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const OwnerResponseCard = ({ response }) => {
    if (!response) return null;
    
    return (
      <View style={styles.responseCard}>
        <View style={styles.responseHeader}>
          <Text style={styles.responseHeaderText}>Phản hồi từ chủ không gian</Text>
          <Text style={styles.responseDate}>
            {dayjs(response.createdAt).format("DD/MM/YYYY HH:mm")}
          </Text>
        </View>
        
        <View style={styles.separator} />
        
        <Text style={styles.responseText}>{response.description}</Text>
      </View>
    );
  };

  const BookingItem = ({ item, isSelected }) => (
    <TouchableOpacity
      style={[styles.bookingItem, isSelected && styles.selectedBookingItem]}
      onPress={() => handleBookingSelect(item)}
    >
      <View>
        <Text style={styles.bookingName} numberOfLines={1}>
          {item.workspaceName}
        </Text>
        <Text style={styles.bookingDate}>
          {dayjs(item.startDate).format("DD/MM/YYYY")}
        </Text>
      </View>
      <View style={[
        styles.statusBadge, 
        item.hasOwnerResponse ? styles.respondedBadge : styles.pendingBadge
      ]}>
        <Text style={styles.statusText}>
          {item.hasOwnerResponse ? "Đã phản hồi" : "Chưa phản hồi"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const FeedbackTabs = () => {
    if (!feedbackIds || feedbackIds.length <= 1) return null;
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.tabsContainer}
      >
        {feedbackIds.map((feedback, index) => (
          <TouchableOpacity
            key={feedback.id}
            style={[
              styles.tabItem,
              selectedFeedbackId === feedback.id && styles.activeTabItem
            ]}
            onPress={() => handleFeedbackSelect(feedback.id)}
          >
            <Text 
              style={[
                styles.tabText,
                selectedFeedbackId === feedback.id && styles.activeTabText
              ]}
            >
              Phản hồi {index + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
        <Text style={styles.loadingText}>Đang tải phản hồi...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phản hồi dịch vụ</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subTitle}>
        Xem lại các phản hồi bạn đã gửi và phản hồi từ chủ không gian
      </Text>

      <View style={styles.contentContainer}>
        {/* Booking list section */}
        <View style={styles.bookingsSection}>
          <Text style={styles.sectionTitle}>Danh sách phản hồi đã gửi</Text>
          
          {bookings.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Icon name="exclamation-circle" size={40} color="#CCCCCC" />
              <Text style={styles.emptyStateText}>Không có phản hồi nào</Text>
            </View>
          ) : (
            <FlatList
              data={bookings}
              renderItem={({ item }) => (
                <BookingItem 
                  item={item} 
                  isSelected={selectedBooking?.id === item.id}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.bookingsList}
            />
          )}
        </View>

        {/* Feedback details section */}
        <View style={styles.detailsSection}>
          {selectedBooking ? (
            <>
              <FeedbackTabs />
              
              {existingFeedback ? (
                <ScrollView style={styles.detailsScrollView}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Thông tin phản hồi</Text>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Mã đặt chỗ:</Text>
                      <Text style={styles.infoValue}>#{selectedBooking.id}</Text>
                    </View>
                    {existingFeedback.title && (
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Tiêu đề:</Text>
                        <Text style={styles.infoValue}>{existingFeedback.title}</Text>
                      </View>
                    )}
                  </View>

                  <FeedbackCard feedback={existingFeedback} />
                  
                  {loadingResponse ? (
                    <View style={styles.loadingResponseContainer}>
                      <ActivityIndicator size="small" color="#835101" />
                      <Text style={styles.loadingResponseText}>Đang tải phản hồi...</Text>
                    </View>
                  ) : ownerResponse ? (
                    <OwnerResponseCard response={ownerResponse} />
                  ) : (
                    <View style={styles.pendingResponseCard}>
                      <Text style={styles.pendingResponseTitle}>Trạng thái phản hồi</Text>
                      <View style={styles.separator} />
                      <Text style={styles.pendingResponseText}>
                        Chưa phản hồi
                      </Text>
                      <View style={styles.noteContainer}>
                        <Icon name="exclamation-circle" size={16} color="#EAB308" />
                        <Text style={styles.noteText}>
                          Phản hồi của bạn đang được xem xét. Chúng tôi sẽ trả lời trong vòng 24 giờ.
                        </Text>
                      </View>
                    </View>
                  )}
                </ScrollView>
              ) : feedbackIds.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Icon name="comment-o" size={40} color="#CCCCCC" />
                  <Text style={styles.emptyStateText}>
                    Không có phản hồi nào cho đặt chỗ này
                  </Text>
                </View>
              ) : (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#835101" />
                  <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Icon name="hand-pointer-o" size={40} color="#CCCCCC" />
              <Text style={styles.emptyStateText}>
                Chọn một đặt chỗ để xem phản hồi
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
  },
  subTitle: {
    fontSize: 14,
    color: "#666666",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "column",
  },
  bookingsSection: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    maxHeight: "30%",
  },
  detailsSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 10,
  },
  bookingsList: {
    paddingVertical: 5,
  },
  bookingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E1E1E1",
  },
  selectedBookingItem: {
    backgroundColor: "#FFF8E1",
    borderColor: "#FFCC80",
  },
  bookingName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#835101",
    maxWidth: 200,
  },
  bookingDate: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  respondedBadge: {
    backgroundColor: "#E6F7EC",
  },
  pendingBadge: {
    backgroundColor: "#FFF3EA",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333333",
  },
  detailsScrollView: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
  },
  activeTabItem: {
    backgroundColor: "#835101",
  },
  tabText: {
    fontSize: 14,
    color: "#666666",
  },
  activeTabText: {
    fontWeight: "600",
    color: "#FFFFFF",
  },
  infoBox: {
    backgroundColor: "#F2F2F2",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#835101",
    marginBottom: 10,
  },
  infoContent: {
    flexDirection: "row",
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  infoValue: {
    fontSize: 14,
    color: "#555555",
    marginLeft: 5,
  },
  feedbackCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  feedbackHeader: {
    marginBottom: 10,
  },
  feedbackDate: {
    fontSize: 12,
    color: "#666666",
    textAlign: "right",
  },
  feedbackContent: {
    marginBottom: 10,
  },
  contentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 5,
  },
  contentText: {
    fontSize: 14,
    color: "#555555",
  },
  descriptionText: {
    fontSize: 14,
    color: "#555555",
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: "#E1E1E1",
    marginVertical: 10,
  },
  imagesContainer: {
    marginTop: 5,
  },
  feedbackImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 10,
  },
  responseCard: {
    backgroundColor: "#E6F7EC",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  responseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  responseHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  responseDate: {
    fontSize: 12,
    color: "#666666",
  },
  responseText: {
    fontSize: 14,
    color: "#555555",
    lineHeight: 20,
  },
  pendingResponseCard: {
    backgroundColor: "#FFF3EA",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  pendingResponseTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  pendingResponseText: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 10,
  },
  noteContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FEF3C7",
    marginTop: 10,
  },
  noteText: {
    fontSize: 12,
    color: "#92400E",
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 10,
  },
  loadingResponseContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingResponseText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 10,
    textAlign: "center",
  },
});

export default AllFeedBackScreen;
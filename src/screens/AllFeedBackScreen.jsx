import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/vi";

const { width } = Dimensions.get("window");

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
  const [activeTab, setActiveTab] = useState('feedbacks'); // 'feedbacks' or 'details'

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
          // Accept 404 responses as valid (will be handled as empty bookings)
          validateStatus: function (status) {
            return status === 200 || status === 404;
          }
        }
      );

      // If 404, set empty bookings array and return
      if (response.status === 404) {
        setBookings([]);
        setLoading(false);
        return;
      }

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
    setActiveTab('details'); // Always switch to details tab when selecting a booking

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
        <View style={styles.feedbackCardHeader}>
          <Text style={styles.feedbackCardTitle}>Phản hồi của bạn</Text>
          <Text style={styles.feedbackDate}>
            {dayjs(feedback.createdAt).format("DD/MM/YYYY HH:mm")}
          </Text>
        </View>
        
        <View style={styles.separator} />
        
        <View style={styles.feedbackContent}>
          <Text style={styles.contentLabel}>Không gian làm việc:</Text>
          <Text style={styles.contentText}>{feedback.workspaceName}</Text>
        </View>
        
        {feedback.title && (
          <View style={styles.feedbackContent}>
            <Text style={styles.contentLabel}>Tiêu đề:</Text>
            <Text style={styles.contentText}>{feedback.title}</Text>
          </View>
        )}
        
        <View style={styles.feedbackContent}>
          <Text style={styles.contentLabel}>Nội dung phản hồi:</Text>
          <Text style={styles.descriptionText}>{feedback.description}</Text>
        </View>
        
        {feedback.imageUrls && feedback.imageUrls.length > 0 && (
          <View style={styles.imagesContainer}>
            <Text style={styles.contentLabel}>Hình ảnh đính kèm:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {feedback.imageUrls.map((url, index) => (
                <TouchableOpacity key={index}>
                  <Image
                    source={{ uri: url }}
                    style={styles.feedbackImage}
                  />
                </TouchableOpacity>
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
        <View style={styles.responseCardHeader}>
          <Icon name="reply" size={16} color="#0B6E4F" style={styles.responseIcon} />
          <Text style={styles.responseHeaderText}>Phản hồi từ chủ không gian</Text>
        </View>
        
        <Text style={styles.responseDate}>
          {dayjs(response.createdAt).format("DD/MM/YYYY HH:mm")}
        </Text>
        
        <View style={styles.separator} />
        
        <Text style={styles.responseText}>{response.description}</Text>
      </View>
    );
  };

  const BookingItem = ({ item }) => {
    const hasResponse = item.hasOwnerResponse;
    
    return (
      <TouchableOpacity
        style={styles.bookingItem}
        onPress={() => handleBookingSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.bookingItemContent}>
          <View style={styles.bookingTopRow}>
            <Text style={styles.bookingName} numberOfLines={1}>
              {item.workspaceName}
            </Text>
            <View style={[
              styles.statusBadge, 
              hasResponse ? styles.respondedBadge : styles.pendingBadge
            ]}>
              <Text style={[
                styles.statusText,
                hasResponse ? styles.respondedText : styles.pendingText
              ]}>
                {hasResponse ? "Đã phản hồi" : "Chưa phản hồi"}
              </Text>
            </View>
          </View>
          
          <View style={styles.bookingBottomRow}>
            <View style={styles.bookingInfo}>
              <Icon name="calendar" size={12} color="#666666" style={styles.bookingItemIcon} />
              <Text style={styles.bookingDate}>
                {dayjs(item.startDate).format("DD/MM/YYYY")}
              </Text>
            </View>
            
            <View style={styles.bookingInfo}>
              <Icon name="comments" size={12} color="#666666" style={styles.bookingItemIcon} />
              <Text style={styles.bookingFeedbackCount}>
                {item.feedbackIds?.length || 0} phản hồi
              </Text>
            </View>
          </View>
        </View>
        <Icon name="chevron-right" size={16} color="#CCCCCC" />
      </TouchableOpacity>
    );
  };

  const FeedbackTabs = () => {
    if (!feedbackIds || feedbackIds.length <= 1) return null;
    
    return (
      <View style={styles.feedbackTabsContainer}>
        <Text style={styles.feedbackTabsTitle}>Phản hồi của bạn:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.tabsScrollContainer}
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
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#835101" />
          <Text style={styles.loadingText}>Đang tải phản hồi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            if (activeTab === 'details' && selectedBooking) {
              // Go back to the feedback list when in detail view
              setActiveTab('feedbacks');
            } else {
              // Go back to previous screen when in feedback list
              navigation.goBack();
            }
          }}
        >
          <Icon name="chevron-left" size={18} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === 'feedbacks' ? 'Phản hồi dịch vụ' : 'Chi tiết phản hồi'}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      
      {activeTab === 'feedbacks' && (
        <View style={styles.tabContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {bookings.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Icon name="comments-o" size={60} color="#DDDDDD" />
                <Text style={styles.emptyStateTitle}>Chưa có phản hồi nào</Text>
                <Text style={styles.emptyStateText}>
                  Bạn chưa có phản hồi nào cho các đặt chỗ trước đây
                </Text>
              </View>
            ) : (
              <View style={styles.bookingListContainer}>
                {bookings.map((item) => (
                  <BookingItem key={item.id.toString()} item={item} />
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      )}
      
      {activeTab === 'details' && (
        <View style={styles.tabContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.bookingSummary}>
              <Text style={styles.bookingSummaryTitle}>{selectedBooking.workspaceName}</Text>
              <View style={styles.bookingSummaryDetails}>
                <View style={styles.summaryItem}>
                  <Icon name="calendar" size={14} color="#666666" />
                  <Text style={styles.summaryText}>
                    {dayjs(selectedBooking.startDate).format("DD/MM/YYYY")}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Icon name="hashtag" size={14} color="#666666" />
                  <Text style={styles.summaryText}>
                    Mã đặt chỗ: {selectedBooking.id}
                  </Text>
                </View>
              </View>
            </View>
            
            <FeedbackTabs />
            
            {existingFeedback ? (
              <View style={styles.feedbackDetailsContainer}>
                <FeedbackCard feedback={existingFeedback} />
                
                {loadingResponse ? (
                  <View style={styles.loadingResponseContainer}>
                    <ActivityIndicator size="small" color="#835101" />
                    <Text style={styles.loadingResponseText}>Đang tải phản hồi từ chủ không gian...</Text>
                  </View>
                ) : ownerResponse ? (
                  <OwnerResponseCard response={ownerResponse} />
                ) : (
                  <View style={styles.pendingResponseCard}>
                    <View style={styles.pendingResponseHeader}>
                      <Icon name="clock-o" size={16} color="#F59E0B" />
                      <Text style={styles.pendingResponseTitle}>Đang chờ phản hồi</Text>
                    </View>
                    
                    <View style={styles.separator} />
                    
                    <Text style={styles.pendingResponseText}>
                      Phản hồi của bạn đang được xem xét. Chủ không gian làm việc sẽ trả lời trong thời gian sớm nhất.
                    </Text>
                    
                    <View style={styles.responseTimeEstimate}>
                      <Icon name="info-circle" size={14} color="#835101" />
                      <Text style={styles.responseTimeText}>
                        Thời gian phản hồi thông thường: 24 giờ
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ) : feedbackIds.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Icon name="comment-o" size={50} color="#DDDDDD" />
                <Text style={styles.emptyStateTitle}>Không có phản hồi</Text>
                <Text style={styles.emptyStateText}>
                  Đặt chỗ này chưa có phản hồi nào
                </Text>
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#835101" />
                <Text style={styles.loadingText}>Đang tải chi tiết phản hồi...</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
  },
  tabContent: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  bookingListContainer: {
    padding: 12,
  },
  bookingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingItemContent: {
    flex: 1,
  },
  bookingTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bookingBottomRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookingInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  bookingItemIcon: {
    marginRight: 6,
  },
  bookingName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    flex: 1,
    marginRight: 8,
  },
  bookingDate: {
    fontSize: 13,
    color: "#666666",
  },
  bookingFeedbackCount: {
    fontSize: 13,
    color: "#666666",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    minWidth: 90,
    alignItems: "center",
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
  },
  respondedText: {
    color: "#0B6E4F",
  },
  pendingText: {
    color: "#F59E0B",
  },
  bookingSummary: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingSummaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },
  bookingSummaryDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    color: "#666666",
    marginLeft: 6,
  },
  feedbackTabsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  feedbackTabsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  tabsScrollContainer: {
    flexGrow: 0,
    marginBottom: 8,
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  activeTabItem: {
    backgroundColor: "#835101",
  },
  tabText: {
    fontSize: 13,
    color: "#666666",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  feedbackDetailsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  feedbackCard: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  feedbackCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  feedbackCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
  },
  feedbackDate: {
    fontSize: 12,
    color: "#888888",
  },
  feedbackContent: {
    marginBottom: 12,
  },
  contentLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 4,
  },
  contentText: {
    fontSize: 14,
    color: "#666666",
  },
  descriptionText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  imagesContainer: {
    marginTop: 12,
  },
  feedbackImage: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 8,
    marginRight: 8,
    marginTop: 8,
  },
  responseCard: {
    padding: 16,
    backgroundColor: "#E6F7EC",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  responseCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  responseIcon: {
    marginRight: 8,
  },
  responseHeaderText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0B6E4F",
  },
  responseDate: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 8,
  },
  responseText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
  },
  pendingResponseCard: {
    padding: 16,
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  pendingResponseHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  pendingResponseTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#F59E0B",
    marginLeft: 8,
  },
  pendingResponseText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 16,
  },
  responseTimeEstimate: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEED0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  responseTimeText: {
    fontSize: 12,
    color: "#835101",
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 10,
  },
  loadingResponseContainer: {
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingResponseText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 10,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
  },
});

export default AllFeedBackScreen;
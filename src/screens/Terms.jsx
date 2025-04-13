import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";

const Terms = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Điều khoản sử dụng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Giới thiệu</Text>
          <Text style={styles.paragraph}>
            Chào mừng bạn đến với WorkHive - nền tảng kết nối không gian làm việc. Bằng việc truy cập và sử dụng ứng dụng WorkHive, bạn đồng ý tuân theo các điều khoản và điều kiện được mô tả trong tài liệu này.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Định nghĩa</Text>
          <Text style={styles.paragraph}>
            • "Ứng dụng" đề cập đến ứng dụng di động WorkHive.{"\n"}
            • "Dịch vụ" đề cập đến các dịch vụ do WorkHive cung cấp thông qua ứng dụng.{"\n"}
            • "Người dùng" đề cập đến bất kỳ cá nhân hoặc tổ chức nào đăng ký và sử dụng ứng dụng.{"\n"}
            • "Chủ không gian" đề cập đến những người cung cấp không gian làm việc trên nền tảng.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Đăng ký tài khoản</Text>
          <Text style={styles.paragraph}>
            Để sử dụng đầy đủ các tính năng của WorkHive, bạn cần tạo một tài khoản. Khi đăng ký tài khoản, bạn đồng ý cung cấp thông tin chính xác, đầy đủ và cập nhật. Bạn hoàn toàn chịu trách nhiệm về việc bảo mật thông tin tài khoản của mình, bao gồm mật khẩu.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Đặt chỗ và thanh toán</Text>
          <Text style={styles.paragraph}>
            4.1. WorkHive cung cấp nền tảng để kết nối người dùng với các không gian làm việc. Khi bạn đặt chỗ, bạn đang tham gia vào một thỏa thuận trực tiếp với chủ không gian.{"\n\n"}
            4.2. Bạn đồng ý thanh toán đầy đủ và đúng hạn cho các dịch vụ bạn đặt qua ứng dụng, theo giá và điều kiện được hiển thị tại thời điểm đặt chỗ.{"\n\n"}
            4.3. Chính sách hủy đặt chỗ có thể khác nhau tùy thuộc vào không gian làm việc cụ thể. Vui lòng xem xét kỹ chính sách này trước khi xác nhận đặt chỗ.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Quyền riêng tư</Text>
          <Text style={styles.paragraph}>
            Chúng tôi coi trọng quyền riêng tư của bạn. Việc thu thập và sử dụng thông tin cá nhân của bạn được quy định trong Chính sách Quyền riêng tư của chúng tôi, có thể truy cập từ ứng dụng.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Quyền sở hữu trí tuệ</Text>
          <Text style={styles.paragraph}>
            Tất cả nội dung trên ứng dụng, bao gồm nhưng không giới hạn ở văn bản, hình ảnh, đồ họa, logo, biểu tượng và phần mềm, đều là tài sản của WorkHive hoặc các đối tác cung cấp nội dung của chúng tôi và được bảo vệ bởi luật sở hữu trí tuệ.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Giới hạn trách nhiệm</Text>
          <Text style={styles.paragraph}>
            WorkHive không chịu trách nhiệm về bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên, đặc biệt hoặc mang tính hệ quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ của chúng tôi.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Thay đổi điều khoản</Text>
          <Text style={styles.paragraph}>
            Chúng tôi có thể cập nhật các điều khoản này theo thời gian mà không cần thông báo trước. Bạn đồng ý rằng việc tiếp tục sử dụng ứng dụng sau khi có những thay đổi như vậy đồng nghĩa với việc bạn chấp nhận các điều khoản đã sửa đổi.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Liên hệ</Text>
          <Text style={styles.paragraph}>
            Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi qua email: support@workhive.com
          </Text>
        </View>

        <View style={styles.lastUpdated}>
          <Text style={styles.lastUpdatedText}>
            Cập nhật lần cuối: 13/04/2025
          </Text>
        </View>
      </ScrollView>
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
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  placeholder: {
    width: 20,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333333",
  },
  lastUpdated: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  lastUpdatedText: {
    fontSize: 14,
    color: "#666666",
    fontStyle: "italic",
  },
});

export default Terms;
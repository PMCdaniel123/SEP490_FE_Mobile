import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { Formik } from "formik";
import validationSchema from "../lib/yup/schema";

const RegisterScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [showSexModal, setShowSexModal] = useState(false);
  const { login } = useContext(AuthContext);

  const sexOptions = ["Nam", "Nữ", "Khác"];

  const handleRegister = async (values) => {
    const { name, email, phone, sex, password } = values;

    setLoading(true);
    try {
      const response = await axios.post("http://35.78.210.59:8080/users/register", {
        name,
        email,
        phone,
        password,
        sex,
      });

      if (response.data && response.data.token) {
        Alert.alert("Thành công", response.data.notification || "Đăng ký tài khoản thành công!");

        const loginResult = await login(email, password);

        if (!loginResult.success) {
          navigation.navigate("Login");
        }
      } else {
        Alert.alert("Thông báo", response.data.notification || "Đăng ký thành công, vui lòng đăng nhập.");
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error.response?.data || error.message);
      Alert.alert("Đăng ký thất bại", error.response?.data?.notification || "Đã xảy ra lỗi trong quá trình đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} style={{ flex: 1 }}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Tạo tài khoản</Text>
          </View>

          <Formik
            initialValues={{
              name: "",
              email: "",
              phone: "",
              sex: "",
              password: "",
              confirmPassword: "",
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => handleRegister(values)}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
              <View style={styles.formContainer}>
                <Text style={styles.label}>Họ và tên</Text>
                <TextInput
                  style={[styles.input, touched.name && errors.name && styles.inputError]}
                  placeholder="Nhập họ và tên"
                  value={values.name}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                />
                {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={[styles.input, touched.email && errors.email && styles.inputError]}
                  placeholder="Nhập email"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                  style={[styles.input, touched.phone && errors.phone && styles.inputError]}
                  placeholder="Nhập số điện thoại"
                  value={values.phone}
                  onChangeText={handleChange("phone")}
                  onBlur={handleBlur("phone")}
                  keyboardType="phone-pad"
                />
                {touched.phone && errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

                <Text style={styles.label}>Giới tính</Text>
                <TouchableOpacity
                  style={[styles.selectContainer, touched.sex && errors.sex && styles.inputError]}
                  onPress={() => setShowSexModal(true)}
                >
                  <Text style={values.sex ? styles.selectText : styles.selectPlaceholder}>
                    {values.sex || "Chọn giới tính"}
                  </Text>
                  <Icon name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
                {touched.sex && errors.sex && <Text style={styles.errorText}>{errors.sex}</Text>}

                <Text style={styles.label}>Mật khẩu</Text>
                <TextInput
                  style={[styles.input, touched.password && errors.password && styles.inputError]}
                  placeholder="Nhập mật khẩu"
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  secureTextEntry
                />
                {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <TextInput
                  style={[styles.input, touched.confirmPassword && errors.confirmPassword && styles.inputError]}
                  placeholder="Nhập lại mật khẩu"
                  value={values.confirmPassword}
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  secureTextEntry
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Tạo tài khoản</Text>}
                </TouchableOpacity>

                <Text style={styles.termsText}>
                  Bằng cách đăng ký, bạn đồng ý với
                  <Text style={styles.linkText}> Điều khoản và Điều kiện Sử dụng của chúng tôi</Text>
                </Text>

                {/* Modal chọn giới tính */}
                <Modal
                  visible={showSexModal}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setShowSexModal(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chọn giới tính</Text>
                        <TouchableOpacity onPress={() => setShowSexModal(false)}>
                          <Icon name="times" size={20} color="#000" />
                        </TouchableOpacity>
                      </View>

                      {sexOptions.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.optionItem}
                          onPress={() => {
                            setFieldValue("sex", option);
                            setShowSexModal(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              values.sex === option && styles.selectedOptionText,
                            ]}
                          >
                            {option}
                          </Text>
                          {values.sex === option && <Icon name="check" size={16} color="#835101" />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </Modal>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 15,
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#FF3B6F",
  },
  errorText: {
    color: "#FF3B6F",
    fontSize: 12,
    marginBottom: 10,
  },
  selectContainer: {
    width: "100%",
    height: 50,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 16,
    color: "#000",
  },
  selectPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#835101",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "#D0BEA0",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  termsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  linkText: {
    color: "#000",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    color: "#835101",
    fontWeight: "500",
  },
});

export default RegisterScreen;
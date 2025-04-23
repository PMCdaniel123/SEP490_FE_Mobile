import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Dimensions,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Email input, 2: Code verification and new password
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = Array(6).fill().map(() => React.createRef());
  }, []);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Thông báo', 'Vui lòng nhập email của bạn');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Thông báo', 'Vui lòng nhập email hợp lệ');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        'https://workhive.info.vn:8443/users/forgotpassword',
        { email }
      );

      if (response.data && response.status >= 200 && response.status < 300) {
        Alert.alert('Thành công', 'Mã xác thực đã được gửi đến email của bạn');
        setStep(2);
        setVerificationCode(['', '', '', '', '', '']);
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 100);
      } else {
        Alert.alert('Thông báo', response.data.message || 'Không thể gửi mã xác thực. Vui lòng thử lại sau');
      }
    } catch (error) {
      console.error('Error sending code:', error);
      Alert.alert(
        'Thông báo',
        error.response?.data?.message || 'Mã xác thực không đúngđúng. Vui lòng thử lại sau'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationCodeChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '');
    
    const newCode = [...verificationCode];
    newCode[index] = digit;
    setVerificationCode(newCode);
    
    if (digit && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleVerificationKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResetPassword = async () => {
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      Alert.alert('Thông báo', 'Mã xác thực phải có 6 số');
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert('Thông báo', 'Vui lòng nhập mật khẩu mới');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        'https://workhive.info.vn:8443/users/resetpassword',
        {
          token: code,
          newPassword: newPassword,
          confirmPassword: confirmPassword
        }
      );

      if (response.data && response.status >= 200 && response.status < 300) {
        Alert.alert(
          'Thành công', 
          'Mật khẩu đã được đổi thành công', 
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Thông báo', response.data.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại sau');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert(
        'Thông báo',
        error.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const toggleSecureConfirmEntry = () => {
    setSecureConfirmTextEntry(!secureConfirmTextEntry);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.title}>
            {step === 1 ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
          </Text>
          
          {step === 1 ? (

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập email để nhận mã xác thực"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="done"
                  onSubmitEditing={handleSendCode}
                />
              </View>
              
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!email) && styles.submitButtonDisabled,
                ]}
                onPress={handleSendCode}
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Gửi mã xác thực</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mã xác thực (6 chữ số)</Text>
                <Text style={styles.inputDescription}>
                  Nhập mã 6 chữ số đã được gửi đến email của bạn
                </Text>
                
                <View style={styles.codeInputContainer}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <TextInput
                      key={index}
                      ref={(input) => {
                        inputRefs.current[index] = input;
                      }}
                      style={styles.codeInput}
                      value={verificationCode[index]}
                      onChangeText={(text) => handleVerificationCodeChange(text, index)}
                      onKeyPress={(e) => handleVerificationKeyPress(e, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      selectTextOnFocus
                    />
                  ))}
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={secureTextEntry}
                    returnKeyType="next"
                  />
                  <TouchableOpacity onPress={toggleSecureEntry} style={styles.eyeIcon}>
                    <Icon 
                      name={secureTextEntry ? "eye-slash" : "eye"} 
                      size={20} 
                      color="#888" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={secureConfirmTextEntry}
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                  />
                  <TouchableOpacity onPress={toggleSecureConfirmEntry} style={styles.eyeIcon}>
                    <Icon 
                      name={secureConfirmTextEntry ? "eye-slash" : "eye"} 
                      size={20} 
                      color="#888" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (verificationCode.join('').length !== 6 || !newPassword || !confirmPassword) && 
                  styles.submitButtonDisabled,
                ]}
                onPress={handleResetPassword}
                disabled={isSubmitting || verificationCode.join('').length !== 6 || !newPassword || !confirmPassword}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Đặt lại mật khẩu</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.resendCode}
                onPress={handleSendCode}
              >
                <Text style={styles.resendCodeText}>Gửi lại mã xác thực</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 10,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#000',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#000',
  },
  inputDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  codeInput: {
    backgroundColor: '#F5F5F5',
    width: (width - 48 - 50) / 6,  // Adjusted for screen width, padding, and spacing
    height: 50,
    borderRadius: 8,
    fontSize: 20,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 15,
  },
  submitButton: {
    backgroundColor: '#835101',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#D0BEA0',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#000',
  },
  loginText: {
    fontSize: 14,
    color: '#835101',
    fontWeight: '600',
  },
  resendCode: {
    alignItems: 'center',
    marginBottom: 10,
  },
  resendCodeText: {
    color: '#835101',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;
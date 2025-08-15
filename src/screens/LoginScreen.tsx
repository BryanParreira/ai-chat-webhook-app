import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LoginCredentials {
  email: string;
  password: string;
  name?: string;
}

interface LoginScreenProps {
  onLogin?: (credentials: LoginCredentials) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin = () => {} }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [logoAnim] = useState(new Animated.Value(0));
  const [formAnim] = useState(new Animated.Value(0));

  // Initialize animations
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate form transition
  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isSignUp ? 1 : 0,
      tension: 80,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [isSignUp]);

  const validateForm = (): boolean => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (isSignUp) {
      if (!name.trim()) {
        Alert.alert('Error', 'Please enter your name');
        return false;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const credentials: LoginCredentials = { 
        email, 
        password,
        ...(isSignUp && { name: name.trim() })
      };
      
      onLogin(credentials);
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github'): Promise<void> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockUser = {
        email: `user@${provider}.com`,
        password: 'oauth',
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`
      };
      
      onLogin(mockUser);
    } catch (error) {
      console.error(`${provider} OAuth error:`, error);
      Alert.alert('Error', `Failed to sign in with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" translucent />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <Animated.View style={[
            styles.logoContainer,
            {
              opacity: logoAnim,
              transform: [
                {
                  translateY: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
                {
                  scale: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}>
            <View style={styles.logoBackground}>
              <Ionicons name="sparkles" size={32} color="#FF6B35" />
            </View>
            <Animated.View style={{
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -4],
                })
              }]
            }}>
              <Text style={styles.welcomeTitle}>
                {isSignUp ? 'Join Neural AI' : 'Welcome Back'}
              </Text>
              <Text style={styles.welcomeSubtitle}>
                {isSignUp 
                  ? 'Create your account and unlock AI potential' 
                  : 'Sign in to continue your AI journey'
                }
              </Text>
            </Animated.View>
          </Animated.View>

          {/* Form Section */}
          <Animated.View style={[
            styles.formContainer,
            {
              opacity: formAnim,
              transform: [
                {
                  translateY: formAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}>
            <View style={styles.formContent}>
              {/* Name Input (Sign Up only) */}
              {isSignUp && (
                <Animated.View 
                  style={[
                    styles.inputGroup,
                    {
                      opacity: slideAnim,
                      height: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 78],
                      }),
                      marginBottom: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 16],
                      }),
                    }
                  ]}
                >
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={[
                    styles.inputContainer,
                    name && styles.inputContainerFocused
                  ]}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={name ? "#FF6B35" : "#6B7280"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your full name"
                      placeholderTextColor="#6B7280"
                      autoCapitalize="words"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                  </View>
                </Animated.View>
              )}

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={[
                  styles.inputContainer,
                  email && styles.inputContainerFocused
                ]}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={email ? "#FF6B35" : "#6B7280"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#6B7280"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[
                  styles.inputContainer,
                  password && styles.inputContainerFocused
                ]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={password ? "#FF6B35" : "#6B7280"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.textInput, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#6B7280"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input (Sign Up only) */}
              {isSignUp && (
                <Animated.View 
                  style={[
                    styles.inputGroup,
                    {
                      opacity: slideAnim,
                      height: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 78],
                      }),
                    }
                  ]}
                >
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={[
                    styles.inputContainer,
                    confirmPassword && styles.inputContainerFocused
                  ]}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={confirmPassword ? "#FF6B35" : "#6B7280"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.textInput, styles.passwordInput]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your password"
                      placeholderTextColor="#6B7280"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (isLoading || !email || !password) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={isLoading || !email || !password}
                activeOpacity={0.8}
              >
                <View style={styles.submitButtonContent}>
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="white" />
                      <Text style={styles.submitButtonText}>
                        {isSignUp ? 'Creating Account...' : 'Signing In...'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* Toggle Auth Mode */}
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </Text>
                <TouchableOpacity onPress={toggleAuthMode} disabled={isLoading}>
                  <Text style={styles.toggleLink}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* OAuth Buttons */}
          <View style={styles.oauthContainer}>
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthLogin('google')}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View style={[styles.oauthButtonContent, styles.googleButton]}>
                <Ionicons name="logo-google" size={20} color="white" />
                <Text style={styles.oauthButtonText}>Google</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthLogin('github')}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View style={[styles.oauthButtonContent, styles.githubButton]}>
                <Ionicons name="logo-github" size={20} color="white" />
                <Text style={styles.oauthButtonText}>GitHub</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Demo Message */}
          <View style={styles.demoContainer}>
            <View style={styles.demoBadge}>
              <Ionicons name="information-circle-outline" size={16} color="#FF6B35" />
              <Text style={styles.demoText}>
                Demo mode: Use any credentials to {isSignUp ? 'create account' : 'sign in'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formContainer: {
    marginBottom: 32,
  },
  formContent: {
    backgroundColor: '#1F1F1F',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151515',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    height: 50,
  },
  inputContainerFocused: {
    borderColor: '#FF6B35',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#374151',
  },
  submitButtonContent: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  toggleText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  toggleLink: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2A2A',
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  oauthContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  oauthButton: {
    flex: 1,
    borderRadius: 12,
  },
  oauthButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
    borderRadius: 12,
  },
  googleButton: {
    backgroundColor: '#DC2626',
  },
  githubButton: {
    backgroundColor: '#1F2937',
  },
  oauthButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  demoContainer: {
    alignItems: 'center',
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LoginScreen;
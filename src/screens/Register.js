import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import BackgroundImage from "../assets/jobil.jpg";
import LinearGradient from 'react-native-linear-gradient';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { moderateScale } from 'react-native-size-matters';
import { StackActions } from '@react-navigation/native';
import CustomTextInput from "../components/CustomTextInput";
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MainButton from "../components/MainButton";
import arrowImage from "../assets/arrow.png";
import { useMutation } from '@apollo/client';
import { SAVE_DEVICE_INFO, SIGNUP_USER } from "../graph-operations";
import { useDispatch } from 'react-redux';
import { initUser, initUserPersit } from '../redux/features/userSlice';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import analytics from "@react-native-firebase/analytics";
import { getDeviceInfo } from "../utils";
import messaging from '@react-native-firebase/messaging';


const Register = ({ navigation }) => {

  const dispatch = useDispatch();
  const [nameValue, setNameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordConfirmationValue, setPasswordConfirmationValue] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorCompletion, setErrorCompletion] = useState(false)
  const [errorUsername, setErrorUsername] = useState(false)
  const [errorPasswordConfirmation, setErrorPasswordConfirmation] = useState(false)
  const [errorEmail, setErrorEmail] = useState(false)
  const [fcmtoken, setFcmToken]  = useState("");

  useEffect(() => {
    // Get the device token
    messaging()
      .getToken()
      .then(token => {
        console.log("token", token)
        setFcmToken(token)
      });
  }, []);


  const [signupUser] = useMutation(SIGNUP_USER, {
    onCompleted: async (data) => {
      // console.log("Data : ", data);

      const { token, user } = data.signupUser;
      dispatch(initUserPersit({
        jsWebToken: token,
        id: user.id,
        name: user.name,
        coins: user.coins,
        bet_won: user.bet_won,
        bet_lost: user.bet_lost,
        bet_pending: user.bet_pending
      }));

      const info = await getDeviceInfo();
      saveDeviceInfo({
        variables: {
          jsWebToken: token,
          ...info
        }
      })

      navigation.dispatch(StackActions.popToTop());
      setLoading(false);
      navigation.dispatch(
          StackActions.replace('Home')
      );
    },
    onError(error){ // TODO: Fix the error handling
      setLoading(false);
      if(error.toString().includes("1"))
        return setErrorUsername(true);
      if(error.toString("2"))
        return setErrorEmail(true)

      setErrorCompletion(true)
    }
  });


  const [saveDeviceInfo] = useMutation(SAVE_DEVICE_INFO, {
    onCompleted(data){
      console.log("Data : ", data);
    },
    onError(error){
      console.log("Error ", error);
    }
  });


  const handleSignupUser = async () => {
    if(!nameValue || !emailValue || !passwordConfirmationValue || !passwordValue || loading)
      return setErrorCompletion(true);

    //TODO: Handle error: if confirmation password incorrect
    if(passwordValue !== passwordConfirmationValue)
      return setErrorPasswordConfirmation(true);

    setLoading(true);
    signupUser({
      variables: {
        name: nameValue,
        email: emailValue.toLowerCase(),
        password: passwordValue,
        invitedBy: inviteCode,
        fcmtoken: fcmtoken
      }
    })

    await analytics().logEvent('create_user_button');

  };

  const handleAlreadyRegistered = async () => {
    await analytics().logEvent('already_registered_user');
    navigation.navigate("Login")
  }


  const loadingComp =  <ActivityIndicator size="large" color="#fff"/>;

  return (
      <ImageBackground source={BackgroundImage} style={styles.container}>
        <LinearGradient
            colors={['#046572', '#4949D4']}
            style={styles.linearGradient}
        />
        <KeyboardAwareScrollView>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
              <View style={{ flexDirection: "row"}}>
                <Text style={[styles.headerTitles, styles.white]}>Sport</Text>
                <Text style={[styles.headerTitles, styles.yellow]}>King</Text>
              </View>
              <View style={styles.loginSection}>
                <CustomTextInput value={nameValue} onValueChange={(v) =>{
                  setErrorUsername(false);
                  setErrorEmail(false)
                  setErrorCompletion(false);
                  setErrorPasswordConfirmation(false)
                  setNameValue(v);
                }} placeHolder="Username" icon={<AntDesign style={{ marginRight: moderateScale(10)}} name="user" size={20} color="#B3B3B6" />}/>
                { errorUsername && <Text style={styles.errorText}>Username not available !</Text> }
                <CustomTextInput value={emailValue} onValueChange={(v) => {
                  setErrorUsername(false);
                  setErrorEmail(false)
                  setErrorCompletion(false);
                  setErrorPasswordConfirmation(false)
                  setEmailValue(v);
                }} placeHolder="E-mail" icon={<Feather style={{ marginRight: moderateScale(10)}} name="at-sign" size={20} color="#B3B3B6" />}/>
                { errorEmail && <Text style={styles.errorText}>You already have an account with that email !</Text> }
                <CustomTextInput value={passwordValue} onValueChange={(v) => {
                  setErrorUsername(false);
                  setErrorEmail(false)
                  setErrorCompletion(false);
                  setErrorPasswordConfirmation(false)
                  setPasswordValue(v);
                }} password placeHolder="Password" icon={<AntDesign style={{ marginRight: moderateScale(10)}} name="lock" size={20} color="#B3B3B6" />}/>
                <CustomTextInput value={passwordConfirmationValue} onValueChange={(v) => {
                  setErrorUsername(false);
                  setErrorEmail(false)
                  setErrorCompletion(false)
                  setErrorPasswordConfirmation(false)
                  setPasswordConfirmationValue(v)
                }} password placeHolder="Confirm Password" icon={<AntDesign style={{ marginRight: moderateScale(10)}} name="lock" size={20} color="#B3B3B6" />}/>
                { errorPasswordConfirmation && <Text style={styles.errorText}>The password don't match!</Text> }
                <CustomTextInput value={inviteCode} onValueChange={(v) => {
                  setErrorUsername(false);
                  setErrorEmail(false)
                  setErrorCompletion(false);
                  setErrorPasswordConfirmation(false)
                  setInviteCode(v);
                }} placeHolder="Invite Code(Optional)" icon={<AntDesign style={{ marginRight: moderateScale(10)}} name="barcode" size={20} color="#B3B3B6" />}/>
                { errorCompletion && <Text style={styles.errorText}>Please complete the form</Text> }
                <MainButton onClick={handleSignupUser} text={loading? loadingComp : "CREATE AN ACCOUNT"} color={"#19D8B7"} arrow={arrowImage}/>
                <TouchableOpacity onPress={handleAlreadyRegistered}>
                  <Text style={styles.newUserText}>Already have an account? {"\n"}  Click here to sign in </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
      </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  linearGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
    opacity: 0.7
  },
  content: {
    flex: 1,
    paddingTop: getStatusBarHeight(),
    alignItems: "center",
    padding: moderateScale(20),
    // justifyContent: "space-between"
  },
  headerTitles: {
    fontSize: moderateScale(50),
    fontFamily: "GROBOLD",
    marginTop: moderateScale(50),
    marginBottom: moderateScale(100)
  },
  forgetText: {
    fontSize: moderateScale(14),
    fontFamily: "OpenSans-Bold",
    color: "#36C0B0",
    textDecorationLine: 'underline',
    marginBottom: moderateScale(10)
  },
  white: {
    color: "#fff"
  },
  yellow: {
    color: "#FDE88E"
  },
  loginSection: {
    width: "100%"
  },
  newUserText: {
    textAlign: "center",
    fontSize: moderateScale(14),
    fontFamily: "OpenSans-Bold",
    color: "#36C0B0",
    textDecorationLine: 'underline',
  },
  errorText: {
    color: "red",
    fontSize: moderateScale(14),
    fontWeight: "bold"
  }
});

export default Register;

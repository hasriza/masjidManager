import {ActivityIndicator, Alert, Platform, View} from 'react-native';
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import React, {useEffect} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import {AuthContext} from './container/context';
import BookmarkScreen from './components/BookmarkScreen';
import {DrawerContent} from './components/DrawerContent';
import MainTabScreen from './components/MainTabScreen';
import NetInfo from '@react-native-community/netinfo';
import RootStackScreen from './components/RootStackScreen';
import SettingsScreen from './components/SettingsScreen';
import SupportScreen from './components/SupportScreen';
import {createDrawerNavigator} from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

const App = () => {
  // const [isLoading, setIsLoading] = React.useState(true);
  // const [userToken, setUserToken] = React.useState(null);

  global.sAddr = 'http://192.168.2.12:82/MQWeb/php';

  const [isDarkTheme, setIsDarkTheme] = React.useState(false);

  const CustomDefaultTheme = {
    ...NavigationDefaultTheme,
    ...PaperDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      ...PaperDefaultTheme.colors,
      background: '#ffffff',
      text: '#333333',
      grey: '#878787',
      greyParent: '#6e6b6b',
    },
  };

  const CustomDarkTheme = {
    ...NavigationDarkTheme,
    ...PaperDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      ...PaperDarkTheme.colors,
      background: '#333333',
      text: '#ffffff',
      grey: '#969696',
      greyParent: '#b5b5b5',
    },
  };

  const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;
  let themeType = React.useRef();
  themeType.current = isDarkTheme;

  const initialLoginState = {
    isLoading: true,
    userName: null,
    password: null,
    userToken: null,
    isOnline: true,
    checkIn: null,
  };

  const loginReducer = (prevState, action) => {
    switch (action.type) {
      case 'RETRIEVE_TOKEN':
        return {
          ...prevState,
          userToken: action.token,
          userName: action.name,
          password: action.password,
          isLoading: false,
        };
      case 'LOGIN':
        return {
          ...prevState,
          userName: action.id,
          password: action.pass,
          userToken: action.token,
          checkIn: action.checkin,
          isLoading: false,
        };
      case 'LOGOUT':
        return {
          ...prevState,
          userName: null,
          password: null,
          userToken: null,
          isLoading: false,
        };
    }
  };

  const [loginState, dispatch] = React.useReducer(
    loginReducer,
    initialLoginState,
  );

  const authContext = React.useMemo(
    () => ({
      store: loginState,
      signIn: async (user) => {
        // setUserToken('fgkj');
        // setIsLoading(false);
        const userToken = String(user[0].userToken);
        const userName = user[0].username;
        const password = user[0].password;
        const checkin = user[0].checkIn;
        try {
          await AsyncStorage.setItem('userToken', userToken);
          await AsyncStorage.setItem('userName', userName);
          await AsyncStorage.setItem('password', password);
        } catch (e) {
          console.log(e);
        }
        // console.log('user token: ', userToken);
        dispatch({
          type: 'LOGIN',
          id: userName,
          pass: password,
          token: userToken,
          checkin,
        });
      },
      signOut: async () => {
        // setUserToken(null);
        // setIsLoading(false);
        console.log(loginState);
        try {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userName');
          await AsyncStorage.removeItem('password');
        } catch (e) {
          console.log(e);
        }
        dispatch({type: 'LOGOUT'});
      },
      toggleTheme: async () => {
        // eslint-disable-next-line no-shadow
        setIsDarkTheme((isDarkTheme) => !isDarkTheme);
        try {
          themeType.current = !themeType.current;
          await AsyncStorage.setItem('theme', themeType.current.toString());
        } catch (e) {
          console.log(e);
        }
      },
      checkOnline: () => {
        if (Platform.OS === 'android') {
          NetInfo.fetch().then((state) => {
            if (state.isInternetReachable) {
              return;
            } else {
              Alert.alert('Connection Error!', 'Check Internet', [
                {text: 'Okay'},
              ]);
            }
          });
        } else {
          // For iOS devices
          NetInfo.addEventListener(
            'connectionChange',
            handleFirstConnectivityChange,
          );
        }
      },
    }),
    [handleFirstConnectivityChange, loginState],
  );

  const handleFirstConnectivityChange = React.useCallback((state) => {
    NetInfo.removeEventListener(
      'connectionChange',
      handleFirstConnectivityChange,
    );

    if (state.isConnected === false) {
      Alert.alert('Connection Error!', 'Check Internet', [{text: 'Okay'}]);
    } else {
      return;
    }
  }, []);

  useEffect(() => {
    setTimeout(async () => {
      // setIsLoading(false);
      let userToken = null;
      let userName = null;
      let password = null;
      let dTheme = false;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        userName = await AsyncStorage.getItem('userName');
        password = await AsyncStorage.getItem('password');
        dTheme = await AsyncStorage.getItem('theme');
      } catch (e) {
        console.log(e);
      }
      setIsDarkTheme(dTheme === 'true' ? true : false);
      // console.log('user token: ', userToken);
      dispatch({
        type: 'RETRIEVE_TOKEN',
        token: userToken,
        name: userName,
        password: password,
      });
    }, 1000);
  }, []);

  if (loginState.isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }
  return (
    <PaperProvider theme={theme}>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer theme={theme}>
          {loginState.userToken !== null ? (
            <Drawer.Navigator
              drawerContent={(props) => <DrawerContent {...props} />}>
              <Drawer.Screen
                name="HomeScreen"
                component={MainTabScreen}
                // options={serverAddress}
              />
              <Drawer.Screen name="SupportScreen" component={SupportScreen} />
              <Drawer.Screen name="SettingsScreen" component={SettingsScreen} />
              <Drawer.Screen name="BookmarkScreen" component={BookmarkScreen} />
            </Drawer.Navigator>
          ) : (
            <RootStackScreen />
          )}
        </NavigationContainer>
      </AuthContext.Provider>
    </PaperProvider>
  );
};

export default App;

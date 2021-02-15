/* eslint-disable react-hooks/exhaustive-deps */

import {ActivityIndicator, Alert, Text, View} from 'react-native';

import {AuthContext} from './context';
import {Drawer} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import React from 'react';
import TreeView from 'react-native-final-tree-view';
import axios from 'axios';
import {useTheme} from '@react-navigation/native';

const GetMenu = (props) => {
  const {signOut, store} = React.useContext(AuthContext);

  const {colors} = useTheme();
  const theme = useTheme();

  const [isLoading, setIsLoading] = React.useState(true);
  const [menuFinal, setMenuFinal] = React.useState([]);
  const [userDetails, setUserDetails] = React.useState([]);

  React.useEffect(() => {
    const user = store;
    var formData = new FormData();
    formData.append('username', user.userName);
    formData.append('password', user.password);
    axios
      .post(global.sAddr + '/Login.php?action=get_user_details', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(
        (response) => {
          //fail
          if (response.data === 0) {
            Alert.alert('Invalid User!', 'Username or password is incorrect.', [
              {text: 'Okay'},
            ]);
            signOut();
          }
          //success
          setUserDetails({
            keycode: response.data.KEYCODE,
            parentKeyCode: response.data.PARENTKEYCODE,
            parentName: response.data.PARENTNAME,
            superUser: response.data.SUPERUSER,
          });
          var x = new FormData();
          x.append('userkey', response.data.KEYCODE);
          return axios.post(global.sAddr + '/menu.php?action=LoadMenu', x, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        },
        (error) => {
          Alert.alert('Service Unreachable.', [{text: 'Okay'}]);
          return;
        },
      )
      .then(
        (res) => {
          //fail
          if (res.data === 0) {
            Alert.alert('Invalid User!', 'Username or password is incorrect.', [
              {text: 'Okay'},
            ]);
            signOut();
          }
          //success
          setMenuFinal(res.data);
          return;
        },
        (error) => {
          Alert.alert('Service Unreachable.', [{text: 'Okay'}]);
          return;
        },
      )
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  function treeGen(menu) {
    var map = {},
      node,
      roots = [],
      i;

    for (i = 0; i < menu.length; i += 1) {
      map[menu[i].KEYCODE] = i;
      menu[i].id = menu[i].KEYCODE;
      menu[i].children = [];
    }
    for (i = 0; i < menu.length; i += 1) {
      node = menu[i];
      if (node.PARENTKEYCODE !== '0') {
        menu[map[node.PARENTKEYCODE]].children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  function getIndicator(isExpanded, hasChildrenNodes) {
    if (!hasChildrenNodes) {
      return ' ';
    } else if (isExpanded) {
      return <Icon name="menu-right-outline" size={18} />;
    } else {
      return <Icon name="menu-down-outline" size={18} />;
    }
  }

  return (
    <View>
      {isLoading && (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 3,
          }}>
          <ActivityIndicator size="small" color="#00ff00" />
        </View>
      )}
      {!isLoading && (
        <Drawer.Section title="Operations" styles={props.style}>
          <TreeView
            key="finalTreeRendered"
            data={treeGen(menuFinal)} // defined above
            renderNode={({node, level, isExpanded, hasChildrenNodes}) => {
              return (
                <View style={{paddingBottom: 3, paddingLeft: 15}}>
                  {hasChildrenNodes && (
                    <Text
                      key={node.KEYCODE}
                      style={{
                        color: colors.greyParent,
                        fontSize: 15 - level * 1.5,
                        padding: 5,
                        paddingLeft: 0,
                      }}>
                      {getIndicator(isExpanded, hasChildrenNodes)}
                      <Icon name={node.ParentIcon} size={18} />
                      {'    ' + node.MENUNAME}
                    </Text>
                  )}
                  {!hasChildrenNodes && (
                    <Text
                      key={node.KEYCODE}
                      style={{
                        color: colors.grey,
                        padding: 3,
                        fontSize: 15 - level * 1.15,
                      }}
                      onPress={() => {
                        Alert.alert(node.MENUNAME + ' Clicked');
                      }}>
                      {getIndicator(isExpanded, hasChildrenNodes)}
                      {node.MENUNAME}
                    </Text>
                  )}
                </View>
              );
            }}
          />
        </Drawer.Section>
      )}
    </View>
  );
};

export default GetMenu;

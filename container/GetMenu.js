/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */

import {Alert, Image, Text, View} from 'react-native';

import {AuthContext} from './context';
import {Drawer} from 'react-native-paper';
import React from 'react';
import TreeView from 'react-native-final-tree-view';
import axios from 'axios';

// import {List} from 'react-native-paper';

const GetMenu = (props) => {
  const {signOut, setUserDets, store, collectMenu} = React.useContext(
    AuthContext,
  );

  const [isLoading, setIsLoading] = React.useState(true);
  const [menuFinal, setMenuFinal] = React.useState([]);
  const [userDetails, setUserDetails] = React.useState([]);

  const textColor = store.currTheme ? '#333333' : '#ffffff';

  const storeChecker = store.menu === null ? false : true;

  React.useEffect(() => {
    if (storeChecker) {
      console.log(userDetails, menuFinal);
      setUserDets(userDetails);
      collectMenu(menuFinal);
    }
  }, []);

  React.useEffect(() => {
    if (!storeChecker) {
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
              Alert.alert(
                'Invalid User!',
                'Username or password is incorrect.',
                [{text: 'Okay'}],
              );
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
              Alert.alert(
                'Invalid User!',
                'Username or password is incorrect.',
                [{text: 'Okay'}],
              );
              signOut();
            }
            //success
            setMenuFinal(res.data);
          },
          (error) => {
            Alert.alert('Service Unreachable.', [{text: 'Okay'}]);
            return;
          },
        )
        .finally(() => {
          setIsLoading(false);
        });
    }
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
      return '*';
    } else if (isExpanded) {
      return '⤴';
    } else {
      return '⤵';
    }
  }

  console.log(store.currTheme, textColor);

  return (
    <View>
      {isLoading && <Text>Loading...</Text>}
      {!isLoading && (
        <Drawer.Section title="Operations" styles={props.style}>
          <TreeView
            key="finalTreeRendered"
            data={treeGen(menuFinal)} // defined above
            renderNode={({node, level, isExpanded, hasChildrenNodes}) => {
              return (
                <View>
                  {hasChildrenNodes && (
                    <Text
                      key={node.KEYCODE}
                      style={{
                        color: textColor,
                        paddingLeft: 15 * level,
                        /*prettier-ignore*/
                        fontSize: 16 - (level * 1.5),
                      }}>
                      {getIndicator(isExpanded, hasChildrenNodes)}{' '}
                      {node.MENUNAME}
                    </Text>
                  )}
                  {!hasChildrenNodes && (
                    <Text
                      key={node.KEYCODE}
                      style={{
                        color: textColor,
                        paddingLeft: 15 * level,
                        /*prettier-ignore*/
                        fontSize: 16 - (level * 1.5),
                      }}
                      onPress={() => {
                        Alert.alert(node.MENUNAME + ' Clicked');
                      }}>
                      {getIndicator(isExpanded, hasChildrenNodes)}{' '}
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

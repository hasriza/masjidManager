/* eslint-disable react-hooks/exhaustive-deps */

import {Alert, Text} from 'react-native';

import {AuthContext} from './context';
import {List} from 'react-native-paper';
import React from 'react';
import axios from 'axios';

// import {List} from 'react-native-paper';

const GetMenu = () => {
  const [userDetails, setUserDetails] = React.useState([]);
  const [menuItems, setMenuItems] = React.useState([]);

  const {signOut, setUserDets, store, collectMenu} = React.useContext(
    AuthContext,
  );

  React.useEffect(() => {
    if (store.menu === null) {
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
            setUserDets(userDetails);
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
            setMenuItems(res.data);
            collectMenu(res.data);
          },
          (error) => {
            Alert.alert('Service Unreachable.', [{text: 'Okay'}]);
            return;
          },
        );
    }
  }, []);

  return (
    <Text></Text>
    // <List.AccordionGroup>
    //   {menuItems
    //     .filter((mainMenuItem) => mainMenuItem.PARENTKEYCODE === '0')
    //     .map((mainItem) => (
    //       <List.Accordion
    //         key={mainItem.KEYCODE}
    //         title={mainItem.MENUNAME}
    //         id={mainItem.KEYCODE}>
    //         {menuItems
    //           .filter(
    //             (childList) => childList.PARENTKEYCODE === mainItem.KEYCODE,
    //           )
    //           .map((child) => (
    //             <List.Accordion
    //               key={child.KEYCODE}
    //               title={child.MENUNAME}
    //               id={child.KEYCODE}>
    //               {menuItems
    //                 .filter((leaf) => leaf.PARENTKEYCODE === child.KEYCODE)
    //                 .map((c) => (
    //                   <List.Item key={c.KEYCODE} title={c.MENUNAME} />
    //                 ))}
    //             </List.Accordion>
    //           ))}
    //       </List.Accordion>
    //     ))}
    // </List.AccordionGroup>
  );
};

export default GetMenu;

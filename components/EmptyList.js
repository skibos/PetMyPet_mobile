import React from 'react';
import { Text, View } from 'react-native';

const EmptyList = (props) => {
  return (
    <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
      <Text>{props.message}</Text>
    </View>
  );
}

export default EmptyList;
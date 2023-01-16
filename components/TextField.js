import React, { useEffect, useRef, useState } from 'react'
import {
  Text,
  TextInput,
  StyleSheet,
  View,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native'

const TextField = (props) => {
  const {
    label,
    labelTop,
    value,
    style,
    onBlur,
    onFocus,
    ...restOfProps
  } = props
  const [isFocused, setIsFocused] = useState(false)
  const [isValueSet, changeIsValueSet] = useState(false)

  const inputRef = useRef(null)
  const focusAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused || !!value ? 1 : 0,
      duration: 150,
      easing: Easing.linear(),
      useNativeDriver: true,
    }).start()
    if(!!value || isFocused){
      changeIsValueSet(true)
    }
    else{
      changeIsValueSet(false)
    }
  }, [focusAnim, isFocused, value])

  let color = "grey"

  return (
    <View>
      <TextInput
        ref={inputRef}
        style={style}
        {...restOfProps}
        value={value}
        onBlur={(event) => {
          setIsFocused(false)
          onBlur?.(event)
        }}
        onFocus={(event) => {
          if(props.isData){
            props.showData()
            inputRef?.current?.blur();
          }
          setIsFocused(true)
          onFocus?.(event)
        }}
        caretHidden={props.isData ? true : false}
        showSoftInputOnFocus={props.isData ? false : true}
      />
      <TouchableWithoutFeedback onPress={() => {
        inputRef.current?.focus()
      }}>
        <Animated.View
        style={[
          styles.labelContainer,
          {
            transform: [
              {
                scale: focusAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.8],
                }),
              },
              {
                translateY: focusAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
              {
                translateX: focusAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [6, -20],
                }),
              },
            ],
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            {
              color,
            },
          ]}
        >
          {isValueSet ? labelTop : label}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>

    </View>
  )
}

const styles = StyleSheet.create({
  labelContainer: {
    width: 200,
    position: 'absolute',
    paddingHorizontal: 6,
  },
  label: {
    fontSize: 14,
  },
})

export default TextField
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView } from "react-native"

export default CustomInput = (props) => {
    const [isTextFocused, setIsTextFocused] = useState(false)
    const textInputReference = useRef(null);

    const onFocusChange = () => {
        setIsTextFocused(true)
    }

    const onBlurChange = () => {
        setIsTextFocused(false)
    }

    const checkInputContainer = () => {
        return {
            borderColor: isTextFocused ? "#106BB1" : "#bfbfbf",
            borderWidth: 1,
            borderRadius: 10,
            margin: 5,
        }
    }

    const checkInputTitle = () => {
        return {
            color: isTextFocused ? "#106BB1" : "#878787",
            marginLeft: 5,
            marginTop: 5
        }
    }

    return (
        <View style={checkInputContainer()}>
            <Text style={checkInputTitle()}>{props.inputTitle}</Text>
            <TextInput
                ref={textInputReference}
                style={[styles.input, props.extraStyle]}
                onFocus={onFocusChange}
                onBlur={onBlurChange}
                {...props}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    input: {
        width: 270,
        padding: 10,
        paddingTop: 5,
        marginLeft: 4,
        fontSize: 16,
        color: "black"
    },
})
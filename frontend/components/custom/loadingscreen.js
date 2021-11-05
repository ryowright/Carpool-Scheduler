import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function LoadingScreen () {
  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>
                Loading...
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold'
  }
})

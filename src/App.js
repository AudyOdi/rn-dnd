// @flow

import React from 'react';
import {StyleSheet, Text, View, ScrollView, Image} from 'react-native';

import cardFixture from './cardFixture';

type Item = {
  id: number,
  text: string,
  image: string
};

type State = {
  cards: Array<Item>
};

export default class App extends React.Component<{}, State> {
  constructor() {
    super(...arguments);
    this.state = {
      cards: cardFixture
    };
  }
  render() {
    let {cards} = this.state;
    return (
      <View style={styles.container}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#b3c8e7'
          }}
        >
          <Text>Drop Here</Text>
        </View>
        <View>
          <ScrollView horizontal>
            {cards.map(card => {
              return (
                <View key={card.id} style={styles.card}>
                  <Image source={{uri: card.image}} style={{flex: 1}}>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Text>{card.text}</Text>
                    </View>
                  </Image>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  card: {
    height: 150,
    width: 120
  }
});

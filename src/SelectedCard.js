// @flow

import React from 'react';
import PropTypes from 'prop-types';
import {View, Text, Image, Animated} from 'react-native';

type Context = {
  gesturePosition: Animated.ValueXY
};

type Props = {
  selectedCard: {
    card: {id: number, text: string, image: string},
    measurement: Object
  }
};

export default class SelectedCard extends React.Component<Props> {
  context: Context;
  static contextTypes = {
    gesturePosition: PropTypes.object
  };
  render() {
    let {selectedCard: {card, measurement}} = this.props;
    let {gesturePosition} = this.context;
    let animatedStyle = {
      transform: gesturePosition.getTranslateTransform()
    };
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10
        }}
      >
        <Animated.View
          style={[
            {
              width: measurement.w,
              height: measurement.h
            },
            animatedStyle
          ]}
        >
          <Image source={{uri: card.image}} style={{flex: 1}} />
        </Animated.View>
      </View>
    );
  }
}

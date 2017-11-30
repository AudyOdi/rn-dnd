// @flow

import React from 'react';
import PropTypes from 'prop-types';
import {View, Text, Image, Animated} from 'react-native';

type Context = {
  gesturePosition: Animated.ValueXY,
  getDropZoneMeasurement: () => ?Object
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
    gesturePosition: PropTypes.object,
    getDropZoneMeasurement: PropTypes.func
  };
  render() {
    let {selectedCard: {card, measurement}} = this.props;
    let {gesturePosition, getDropZoneMeasurement} = this.context;
    let dropZone = getDropZoneMeasurement();
    let opacity = gesturePosition.y.interpolate({
      inputRange: [
        (dropZone && dropZone.height / 8) || 38,
        (dropZone && dropZone.height / 4) || 75,
        (dropZone && dropZone.height / 2) || 150,
        (dropZone && dropZone.height) || 300
      ],
      outputRange: [0.2, 0.8, 1, 1],
      extrapolate: 'clamp'
    });
    let animatedStyle = {
      transform: gesturePosition.getTranslateTransform(),
      opacity
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

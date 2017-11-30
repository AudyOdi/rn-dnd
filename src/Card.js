// @flow

import React, {Component} from 'react';
import autobind from 'class-autobind';
import PropTypes from 'prop-types';
import ReactNative, {
  View,
  Text,
  Image,
  PanResponder,
  Animated
} from 'react-native';
import measureNode from './measureNode';

import type {Card, Measurement} from './types';

type Context = {
  gesturePosition: Animated.ValueXY,
  getScrollPosition: () => number
};

type Props = {
  card: Card,
  index: number,
  onGestureStart: (
    card: Card,
    measurement: Measurement,
    onSuccess?: () => void
  ) => void,
  onGestureStop: (gestureState: Object, onSuccess?: () => void) => void
};

export default class CardComponent extends Component<Props> {
  context: Context;
  _gesture: Object;
  _parent: ?Object;
  _selectedCard: ?Object;
  _gestureInProgress: ?string;
  _opacity: Animated.Value;

  static contextTypes = {
    gesturePosition: PropTypes.object,
    getScrollPosition: PropTypes.func
  };

  constructor() {
    super(...arguments);
    autobind(this);

    this._opacity = new Animated.Value(1);

    this._gesture = PanResponder.create({
      onMoveShouldSetResponderCapture: (e, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (e, gestureState) => {
        return (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          gestureState.dy < 0
        );
      },

      onPanResponderGrant: this._onGestureStart,
      onPanResponderMove: this._onGestureMove,
      onPanResponderRelease: this._onGestureRelease,
      onPanResponderTerminationRequest: () => {
        return this._gestureInProgress == null;
      },
      onPanResponderTerminate: (event, gestureState) => {
        this._onGestureRelease(event, gestureState);
      }
    });
  }
  render() {
    let {card} = this.props;
    return (
      <Animated.View
        ref={node => (this._selectedCard = node)}
        style={{
          height: 150,
          width: 120,
          opacity: this._opacity
        }}
        {...this._gesture.panHandlers}
      >
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
      </Animated.View>
    );
  }

  async _onGestureStart(e, gestureState) {
    if (this._gestureInProgress) {
      return;
    }

    this._gestureInProgress = gestureState.stateID;

    let {onGestureStart, card} = this.props;
    let {gesturePosition, getScrollPosition} = this.context;

    let selectedCardMeasurement = await this._measureSelectedCard();

    onGestureStart(card, selectedCardMeasurement, () => {
      this._opacity.setValue(0);
    });
  }

  _onGestureMove(event: Event, gestureState: Object) {
    if (!this._gestureInProgress) {
      return;
    }

    let {gesturePosition} = this.context;
    let {dx, dy} = gestureState;

    gesturePosition.x.setValue(dx);
    gesturePosition.y.setValue(dy);
  }

  _onGestureRelease(e, gestureState) {
    if (this._gestureInProgress !== gestureState.stateID) {
      return;
    }
    this._gestureInProgress = null;
    this.props.onGestureStop(gestureState, () => {
      this._opacity.setValue(1);
    });
  }

  async _measureSelectedCard() {
    let photoComponent = ReactNative.findNodeHandle(this._selectedCard);

    let photoMeasurement = await measureNode(photoComponent);

    return {
      x: photoMeasurement.x,
      y: photoMeasurement.y,
      w: photoMeasurement.w,
      h: photoMeasurement.h
    };
  }
}

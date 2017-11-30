// @flow

import React from 'react';
import autobind from 'class-autobind';
import PropTypes from 'prop-types';
import ReactNative, {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Alert,
  Animated,
  Easing
} from 'react-native';

import CardComponent from './Card';
import SelectedCard from './SelectedCard';
import measureNode from './measureNode';

import cardFixture from './cardFixture';

import type {Card, Measurement} from './types';

type State = {
  cards: Array<Card>,
  selectedCard: ?{
    card: Card,
    measurement: Measurement
  },
  isDragging: boolean
};

export default class App extends React.Component<{}, State> {
  _gesturePosition: Animated.ValueXY;
  _listContainer: ?Object;
  _scrollValue: Animated.Value;
  _scrollPosition: number;
  _listContainerMeasurement: ?Measurement;
  _dropZone: ?Object;

  static childContextTypes = {
    gesturePosition: PropTypes.object,
    getScrollPosition: PropTypes.func,
    getDropZoneMeasurement: PropTypes.func
  };

  getChildContext() {
    return {
      gesturePosition: this._gesturePosition,
      getScrollPosition: this._getScrollPosition,
      getDropZoneMeasurement: () => this._dropZone
    };
  }

  constructor() {
    super(...arguments);
    autobind(this);
    this.state = {
      cards: cardFixture,
      selectedCard: null,
      isDragging: false
    };

    this._gesturePosition = new Animated.ValueXY({x: 0, y: 0});
    this._scrollValue = new Animated.Value(0);
    this._scrollPosition = 0;
    this._scrollValue.addListener(({value}) => {
      this._scrollPosition = value;
    });
  }

  render() {
    let {cards, selectedCard, isDragging} = this.state;
    return (
      <View style={styles.container}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#b3c8e7'
          }}
          onLayout={event => {
            this._dropZone = event.nativeEvent.layout;
          }}
        >
          <Text>Drop Here</Text>
        </View>
        <View ref={node => (this._listContainer = node)}>
          <Animated.ScrollView
            horizontal
            scrollEventThrottle={1}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {x: this._scrollValue}}}],
              {useNativeDriver: true}
            )}
            scrollEnabled={!isDragging}
          >
            {cards.map((card, index) => {
              return (
                <CardComponent
                  key={card.id}
                  index={index}
                  card={card}
                  onGestureStart={(
                    card: Card,
                    measurement: Measurement,
                    onSuccess?: () => void
                  ) => {
                    this._onGestureStart(card, measurement, onSuccess);
                  }}
                  onGestureStop={this._onGestureStop}
                />
              );
            })}
          </Animated.ScrollView>
        </View>
        {selectedCard &&
          isDragging && <SelectedCard selectedCard={selectedCard} />}
      </View>
    );
  }

  _getScrollPosition() {
    return this._scrollPosition;
  }

  async _onGestureStart(
    card: Card,
    measurement: Measurement,
    onSuccess?: () => void
  ) {
    let listContainer = ReactNative.findNodeHandle(this._listContainer);

    let listContainerMeasurement = await measureNode(listContainer);
    this._listContainerMeasurement = listContainerMeasurement;

    this._gesturePosition.setValue({
      x: 0,
      y: 0
    });

    this._gesturePosition.setOffset({
      x: measurement.x - this._getScrollPosition(),
      y: listContainerMeasurement.y
    });

    this.setState(
      {
        selectedCard: {
          card,
          measurement
        },
        isDragging: true
      },
      () => {
        onSuccess && onSuccess();
      }
    );
  }

  _onGestureStop(gesture: Object, onSuccess?: () => void) {
    let {selectedCard} = this.state;
    if (this._dropZone && selectedCard && this._listContainerMeasurement) {
      let dropZoneMeasurement = this._dropZone;
      let {card, measurement: cardMeasurement} = selectedCard;
      let listContainerMeasurement = this._listContainerMeasurement;

      let [, translateY] = this._gesturePosition.getTranslateTransform();

      let {vx, vy, dy} = gesture;
      let animation = {start: callback => callback()};
      if (Math.abs(vy) > 0.4) {
        animation = Animated.decay(this._gesturePosition, {
          velocity: {x: vx, y: vy},
          deceleration: 0.983
        });
      }

      animation.start(() => {
        let isInside =
          listContainerMeasurement.y +
            this._gesturePosition.y._value +
            cardMeasurement.h <=
          dropZoneMeasurement.y + dropZoneMeasurement.height;

        if (isInside) {
          let {cards} = this.state;
          Alert.alert(`you'r dropping ${card.text}`);
          let cardIndex = cards.findIndex(({id}) => id === card.id);
          if (cardIndex > -1) {
            cards.splice(cardIndex, 1);
          }
          requestAnimationFrame(() => {
            this.setState({
              cards,
              selectedCard: null,
              isDragging: false
            });
          });
        } else {
          Animated.parallel([
            Animated.timing(this._gesturePosition.x, {
              toValue: 0,
              duration: 200,
              easing: Easing.ease
            }),
            Animated.timing(this._gesturePosition.y, {
              toValue: 0,
              duration: 200,
              easing: Easing.ease
            })
          ]).start(() => {
            onSuccess && onSuccess();

            this._gesturePosition.setOffset({
              x: cardMeasurement.x - this._getScrollPosition(),
              y: listContainerMeasurement.y
            });

            requestAnimationFrame(() => {
              this.setState({
                selectedCard: null,
                isDragging: false
              });
            });
          });
        }
      });
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});

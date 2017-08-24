import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Import actions.
import * as ordersActions from '../actions/ordersActions';
import * as paymentsActions from '../actions/paymentsActions';

// Components
import CheckoutSteps from '../components/CheckoutSteps';
import CartFooter from '../components/CartFooter';
import FormBlock from '../components/FormBlock';
import PaymentPhoneForm from '../components/PaymentPhoneForm';
import { stripTags, formatPrice } from '../utils';
import i18n from '../utils/i18n';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    padding: 14,
  },
  paymentItem: {
    padding: 14,
    marginLeft: -14,
    marginRight: -14,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#F1F1F1',
    backgroundColor: '#fff',
    marginBottom: 6,
    flexDirection: 'row',
  },
  paymentItemText: {
    fontSize: '0.9rem',
    paddingBottom: 6,
  },
  paymentItemDesc: {
    fontSize: '0.8rem',
    paddingBottom: 6,
    color: 'gray',
    marginTop: 10,
  },
  uncheckIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  checkIcon: {
    width: 20,
    height: 20,
    opacity: 0.2,
    marginRight: 6,
  }
});

class CheckoutStepThree extends Component {
  static propTypes = {
    cart: PropTypes.shape({
      items: PropTypes.arrayOf(PropTypes.object),
      fetching: PropTypes.bool,
    }),
    shipping_id: PropTypes.string,
    navigator: PropTypes.shape({
      push: PropTypes.func,
    }),
  };

  static navigatorStyle = {
    navBarBackgroundColor: '#FAFAFA',
    navBarButtonColor: 'black',
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedItem: null,
      items: [],
    };
  }

  componentDidMount() {
    const { cart } = this.props;
    const items = Object.keys(cart.payments).map(k => cart.payments[k]);
    // FIXME: Default selected payment method.
    const selectedItem = items[1];

    this.setState({
      items,
      selectedItem,
    });
  }

  renderItem = (item) => {
    // FIXME compare by name.
    const isSelected = item.payment === this.state.selectedItem.payment;
    return (
      <TouchableOpacity
        style={styles.paymentItem}
        onPress={() => {
          this.setState({
            selectedItem: item,
          }, () => {
            this.listView.scrollToOffset({ x: 0, y: 0, animated: true });
          });
        }}
      >
        {isSelected ?
          <Image source={require('../assets/icons/check-circle-o.png')} style={styles.uncheckIcon} /> :
          <Image source={require('../assets/icons/circle-o.png')} style={styles.checkIcon} />
        }
        <Text style={styles.paymentItemText}>
          {item.description}
        </Text>
      </TouchableOpacity>
    );
  }

  renderHeader() {
    const { selectedItem } = this.state;
    if (!selectedItem) {
      return null;
    }
    let form = (<PaymentPhoneForm />);
    if (selectedItem.payment === 'Visa, Mastercard, etc...') {
      form = (<PaymentPhoneForm />);
    }
    return (
      <View>
        <CheckoutSteps step={3} />
        <FormBlock
          title={i18n.gettext('Payment info')}
        >
          {form}
          <Text style={styles.paymentItemDesc}>
            {stripTags(selectedItem.instructions)}
          </Text>
        </FormBlock>
      </View>
    );
  }

  render() {
    const { cart } = this.props;
    return (
      <View style={styles.container}>
        <FlatList
          ref={ref => this.listView = ref}
          contentContainerStyle={styles.contentContainer}
          ListHeaderComponent={() => this.renderHeader()}
          data={this.state.items}
          keyExtractor={(item, index) => index}
          numColumns={1}
          renderItem={({ item }) => this.renderItem(item)}
        />
        <CartFooter
          totalPrice={formatPrice(cart.total)}
          btnText={i18n.gettext('Place order').toUpperCase()}
          isBtnDisabled={this.state.selectedId == null}
          onBtnPress={() => this.handleNextPress()}
        />
      </View>
    );
  }
}

export default connect(state => ({
  payments: state.payments,
  cart: state.cart,
}),
dispatch => ({
  ordersActions: bindActionCreators(ordersActions, dispatch),
  paymentsActions: bindActionCreators(paymentsActions, dispatch),
})
)(CheckoutStepThree);

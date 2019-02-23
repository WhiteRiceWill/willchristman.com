import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateItem } from '../../actions/sampleAction';
import Home from './Component';

// Pass state to component as props
const mapStateToProps = state => ({
  sampleItem: state.sampleReducer.items.sampleItem,
});

// Pass actions to the component as props
const mapDispatchToProps = dispatch => bindActionCreators({
  updateItem,
}, dispatch);

// Connect to Redux
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Home);

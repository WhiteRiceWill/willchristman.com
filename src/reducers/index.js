import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import sampleReducer from './sampleReducer';

// Combine the reducers and routing middleware
const rootReducer = combineReducers({
  routing: routerReducer,
  sampleReducer,
});

export default rootReducer;

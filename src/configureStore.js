
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { actionStorageMiddleware, createStorageListener } from 'redux-state-sync';
import createHistory from 'history/createBrowserHistory';
import rootReducer from './reducers';

// Create history
export const history = createHistory();

// Add middleware
const middleware = [
  thunk,
  actionStorageMiddleware,
];

// Set up redux persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = createStore(
  persistedReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(...middleware),
);

// Exclude every action except for ones that should persist between tabs
const config = {
  ignore: ['UPDATE_ITEM', 'DELETE_ITEM'],
};

// Listen for event changes so that other tabs will be updated with state
createStorageListener(store, config);

export const persistor = persistStore(store);

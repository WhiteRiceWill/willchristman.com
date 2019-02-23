const initialState = {
  items: {
    sampleItem: '',
  },
};

const sampleReducer = (state = initialState, action) => {
  switch (action.type) {
    // Update a user item
    case 'UPDATE_ITEM':
      return (() => {
        const newState = Object.assign({}, state);
        newState.items[action.itemName] = action.itemValue;
        return newState;
      })();
    // Delete a user item
    case 'DELETE_ITEM':
      return (() => {
        const newState = Object.assign({}, state);
        newState.items[action.itemName] = '';
        return newState;
      })();

    default:
      return state;
  }
};

export default sampleReducer;

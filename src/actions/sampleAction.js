export const updateItem = (itemName, itemValue) => ({
  type: 'UPDATE_ITEM',
  itemName,
  itemValue,
});

export const deleteItem = itemName => ({
  type: 'DELETE_ITEM',
  itemName,
});

export const CHANNELS = {
  user: (userId: string) => `private-user-${userId}`,
  admin: 'private-admin-notifications',
};

export const EVENTS = {
  ORDER_STATUS_UPDATED: 'order-status-updated',
  NEW_ORDER: 'new-order',
  NEW_NOTIFICATION: 'new-notification',
};
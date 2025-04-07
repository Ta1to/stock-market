import { ref } from 'vue';

// eslint-disable-next-line no-unused-vars
export function useCurrentUser(auth) {
  const currentUser = ref(null);
  const unsubscribeAuth = ref(null);
  const currentUserId = ref('');

  // We'll need the updateCurrentUserId function later, disabling eslint warning for now
  // eslint-disable-next-line no-unused-vars
  function updateCurrentUserId() {
    currentUserId.value = currentUser.value ? currentUser.value.uid : '';
  }

  return {
    currentUser,
    currentUserId,
    unsubscribeAuth
  };
}
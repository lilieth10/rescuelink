const CLIENT_ID_KEY = 'rescuelink_client_id';

export function getClientId(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }

  let clientId = localStorage.getItem(CLIENT_ID_KEY);

  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }

  return clientId;
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

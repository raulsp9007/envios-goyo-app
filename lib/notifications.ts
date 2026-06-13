export async function sendNewOrderEmail(_order: unknown, _items: unknown): Promise<void> {}
export async function sendWhatsAppNotification(_order: unknown): Promise<void> {}
export async function sendStatusChangeEmail(
  _email: string,
  _name: string,
  _orderNumber: number,
  _status: string,
): Promise<void> {}

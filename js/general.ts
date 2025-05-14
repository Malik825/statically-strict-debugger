// general.ts - Fixed implementation
export interface WifiConnection {
  wifiName: string;
  signal: 'excellent' | 'good' | 'poor';
  password?: string;
}

class General {
  protected addHidden(element: HTMLElement | null): void {
    if (element) {
      element.classList.add('hidden');
    }
  }

  protected removeHidden(element: HTMLElement | null): void {
    if (element) {
      element.classList.remove('hidden');
    }
  }

  protected toggleHidden(element: HTMLElement | null): void {
    if (element) {
      element.classList.toggle('hidden');
    }
  }

  protected getWifi(): WifiConnection[] {
    // Mock implementation - this would typically fetch from an API or local storage
    return [
      { wifiName: 'Home Network', signal: 'excellent' },
      { wifiName: 'Guest Network', signal: 'good' },
      { wifiName: 'Neighbor Network', signal: 'poor' }
    ];
  }

  displayNotification(message: string, position: InsertPosition, container: HTMLElement): void {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '×';
    notification.appendChild(closeBtn);
    container.insertAdjacentElement(position, notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

export default General;
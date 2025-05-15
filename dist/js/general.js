"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class General {
    addHidden(element) {
        if (element) {
            element.classList.add('hidden');
        }
    }
    removeHidden(element) {
        if (element) {
            element.classList.remove('hidden');
        }
    }
    toggleHidden(element) {
        if (element) {
            element.classList.toggle('hidden');
        }
    }
    getWifi() {
        // Mock implementation - this would typically fetch from an API or local storage
        return [
            { wifiName: 'Home Network', signal: 'excellent' },
            { wifiName: 'Guest Network', signal: 'good' },
            { wifiName: 'Neighbor Network', signal: 'poor' }
        ];
    }
    displayNotification(message, position, container) {
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
exports.default = General;

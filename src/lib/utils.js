export function scrollToBottom(callback) {
    const scrollingElement = document.scrollingElement;
    const scrollAmount = 10;
    const interval = 5;
    const scrollInterval = setInterval(() => {
        const isAtBottom = Math.abs((scrollingElement.scrollTop + scrollingElement.offsetHeight) - scrollingElement.scrollHeight) <= 20;
        if (isAtBottom) {
            clearInterval(scrollInterval);
            callback();
        } else {
            scrollingElement.scrollTop += scrollAmount;
        }
    }, interval);
}
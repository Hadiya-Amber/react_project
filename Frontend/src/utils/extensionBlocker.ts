// Aggressive extension blocker
const blockExtensionResources = () => {
  // Block fetch
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('content-all') || url.includes('fonts.css') || url.includes('en.json')) {
      return Promise.reject(new Error('Blocked'));
    }
    return originalFetch.call(this, input, init);
  };

  // Block XHR
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
    const urlStr = url.toString();
    if (urlStr.includes('content-all') || urlStr.includes('fonts.css') || urlStr.includes('en.json')) {
      throw new Error('Blocked');
    }
    return originalXHROpen.call(this, method, url, async ?? true, user ?? null, password ?? null);
  };

  // Block createElement for scripts and links
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: string) {
    const element = originalCreateElement.call(this, tagName);
    if (tagName === 'script' || tagName === 'link') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name: string, value: string) {
        if ((name === 'src' || name === 'href') && 
            (value.includes('content-all') || value.includes('fonts.css') || value.includes('en.json'))) {
          return;
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    return element;
  };
};

// Initialize immediately
if (typeof window !== 'undefined') {
  blockExtensionResources();
  
  // Remove existing extension elements
  const removeExtensionElements = () => {
    document.querySelectorAll('script[src*="content-all"], link[href*="content-all"], link[href*="fonts.css"]').forEach(el => el.remove());
  };
  
  // Run immediately and periodically
  removeExtensionElements();
  setInterval(removeExtensionElements, 500);
  
  // Block on DOM mutations
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(() => removeExtensionElements()).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
}

export { blockExtensionResources };
function request<T = any>(verb: 'GET' | 'POST', url: string, callback: (result: T | null, error?: any) => void): void {
  const xhr = new XMLHttpRequest();

  xhr.open(verb, url);

  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status <= 299) {
      const result = JSON.parse(xhr.response);
      callback(result);
    } else {
      callback(null, xhr.status);
    }
  };

  xhr.onerror = function () {
    callback(null, true);
  };

  xhr.send(); // TODO body or query params here
}

namespace request {
  export function get<T>(url: string, callback: (result: T | null, error?: any) => void) {
    return request('GET', url, callback);
  }
}

import http from 'http';

export const get = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    http.get(url, options, (response) => {
      let body = '';
      const {statusCode} = response;
      console.log(`Request: ${url}\nStatus: ${statusCode}\n`);
      response.on('data', (d) => {body += d});
      response.on('end', () => {
        if (statusCode >= 200 && statusCode < 300) {
          resolve(body);
        } else {
          reject(body, statusCode);
        }
      });

    }).on('error', err => reject);
  });
};

export const post = (url, body, options = {}) => {
  return new Promise((resolve, reject) => {
    const postRequest = http.request(url, {
      method: 'POST',
      ...options,
      headers: {
        ...(options.headers || {}),
        'Content-Type': 'application/json'
      }
    }, (response) => {
      let body = '';
      const {statusCode} = response;
      response.setEncoding('utf8');
      response.on('data', (d) => {body += d});
      response.on('end', () => {
        if (statusCode >= 200 && statusCode < 300) {
          resolve(body);
        } else {
          reject(body, statusCode);
        }
      });
    });
    postRequest.on('error', reject);
    postRequest.write(JSON.stringify(body));
    postRequest.end();
  });
};
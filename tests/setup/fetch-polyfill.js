// This file provides a global fetch polyfill for Jest tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  })
);

// Also mock FormData if needed
global.FormData = class FormData {
  append() {}
};

// Fix for ReferenceError: Request is not defined
global.Request = class Request {};
global.Response = class Response {};
global.Headers = class Headers {};
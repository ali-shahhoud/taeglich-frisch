export function encodeBase64(msg) {
  const utf8base64 = btoa(encodeURIComponent(msg).replace(/%([0-9A-F]{2})/g, (_, char) => {
    return String.fromCharCode(`0x${char}`);
  }));
  return `=?UTF-8?B?${utf8base64}?=`;
}

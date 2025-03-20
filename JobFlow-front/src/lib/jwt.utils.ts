export function formatJWTToken(token: string) {
  const decodedJwt = _parseJwt(token);
  if (!decodedJwt) return null;

  const { payload } = decodedJwt;

  return payload;
}

function _parseJwt(token: string) {
  // split the token into header, payload, and signature
  const [header, payload, signature] = token.split(".");

  // replace URL-safe characters with standard base64 characters
  const fixedHeader = header.replace(/-/g, "+").replace(/_/g, "/");
  const fixedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");

  // decode the header and payload from base64
  const decodedHeader = atob(fixedHeader);
  const decodedPayload = atob(fixedPayload);

  // parse the JSON objects from the decoded header and payload
  const headerObj = JSON.parse(decodedHeader);
  const payloadObj = JSON.parse(decodedPayload);

  // return an object with the decoded header, payload, and signature
  return {
    header: headerObj,
    payload: payloadObj,
    signature,
  };
}

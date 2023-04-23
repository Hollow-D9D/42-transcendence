export const getPayload = (headers): any => {
  const header = headers['authorization'];
  if (header !== undefined) {
    const token = header.split(' ')[1];
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString(),
    );
    return payload;
  } else {
    return null;
  }
};

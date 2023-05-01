export enum ChannelMode {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  PROTECTED = 'PROTECTED',
}

// `value is ChannelMode` allows to avoid type assertions wherever this function
// is used
export const isValidChannelMode = (value: any): value is ChannelMode => {
  return Object.values(ChannelMode).includes(value);
};

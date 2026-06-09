import { TextStyle } from 'react-native';

export const FontFamily = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
  extraBold: 'System',
};

export const Typography = {
  display: {
    fontSize: 36,
    fontWeight: '800' as TextStyle['fontWeight'],
    letterSpacing: -1.5,
    lineHeight: 44,
  } as TextStyle,
  h1: {
    fontSize: 30,
    fontWeight: '800' as TextStyle['fontWeight'],
    letterSpacing: -1,
    lineHeight: 38,
  } as TextStyle,
  h2: {
    fontSize: 24,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.5,
    lineHeight: 32,
  } as TextStyle,
  h3: {
    fontSize: 20,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.3,
    lineHeight: 28,
  } as TextStyle,
  h4: {
    fontSize: 17,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.2,
    lineHeight: 24,
  } as TextStyle,
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: 0,
    lineHeight: 26,
  } as TextStyle,
  body: {
    fontSize: 15,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: 0,
    lineHeight: 22,
  } as TextStyle,
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: 0,
    lineHeight: 20,
  } as TextStyle,
  label: {
    fontSize: 12,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.8,
    lineHeight: 16,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  } as TextStyle,
  caption: {
    fontSize: 12,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: 0.2,
    lineHeight: 16,
  } as TextStyle,
  button: {
    fontSize: 15,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.3,
    lineHeight: 20,
  } as TextStyle,
  buttonSm: {
    fontSize: 13,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.2,
    lineHeight: 18,
  } as TextStyle,
  overline: {
    fontSize: 11,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: 1.5,
    lineHeight: 16,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  } as TextStyle,
};

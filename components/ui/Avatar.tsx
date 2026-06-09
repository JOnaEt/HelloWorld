import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows } from '../../constants/layout';
import { FontWeights } from '../../constants/fonts';
import { getInitials } from '../../utils/format';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  showBorder?: boolean;
  borderColor?: string;
}

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 44,
  lg: 56,
  xl: 72,
  '2xl': 96,
};

const FONT_SIZE_MAP: Record<AvatarSize, number> = {
  xs: 9,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  '2xl': 34,
};

const COLORS = [
  '#16A34A', '#15803D', '#0EA5E9', '#8B5CF6',
  '#F59E0B', '#EF4444', '#EC4899', '#14B8A6',
];

function getColorForName(name: string): string {
  const code = name.charCodeAt(0) + (name.charCodeAt(1) ?? 0);
  return COLORS[code % COLORS.length];
}

export function Avatar({
  uri,
  name = '',
  size = 'md',
  style,
  showBorder = false,
  borderColor = Colors.white,
}: AvatarProps) {
  const dimension = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];
  const bgColor = getColorForName(name || 'A');

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    backgroundColor: bgColor,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...(showBorder ? { borderWidth: 2, borderColor } : {}),
  };

  return (
    <View style={[containerStyle, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: dimension, height: dimension }}
          resizeMode="cover"
          accessibilityLabel={name ? `${name}'s avatar` : 'User avatar'}
        />
      ) : (
        <Text style={[styles.initials, { fontSize }]}>
          {getInitials(name) || '?'}
        </Text>
      )}
    </View>
  );
}

// Avatar Group
interface AvatarGroupProps {
  avatars: Array<{ uri?: string | null; name?: string }>;
  max?: number;
  size?: AvatarSize;
  style?: ViewStyle;
}

export function AvatarGroup({ avatars, max = 4, size = 'sm', style }: AvatarGroupProps) {
  const dimension = SIZE_MAP[size];
  const overlap = dimension * 0.35;
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <View style={[{ flexDirection: 'row' }, style]}>
      {visible.map((av, i) => (
        <View key={i} style={{ marginLeft: i === 0 ? 0 : -overlap, zIndex: visible.length - i }}>
          <Avatar uri={av.uri} name={av.name} size={size} showBorder />
        </View>
      ))}
      {remaining > 0 && (
        <View
          style={[
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: Colors.gray200,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: -overlap,
              borderWidth: 2,
              borderColor: Colors.white,
            },
          ]}
        >
          <Text style={[styles.remaining, { fontSize: FONT_SIZE_MAP[size] }]}>
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  initials: {
    color: Colors.white,
    fontWeight: FontWeights.semibold,
  },
  remaining: {
    color: Colors.textSecondary,
    fontWeight: FontWeights.semibold,
  },
});

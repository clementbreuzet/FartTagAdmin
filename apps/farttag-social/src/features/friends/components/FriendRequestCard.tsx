import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { FriendRequest } from '../types';

type FriendRequestCardProps = {
  request: FriendRequest;
  mode: 'incoming' | 'outgoing';
  accepting?: boolean;
  declining?: boolean;
  onAccept?: (request: FriendRequest) => void;
  onDecline?: (request: FriendRequest) => void;
};

export const FriendRequestCard = ({
  request,
  mode,
  accepting = false,
  declining = false,
  onAccept,
  onDecline,
}: FriendRequestCardProps) => (
  <View style={styles.card}>
    <View style={styles.avatar}>
      {request.avatarUrl ? (
        <Image source={{ uri: request.avatarUrl }} style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarFallback}>{(request.displayName || request.username).slice(0, 1).toUpperCase()}</Text>
      )}
    </View>
    <View style={styles.body}>
      <Text style={styles.name}>{request.displayName}</Text>
      <Text style={styles.username}>@{request.username}</Text>
      {request.message ? <Text style={styles.message}>{request.message}</Text> : null}
      {request.requestedAt ? <Text style={styles.meta}>{new Date(request.requestedAt).toLocaleDateString()}</Text> : null}
    </View>
    <View style={styles.actions}>
      {mode === 'incoming' ? (
        <>
          <Pressable disabled={accepting} onPress={() => onAccept?.(request)} style={[styles.accept, accepting && styles.disabled]}>
            <Text style={styles.acceptText}>{accepting ? '...' : 'ACCEPTER'}</Text>
          </Pressable>
          <Pressable disabled={declining} onPress={() => onDecline?.(request)} style={[styles.decline, declining && styles.disabled]}>
            <Text style={styles.declineText}>{declining ? '...' : 'REFUSER'}</Text>
          </Pressable>
        </>
      ) : (
        <Text style={styles.outgoing}>ENVOYEE</Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 14,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.neonCyan,
    borderRadius: 18,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
    width: 44,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarFallback: {
    color: colors.neonCyan,
    fontSize: 16,
    fontWeight: '900',
  },
  body: {
    flex: 1,
    paddingRight: 10,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  username: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 6,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 8,
    marginTop: 6,
  },
  actions: {
    gap: 8,
  },
  accept: {
    backgroundColor: '#9CFF0018',
    borderColor: colors.neonGreen,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 64,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  acceptText: {
    color: colors.neonGreen,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  decline: {
    borderColor: colors.danger,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 64,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  declineText: {
    color: colors.danger,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  outgoing: {
    color: colors.neonPurple,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});

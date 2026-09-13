'use client';
import PusherClient from 'pusher-js';

export function createPusherClient() {
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth',
    authTransport: 'ajax',
  });
}
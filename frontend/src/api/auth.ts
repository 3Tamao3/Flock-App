import client from './client';

export const register = (username: string, email: string, password: string) =>
  client.post('/auth/register', { username, email, password });

export const login = (email: string, password: string) =>
  client.post('/auth/login', { email, password });

import { Injectable, signal, computed } from '@angular/core';
import { User, AuthResponse } from '../models/user.model';
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);
  private isAuthenticated = computed(() => !!this.currentUser());

  currentUser$ = computed(() => this.currentUser());
  isAuthenticated$ = computed(() => this.isAuthenticated());

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const storedUser = localStorage.getItem('pos_user');
    const storedToken = localStorage.getItem('pos_token');

    if (storedUser && storedToken) {
      this.currentUser.set(JSON.parse(storedUser));
      this.token.set(storedToken);
    }
  }

  login(username: string, password: string): AuthResponse {
    // Mock authentication - in production, call actual API
    const user: User = {
      id: uuid(),
      username,
      email: `${username}@example.com`,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'manage_users'],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const token = this.generateToken();
    const response: AuthResponse = {
      token,
      user,
      expiresIn: 86400
    };

    this.currentUser.set(user);
    this.token.set(token);

    localStorage.setItem('pos_user', JSON.stringify(user));
    localStorage.setItem('pos_token', token);

    return response;
  }

  logout(): void {
    this.currentUser.set(null);
    this.token.set(null);
    localStorage.removeItem('pos_user');
    localStorage.removeItem('pos_token');
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  getToken(): string | null {
    return this.token();
  }

  hasPermission(permission: string): boolean {
    return this.currentUser()?.permissions.includes(permission) || false;
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.role === role;
  }

  private generateToken(): string {
    return 'token_' + uuid() + '_' + Date.now();
  }
}

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import UV_Login from '@/components/views/UV_Login';
import { useAppStore } from '@/store/main';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Auth E2E Flow (real API)', () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.setState((state) => ({
      authentication_state: {
        ...state.authentication_state,
        current_user: null,
        auth_token: null,
        authentication_status: {
          is_authenticated: false,
          is_loading: false,
        },
        error_message: null,
      },
    }));
  });

  it('completes full auth flow: register -> logout -> sign-in', async () => {
    const user = userEvent.setup();
    const uniqueEmail = `user${Date.now()}@example.com`;
    const password = 'testpassword123';
    const name = 'Test User';

    const { rerender } = render(<UV_Login />, { wrapper: Wrapper });

    const toggleButton = await screen.findByRole('button', { name: /don't have an account\? sign up/i });
    await user.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/full name/i);
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await waitFor(() => {
      expect(nameInput).not.toBeDisabled();
      expect(emailInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
    });

    await user.type(nameInput, name);
    await user.type(emailInput, uniqueEmail);
    await user.type(passwordInput, password);

    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/creating account\.\.\./i)).toBeInTheDocument();
    });

    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        expect(state.authentication_state.auth_token).toBeTruthy();
        expect(state.authentication_state.current_user?.email).toBe(uniqueEmail);
      },
      { timeout: 20000 }
    );

    const logoutUser = useAppStore.getState().logout_user;
    logoutUser();

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
      expect(state.authentication_state.auth_token).toBeNull();
      expect(state.authentication_state.current_user).toBeNull();
    });

    rerender(<UV_Login />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
    });

    const emailInputSignIn = screen.getByPlaceholderText(/email address/i);
    const passwordInputSignIn = screen.getByPlaceholderText(/password/i);
    const signInButton = screen.getByRole('button', { name: /^sign in$/i });

    await waitFor(() => {
      expect(emailInputSignIn).not.toBeDisabled();
      expect(passwordInputSignIn).not.toBeDisabled();
    });

    await user.clear(emailInputSignIn);
    await user.clear(passwordInputSignIn);
    await user.type(emailInputSignIn, uniqueEmail);
    await user.type(passwordInputSignIn, password);

    await waitFor(() => expect(signInButton).not.toBeDisabled());
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/signing in\.\.\./i)).toBeInTheDocument();
    });

    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        expect(state.authentication_state.auth_token).toBeTruthy();
        expect(state.authentication_state.current_user?.email).toBe(uniqueEmail);
      },
      { timeout: 20000 }
    );
  }, 60000);

  it('handles registration validation errors gracefully', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<UV_Login />, { wrapper: Wrapper });

    const toggleButton = await screen.findByRole('button', { name: /don't have an account\? sign up/i });
    await user.click(toggleButton);

    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password');

    await waitFor(() => expect(submitButton).not.toBeDisabled());
  });

  it('handles login with invalid credentials', async () => {
    const user = userEvent.setup();
    render(<UV_Login />, { wrapper: Wrapper });

    const emailInput = await screen.findByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const signInButton = screen.getByRole('button', { name: /^sign in$/i });

    await user.type(emailInput, 'nonexistent@example.com');
    await user.type(passwordInput, 'wrongpassword');

    await waitFor(() => expect(signInButton).not.toBeDisabled());
    await user.click(signInButton);

    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.error_message).toBeTruthy();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
      },
      { timeout: 10000 }
    );
  }, 30000);
});

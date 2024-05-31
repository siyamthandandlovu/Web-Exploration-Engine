import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../../src/app/(landing)/login/page';
import { login } from '../../src/app/services/AuthService';

// Mocking login function
jest.mock('../../src/app/services/AuthService', () => ({
  login: jest.fn(),
}));

describe('Login Component', () => {

  it('should render the Login form', () => {
    render(<Login />);

    expect(screen.getByLabelText(/Email/i)).toBeDefined();
    expect(screen.getByLabelText(/Password/i)).toBeDefined();
  });

  it('should display error if required fields are empty', async () => {
    render(<Login />);

    fireEvent.click(screen.getByText(/^Login$/));


    expect(screen.queryByText(/All fields are required/i)).toBeDefined();
  });

  it('should display error if email is invalid', async () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });

    fireEvent.click(screen.getByText(/^Login$/));

    expect(screen.queryByText(/Please enter a valid email address/i)).toBeDefined();
  });

  it('should call login function on valid submission', async () => {
    (login as jest.Mock).mockResolvedValue({ accessToken: 'mockToken', uuid: 'mockUuid' });

    render(<Login />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });

    fireEvent.click(screen.getByText(/^Login$/));

    expect(login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });

    expect(screen.queryByText(/An error occurred. Please try again later/i)).toBeNull();
  });
});
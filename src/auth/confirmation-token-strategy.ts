import { AuthTokenStrategy } from './auth-token-strategy.interface';

export class ConfirmationTokenStrategy implements AuthTokenStrategy {
  constructor() {}

  getExpirationTime(): string {
    return process.env.JWT_VERIFICATION_TOKEN_EXPIRATION_TIME;
  }

  getSecret(): string {
    return process.env.JWT_VERIFICATION_TOKEN_SECRET;
  }
}

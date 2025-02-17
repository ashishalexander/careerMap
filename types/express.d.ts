import { IAuthTokenPayload } from '../src/interfaces/authTokenPayload';

declare global {
  namespace Express {
    interface Request {
      user?: IAuthTokenPayload;
    }
  }
}

export {};
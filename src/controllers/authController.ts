import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async signIn(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    try {
      const token = await this.authService.signIn(email, password);
      return res.status(200).json({ token });
    } catch (error: unknown) {  
      if (error instanceof Error) {
        return res.status(401).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

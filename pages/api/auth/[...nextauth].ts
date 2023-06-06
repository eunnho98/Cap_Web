import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const nextAuthOptions = (): NextAuthOptions => {
  return {
    providers: [
      GoogleProvider({
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || '',
      }),
    ],
    secret: 'HelloWorld',
  };
};

const authHandler = (req: NextApiRequest, res: NextApiResponse) => {
  return NextAuth(req, res, nextAuthOptions());
};

export default authHandler;

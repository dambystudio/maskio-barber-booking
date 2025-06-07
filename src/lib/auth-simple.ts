import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'customer' | 'admin' | 'barber'
      image?: string
    }
  }
  
  interface User {
    id: string
    email: string
    name: string
    role: 'customer' | 'admin' | 'barber'
    image?: string
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Import database here to avoid initialization issues
          const { db } = await import('./database-postgres');
          const { users } = await import('./schema');
          const bcrypt = await import('bcryptjs');
          const { eq } = await import('drizzle-orm');

          // Find user
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1);

          if (!user[0] || !user[0].password) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user[0].password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user[0].id,
            email: user[0].email,
            name: user[0].name,
            role: user[0].role as 'customer' | 'admin' | 'barber',
            image: user[0].image || undefined,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'customer' | 'admin' | 'barber';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
});

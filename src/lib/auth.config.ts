import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/database-postgres';
import { users } from '@/lib/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        phone: { label: 'Phone', type: 'tel' },
        isSignUp: { label: 'Is Sign Up', type: 'hidden' }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        
        // Check if database is available
        if (!db || !users) {
          console.error('Database not available');
          return null;
        }
        
        const isSignUp = credentials.isSignUp === 'true';
        
        if (isSignUp) {
          // Registration
          try {
            const existingUser = await db
              .select()
              .from(users)
              .where(eq(users.email, credentials.email as string))
              .limit(1);
              
            if (existingUser.length > 0) {
              throw new Error('User already exists');
            }
            
            const hashedPassword = credentials.password 
              ? await bcrypt.hash(credentials.password as string, 10)
              : null;
                const newUser = await db
              .insert(users)
              .values({
                email: credentials.email as string,
                name: credentials.name as string || 'User',
                role: 'customer',
                phone: credentials.phone as string,
                password: hashedPassword,
                emailVerified: new Date(), // Segna come verificato automaticamente
              })
              .returning();
              
            return {
              id: newUser[0].id,
              email: newUser[0].email,
              name: newUser[0].name,
              role: newUser[0].role as 'customer' | 'admin' | 'barber',
            };
          } catch (error) {
            console.error('Registration error:', error);
            return null;
          }
        } else {
          // Login
          try {
            const user = await db
              .select()
              .from(users)
              .where(eq(users.email, credentials.email as string))
              .limit(1);
              
            if (!user[0]) {
              return null;
            }
            
            // For OAuth users without password
            if (!user[0].password && !credentials.password) {
              return {
                id: user[0].id,
                email: user[0].email,
                name: user[0].name,
                role: user[0].role as 'customer' | 'admin' | 'barber',
                image: user[0].image || undefined,
              };
            }
            
            // For credential users
            if (credentials.password && user[0].password) {
              const isPasswordValid = await bcrypt.compare(
                credentials.password as string,
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
            }
            
            return null;
          } catch (error) {
            console.error('Login error:', error);
            return null;
          }
        }
      }
    })
  ],  callbacks: {
    async signIn({ user, account, profile }: { user: any; account: any; profile?: any }) {
      // Handle Google OAuth users
      if (account?.provider === 'google' && user.email) {
        try {
          // Check if user already exists
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1);
            
          if (existingUser.length === 0) {
            // Create new user for Google OAuth (without phone initially)
            await db
              .insert(users)
              .values({
                email: user.email,
                name: user.name || 'Google User',
                role: 'customer',
                image: user.image,
                emailVerified: new Date(), // Google accounts are pre-verified
                password: null, // No password for OAuth users
                phone: null, // Will be requested in modal
              });
          } else {
            // Update existing user with Google info if needed
            await db
              .update(users)
              .set({
                image: user.image,
                emailVerified: new Date(), // Ensure email is verified
                lastLogin: new Date(),
              })
              .where(eq(users.email, user.email));
          }
        } catch (error) {
          console.error('Error handling Google sign in:', error);
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Always redirect to home page after sign in/sign up
      // Unless there's a specific callbackUrl that should be honored
      
      console.log('🔗 NextAuth redirect called:', { url, baseUrl });
      
      // If it's a sign out, allow the default behavior
      if (url.includes('/auth/signout')) {
        return `${baseUrl}/`;
      }
      
      // If there's a valid callback URL that's not auth-related, use it
      if (url.startsWith(baseUrl) && !url.includes('/auth/')) {
        console.log('✅ Using callback URL:', url);
        return url;
      }
      
      // Default: redirect to home page
      console.log('🏠 Redirecting to home page');
      return `${baseUrl}/`;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user?.email) {
        try {
          const dbUser = await db
            .select()
            .from(users)
            .where(eq(users.email, session.user.email))
            .limit(1);
            
          if (dbUser[0]) {
            (session.user as any).id = dbUser[0].id;
            (session.user as any).role = dbUser[0].role as 'customer' | 'admin' | 'barber';
            (session.user as any).needsPhone = !dbUser[0].phone; // Flag per telefono mancante
            session.user.name = dbUser[0].name;
            session.user.image = dbUser[0].image || undefined;
          }
        } catch (error) {
          console.error('Error fetching user session:', error);
        }
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        (token as any).role = (user as any).role;
        (token as any).id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt' as const
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

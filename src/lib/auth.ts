import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { db } from './database-postgres'
import { users } from './schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

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
        if (!credentials?.email) return null
        
        // Check if database is available
        if (!db || !users) {
          console.error('Database not available')
          return null
        }
        
        const isSignUp = credentials.isSignUp === 'true'
          if (isSignUp) {
          // Registration
          try {
            const existingUser = await db
              .select()
              .from(users)
              .where(eq(users.email, credentials.email as string))
              .limit(1)
              
            if (existingUser.length > 0) {
              throw new Error('User already exists')
            }              // Get authorized emails from environment variables
            const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
            const barberEmails = process.env.BARBER_EMAILS?.split(',').map(email => email.trim()) || [];
            
            // Determine user role based on email
            const isAdmin = adminEmails.includes(credentials.email as string);
            const isBarber = barberEmails.includes(credentials.email as string);
            
            let userRole = 'user'; // default
            if (isAdmin) {
              userRole = 'admin';
            } else if (isBarber) {
              userRole = 'barber';
            }
            
            const hashedPassword = credentials.password 
              ? await bcrypt.hash(credentials.password as string, 10)
              : null
              
            const newUser = await db
              .insert(users)
              .values({
                email: credentials.email as string,
                name: credentials.name as string || 'User',
                role: userRole,
                phone: credentials.phone as string,
                password: hashedPassword,
              })
              .returning()
              
            return {
              id: newUser[0].id,
              email: newUser[0].email,
              name: newUser[0].name,
              role: newUser[0].role as 'customer' | 'admin' | 'barber',
            }
          } catch (error) {
            console.error('Registration error:', error)
            return null
          }        } else {
          // Login
          try {
            const user = await db
              .select()
              .from(users)
              .where(eq(users.email, credentials.email as string))
              .limit(1)
              
            if (!user[0]) {
              return null
            }
            
            // Check environment variables for role override
            const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
            const barberEmails = process.env.BARBER_EMAILS?.split(',').map(email => email.trim()) || [];
            
            // Determine current role based on environment variables
            const isAdmin = adminEmails.includes(user[0].email);
            const isBarber = barberEmails.includes(user[0].email);
            
            let currentRole = 'customer'; // default
            if (isAdmin) {
              currentRole = 'admin';
            } else if (isBarber) {
              currentRole = 'barber';
            }
            
            // Update role in database if it has changed
            if (user[0].role !== currentRole) {
              await db
                .update(users)
                .set({ role: currentRole })
                .where(eq(users.id, user[0].id));
              
              console.log(`Updated user ${user[0].email} role from ${user[0].role} to ${currentRole}`);
            }
            
            // For OAuth users without password
            if (!user[0].password && !credentials.password) {
              return {
                id: user[0].id,
                email: user[0].email,
                name: user[0].name,
                role: currentRole as 'customer' | 'admin' | 'barber',
                image: user[0].image || undefined,
              }
            }
            
            // For credential users
            if (credentials.password && user[0].password) {
              const isPasswordValid = await bcrypt.compare(
                credentials.password as string,
                user[0].password
              )
              
              if (!isPasswordValid) {
                return null
              }
              
              return {
                id: user[0].id,
                email: user[0].email,
                name: user[0].name,
                role: currentRole as 'customer' | 'admin' | 'barber',
                image: user[0].image || undefined,
              }
            }
            
            return null
          } catch (error) {
            console.error('Login error:', error)
            return null
          }
        }
      }
    })
  ],  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google OAuth
      if (account?.provider === 'google' && user?.email) {        try {
          // Get authorized emails from environment variables
          const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
          const barberEmails = process.env.BARBER_EMAILS?.split(',').map(email => email.trim()) || [];
          
          // Determine user role based on email
          const isAdmin = adminEmails.includes(user.email);
          const isBarber = barberEmails.includes(user.email);
          
          let userRole = 'user'; // default
          if (isAdmin) {
            userRole = 'admin';
          } else if (isBarber) {
            userRole = 'barber';
          }
          
          // Check if user already exists
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1)
          
          if (existingUser.length === 0) {
            // Create new user from Google profile
            await db
              .insert(users)
              .values({
                email: user.email,
                name: user.name || 'Google User',
                role: userRole,
                image: user.image,
                password: null, // No password for OAuth users
              })
          } else {
            // Update existing user with Google image if available and ensure correct role
            const updateData: any = {};
            if (user.image && existingUser[0].image !== user.image) {
              updateData.image = user.image;
            }
            // Always ensure barber emails have the correct role
            if (isBarber && existingUser[0].role !== 'barber') {
              updateData.role = 'barber';
            }
            
            if (Object.keys(updateData).length > 0) {
              await db
                .update(users)
                .set(updateData)
                .where(eq(users.email, user.email))
            }
          }
        } catch (error) {
          console.error('Error handling Google sign-in:', error)
          return false
        }
      }
      return true    },async session({ session, token }) {
      if (session.user?.email) {
        try {
          const dbUser = await db
            .select()
            .from(users)
            .where(eq(users.email, session.user.email))
            .limit(1);
          
          if (dbUser[0]) {
            // Check environment variables for role override
            const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
            const barberEmails = process.env.BARBER_EMAILS?.split(',').map(email => email.trim()) || [];
            
            // Determine current role based on environment variables
            const isAdmin = adminEmails.includes(session.user.email);
            const isBarber = barberEmails.includes(session.user.email);
            
            let currentRole = 'customer'; // default
            if (isAdmin) {
              currentRole = 'admin';
            } else if (isBarber) {
              currentRole = 'barber';
            }
            
            // Update role in database if it has changed
            if (dbUser[0].role !== currentRole) {
              await db
                .update(users)
                .set({ role: currentRole })
                .where(eq(users.id, dbUser[0].id));
              
              console.log(`Session: Updated user ${session.user.email} role from ${dbUser[0].role} to ${currentRole}`);
            }
            
            (session.user as any).id = String(dbUser[0].id);
            (session.user as any).role = currentRole as 'customer' | 'admin' | 'barber';
            session.user.name = dbUser[0].name || '';
            session.user.image = dbUser[0].image ? `${dbUser[0].image}` : undefined;
          }
        } catch (error) {
          console.error('Error fetching user session:', error);
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role
        (token as any).id = user.id
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
})
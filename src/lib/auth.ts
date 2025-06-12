import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
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
            }
            
            const hashedPassword = credentials.password 
              ? await bcrypt.hash(credentials.password as string, 10)
              : null
              
            const newUser = await db
              .insert(users)
              .values({
                email: credentials.email as string,
                name: credentials.name as string || 'User',
                role: 'customer',
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
          }
        } else {
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
            
            // For OAuth users without password
            if (!user[0].password && !credentials.password) {
              return {
                id: user[0].id,
                email: user[0].email,
                name: user[0].name,
                role: user[0].role as 'customer' | 'admin' | 'barber',
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
                role: user[0].role as 'customer' | 'admin' | 'barber',
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
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      return true
    },    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const dbUser = await db
            .select()
            .from(users)
            .where(eq(users.email, session.user.email))
            .limit(1);
          
          if (dbUser[0]) {
            (session.user as any).id = String(dbUser[0].id);
            (session.user as any).role = dbUser[0].role as 'customer' | 'admin' | 'barber';
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
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { DatabaseService } from '@/lib/database'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'customer' | 'admin' | 'barber'
    }
  }
  
  interface User {
    id: string
    email: string
    name: string
    role: 'customer' | 'admin' | 'barber'
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
      // @ts-ignore
      async authorize(credentials) {
        if (!credentials?.email) return null
        
        const isSignUp = credentials.isSignUp === 'true'
        
        if (isSignUp) {
          // Registration
          try {
            const existingUser = await DatabaseService.getUserByEmail(credentials.email as string)
            if (existingUser) {
              throw new Error('User already exists')
            }
            
            const newUser = await DatabaseService.createUser({
              email: credentials.email as string,
              name: credentials.name as string || 'User',
              role: 'customer',
              phone: credentials.phone as string
            })
              return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              role: newUser.role as string
            }
          } catch (error) {
            console.error('Registration error:', error)
            return null
          }
        } else {          // Login
          const user = await DatabaseService.getUserByEmail(credentials.email as string)
          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role as string
            }
          }
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Check if user exists, create if not
        const existingUser = await DatabaseService.getUserByEmail(user.email!)
        if (!existingUser) {
          await DatabaseService.createUser({
            email: user.email!,
            name: user.name || 'Google User',
            role: 'customer'
          })
        }
      }
      return true
    },    async session({ session, token }) {
      if (session.user?.email) {
        const dbUser = await DatabaseService.getUserByEmail(session.user.email)
        if (dbUser) {
          // @ts-ignore
          session.user.id = dbUser.id
          // @ts-ignore
          session.user.role = dbUser.role
          session.user.name = dbUser.name
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    }
  },  pages: {
    signIn: '/auth/signin'
  },
  session: {
    strategy: 'jwt'
  }
})

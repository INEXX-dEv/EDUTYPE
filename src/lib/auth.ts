import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { v4 as uuidv4 } from 'uuid';

function generateStudentId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `STU-${year}-${random}`;
}

function generateTeacherId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `TCH-${year}-${random}`;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email ve şifre gereklidir');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Geçersiz email veya şifre');
        }

        if (!user.emailVerified) {
          throw new Error('Lütfen email adresinizi doğrulayın');
        }

        if (user.isBanned) {
          throw new Error('Hesabınız yasaklanmıştır: ' + (user.banReason || ''));
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error('Geçersiz email veya şifre');
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser?.isBanned) {
          return false;
        }

        if (!existingUser) {
          // Auto-assign student ID for new OAuth users
          await prisma.user.update({
            where: { email: user.email! },
            data: {
              studentId: generateStudentId(),
              emailVerified: new Date(),
              isApproved: true,
            },
          }).catch(() => {
            // User might not exist yet in adapter flow
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.studentId = dbUser.studentId;
          token.teacherId = dbUser.teacherId;
          token.isApproved = dbUser.isApproved;
          token.isBanned = dbUser.isBanned;
          token.school = dbUser.school;
          token.department = dbUser.department;
          token.termsAcceptedAt = dbUser.termsAcceptedAt?.toISOString() || null;
          token.mustChangePassword = dbUser.mustChangePassword;
        }
      }
      if (trigger === 'update' && session) {
        token.name = session.name;
        token.image = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.studentId = token.studentId as string | null;
        session.user.teacherId = token.teacherId as string | null;
        session.user.isApproved = token.isApproved as boolean;
        session.user.isBanned = token.isBanned as boolean;
        session.user.school = token.school as string | null;
        session.user.department = token.department as string | null;
        session.user.termsAcceptedAt = token.termsAcceptedAt as string | null;
        session.user.mustChangePassword = token.mustChangePassword as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  events: {
    async createUser({ user }) {
      // Assign student ID to new users
      await prisma.user.update({
        where: { id: user.id },
        data: {
          studentId: generateStudentId(),
        },
      });
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || 'fallback_secret_for_development_only',
};

import 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: string;
    studentId?: string | null;
    teacherId?: string | null;
    isApproved?: boolean;
    isBanned?: boolean;
    school?: string | null;
    department?: string | null;
    termsAcceptedAt?: string | null;
    mustChangePassword?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      studentId: string | null;
      teacherId: string | null;
      isApproved: boolean;
      isBanned: boolean;
      school: string | null;
      department: string | null;
      termsAcceptedAt: string | null;
      mustChangePassword: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    studentId: string | null;
    teacherId: string | null;
    isApproved: boolean;
    isBanned: boolean;
    school: string | null;
    department: string | null;
    termsAcceptedAt: string | null;
    mustChangePassword: boolean;
  }
}

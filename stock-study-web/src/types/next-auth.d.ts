import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    email: string;
    photoURL: string | null;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      photoURL: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    photoURL: string | null;
  }
}

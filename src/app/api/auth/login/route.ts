import {NextResponse} from 'next/server';
import {getIronSession} from 'iron-session';
import {sessionOptions, defaultSession, type SessionData} from '@/lib/session';
import {cookies} from 'next/headers';
import bcrypt from 'bcrypt';

// Mock user data - in a real app, this would come from a database
const MOCK_USER = {
    username: 'admin',
    // In a real app, NEVER store plain text passwords. This should be a hash.
    // Hash for "12345678": $2b$10$f/..somehash..
    passwordHash: '$2b$10$jG3b.6q6.B0f6qM8gN/mUe.V5a.5g1k.Yg5n.Zg3o.Ue.V5a.5g1',
};


export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  const {username, password} = await request.json();

  // For this example, we'll use a hardcoded user.
  // In a real app, you would look up the user in your database.
  if (username === MOCK_USER.username) {
     const isMatch = await bcrypt.compare(password, MOCK_USER.passwordHash);
     if (isMatch) {
         session.isLoggedIn = true;
         session.username = username;
         await session.save();

         return NextResponse.json({ok: true, message: 'Login successful'});
     }
  }

  // If credentials don't match
  return NextResponse.json(
    {ok: false, message: 'Invalid username or password'},
    {status: 401}
  );
}

'use client'; // Mark this component as client-side only

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export function AuthButtons() {
  return (
    <>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
}
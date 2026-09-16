import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Discord({
      authorization: { params: { scope: "identify" } },
    }),
  ],
  callbacks: {
    jwt({ token, profile }) {
      if (profile?.id) token.discordId = String(profile.id);
      return token;
    },
    session({ session, token }) {
      if (typeof token.discordId === "string") session.user.id = token.discordId;
      return session;
    },
  },
});

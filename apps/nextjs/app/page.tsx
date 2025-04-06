import { getSessionCookie } from "@authdog/nextjs-app/dist/index.server";

const Home = async () => {
  const publicKey = process.env.PK_AUTHDOG as string;
  const sessionCookie = await getSessionCookie(publicKey);

  return (
    <div className="flex h-screen items-center justify-center">
      <code>{JSON.stringify(sessionCookie, null, 2)}</code>
    </div>
  );
};
export default Home;

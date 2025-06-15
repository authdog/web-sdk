// import React from "react";
// import { Navbar } from "@authdog/react-elements";
// import type { User } from "./Layout";
// import { LoaderFunction } from "@remix-run/node";
// import { remixAuthLoader } from "@authdog/remix-node";
// import { useLoaderData } from "@remix-run/react";

// interface ClientNavbarProps {
//   user: User | null;
//   isLoading: boolean;
//   environmentId?: string;
//   identityHost?: string;
// }

// export const loader: LoaderFunction = async ({ context, request }) =>
//     await remixAuthLoader({
//       request,
//       context,
//       params: {
//         publicKey: process.env.PK_AUTHDOG,
//       },
// });

// export function ClientNavbar() {

//     // const { user, isLoading, environmentId, identityHost } = useLoaderData<typeof loader>();

//     const { user, isLoading, environmentId, identityHost } = useLoaderData<typeof loader>();


//     console.log("user", user);
//   return (
//     <Navbar
//       key={user?.id}
//       logoText={"ACME Corp"}
//       items={[]}
//       isLoading={isLoading}
//       user={user as any}
//       onLogout={() => {
//         localStorage.removeItem("token");
//         location.reload();
//       }}
//       {...(environmentId && identityHost && {
//         environmentId,
//         identityHost,
//       })}
//     />
//   );
// } 
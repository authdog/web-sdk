import { LoaderFunction } from "@remix-run/node";
import { remixAuthLoader } from "@authdog/remix-node";

export const loader: LoaderFunction = async ({ context, request }) => {
  return await remixAuthLoader({
    request,
    context,
    params: {
      publicKey: process.env.PK_AUTHDOG,
    },
  });
}; 
"use client";
import { UserProfile} from "@authdog/react-elements"
import "@authdog/react-elements/styles.css";

export default function Profile() {

  return (
      <>
       <UserProfile
          user={{
            name: "Jaylon Dias",
            email: "example@authdog.dev",
            image: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
          }}
        />
      </>

  );
}

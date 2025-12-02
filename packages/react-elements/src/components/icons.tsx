import { LucideProps } from "lucide-react";
import { useEffect, useState } from "react";

const iconProps: LucideProps = {
  className: "mr-2 h-4 w-4",
  "aria-hidden": "true",
};

export const IconWrapper = ({ Icon }: { Icon: any }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <span className="inline-flex items-center justify-center">
      {!isMounted ? (
        <span className="mr-2 h-4 w-4" aria-hidden="true" />
      ) : (
        <Icon {...iconProps} />
      )}
    </span>
  );
};

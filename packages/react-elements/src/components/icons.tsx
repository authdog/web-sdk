import { LucideProps } from "lucide-react";
import { useEffect, useState } from "react";

const iconProps: LucideProps = {
  className: "mr-2 h-4 w-4 text-current",
  "aria-hidden": "true",
};

export const IconWrapper = ({
  Icon,
  withMargin = true,
}: {
  Icon: any;
  withMargin?: boolean;
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const iconClassWithMargin: LucideProps = withMargin
    ? iconProps
    : {
        className: "h-4 w-4 text-current",
        "aria-hidden": "true",
      };

  return (
    <span className="inline-flex items-center justify-center">
      {!isMounted ? (
        <span
          className={withMargin ? "mr-2 h-4 w-4" : "h-4 w-4"}
          aria-hidden="true"
        />
      ) : (
        <Icon {...iconClassWithMargin} />
      )}
    </span>
  );
};

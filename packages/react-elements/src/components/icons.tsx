import { LucideProps } from "lucide-react"

const iconProps: LucideProps = {
  className: "mr-2 h-4 w-4",
  "aria-hidden": "true"
}

export const renderIcon = ((Icon: any) => {
  const isMounted = typeof window !== 'undefined'
  if (!isMounted) return null;
  return <Icon {...iconProps} />
}) as React.FC<{
  Icon: any
}>


export const IconWrapper = ({ Icon }: { Icon: any }) => {
  return (
    <span className="inline-flex items-center justify-center">
      {renderIcon(Icon)}
    </span>
  )
}
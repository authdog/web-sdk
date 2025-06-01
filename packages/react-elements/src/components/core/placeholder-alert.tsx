import { CheckCircle2Icon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { IconWrapper } from "../icons"

interface PlaceholderAlertProps {
  title?: string;
  description?: string;
}

export const PlaceholderAlert = (
    { title = "Placeholder Alert", description = "This is a placeholder alert." }: PlaceholderAlertProps
) => {
  return (      
    <div className="grid w-full max-w-xl items-start gap-4">
      <Alert>
        <IconWrapper Icon={CheckCircle2Icon} />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
            {description}
        </AlertDescription>
      </Alert>

    </div>
  )
}

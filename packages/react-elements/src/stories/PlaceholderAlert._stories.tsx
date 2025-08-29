import type { Story } from '@ladle/react';
import { PlaceholderAlert } from "../components/core/placeholder-alert"
import "../global.css"

export const Default: Story = () => <PlaceholderAlert />;
Default.storyName = 'Default Placeholder Alert';
export const CustomTitleAndDescription: Story = () => (
  <PlaceholderAlert 
    title="Custom Alert Title" 
    description="This is a custom description for the placeholder alert." 
  />
);
CustomTitleAndDescription.storyName = 'Custom Title and Description';
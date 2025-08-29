import type { Story } from '@ladle/react';
import { Button } from '../components/ui/button';
import "../global.css";

export const Default: Story = () => <Button>Click me</Button>;
Default.storyName = 'Default Button';

export const Primary: Story = () => <Button variant="default">Primary</Button>;
Primary.storyName = 'Primary Button';

export const Secondary: Story = () => <Button variant="secondary">Secondary</Button>;
Secondary.storyName = 'Secondary Button';

export const Destructive: Story = () => <Button variant="destructive">Delete</Button>;
Destructive.storyName = 'Destructive Button';

export const Outline: Story = () => <Button variant="outline">Outline</Button>;
Outline.storyName = 'Outline Button';

export const Ghost: Story = () => <Button variant="ghost">Ghost</Button>;
Ghost.storyName = 'Ghost Button';

export const Link: Story = () => <Button variant="link">Link</Button>;
Link.storyName = 'Link Button'; 
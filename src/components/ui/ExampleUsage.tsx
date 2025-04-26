'use client';

import React from 'react';
import { Button } from './Button';
import { Typography } from './Typography';

export function UIExample() {
  return (
    <div className="p-8 space-y-8 max-w-3xl mx-auto">
      <div className="space-y-4">
        <Typography variant="h1">Typography Examples</Typography>
        
        <div className="space-y-2">
          <Typography variant="h1">Heading 1</Typography>
          <Typography variant="h2">Heading 2</Typography>
          <Typography variant="h3">Heading 3</Typography>
          <Typography variant="h4">Heading 4</Typography>
          <Typography variant="h5">Heading 5</Typography>
          <Typography variant="h6">Heading 6</Typography>
          <Typography variant="body-lg">Body Large - This is a larger paragraph of text used for intro sections or important content.</Typography>
          <Typography variant="body">Body - This is the standard paragraph text used throughout the application.</Typography>
          <Typography variant="body-sm">Body Small - This is smaller text often used for less important information.</Typography>
          <Typography variant="caption">Caption - Used for captions and supportive text.</Typography>
          <Typography variant="overline">OVERLINE - USED FOR LABELS AND CATEGORIES</Typography>
        </div>
        
        <div className="space-y-2">
          <Typography variant="body" bold>Bold text example</Typography>
          <Typography variant="body" italic>Italic text example</Typography>
          <Typography variant="body" as="span">As span example</Typography>
        </div>
      </div>
      
      <div className="space-y-4">
        <Typography variant="h1">Button Examples</Typography>
        
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="link">Link Button</Button>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary" size="sm">Small Button</Button>
          <Button variant="primary" size="md">Medium Button</Button>
          <Button variant="primary" size="lg">Large Button</Button>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary" isLoading>Loading Button</Button>
          <Button variant="primary" disabled>Disabled Button</Button>
          <Button variant="primary" href="#" isExternal>External Link Button</Button>
          <Button variant="primary" href="#">Internal Link Button</Button>
        </div>
      </div>
    </div>
  );
} 
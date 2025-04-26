import { HeroSection, FeatureSection, CTASection, LightningIcon, CheckBadgeIcon, ChartIcon, ShareIcon } from '@/components/ui';

export default function Home() {
  const features = [
    {
      title: 'Clarity in reasoning',
      description: 'Break down complex arguments into clear, connected components that anyone can follow and understand.',
      icon: <LightningIcon className="h-6 w-6 text-white" />,
    },
    {
      title: 'Better persuasion',
      description: 'Strengthen your arguments by anticipating rebuttals and providing solid backing for your claims.',
      icon: <CheckBadgeIcon className="h-6 w-6 text-white" />,
    },
    {
      title: 'Academic excellence',
      description: 'Widely used in academic writing and critical thinking courses to develop and evaluate arguments.',
      icon: <ChartIcon className="h-6 w-6 text-white" />,
    },
    {
      title: 'Visualize and share',
      description: 'Create beautiful diagrams that can be easily shared, exported, and embedded in presentations or documents.',
      icon: <ShareIcon className="h-6 w-6 text-white" />,
    },
  ];

  return (
    <div className="bg-white">
      <HeroSection 
        title="Build stronger arguments visually"
        description="Create, analyze, and share structured arguments using the Toulmin method. Make your reasoning clear, identify weak points, and persuade effectively."
        primaryCta={{
          text: "Get started",
          href: "/auth"
        }}
        secondaryCta={{
          text: "Learn more",
          href: "#features"
        }}
      />

      <div id="features">
        <FeatureSection 
          heading="Structured Argumentation"
          subheading="Why use the Toulmin method?"
          description="The Toulmin model provides a framework for analyzing and constructing arguments, making complex reasoning more accessible and persuasive."
          features={features}
        />
      </div>

      <CTASection 
        title="Ready to strengthen your arguments?"
        description="Join thousands of academics, students, and professionals who use our tool to build compelling arguments."
        buttonText="Get started"
        buttonHref="/auth"
      />
    </div>
  );
}

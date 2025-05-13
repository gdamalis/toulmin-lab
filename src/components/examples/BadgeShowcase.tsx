import { Badge } from "@/components/ui/Badge";

export function BadgeShowcase() {
  const variants = [
    "gray", 
    "red", 
    "yellow", 
    "green", 
    "blue", 
    "indigo", 
    "purple", 
    "pink",
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">Badges</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          A collection of badge variants available in the design system.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </Badge>
        ))}
      </div>
    </div>
  );
} 
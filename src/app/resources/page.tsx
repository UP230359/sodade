import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ResourcesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <p className="text-base font-bold tracking-wider text-anger uppercase mb-2">
        Support & Safety
      </p>
      <h1 className="font-serif text-4xl font-normal text-foreground mb-2">
        Resources
      </h1>
      <p className="text-secondary mb-8">You do not have to navigate this alone.</p>

      <Card className="mb-6">
        <h2 className="font-serif text-xl font-normal text-foreground mb-4">
          Crisis Support
        </h2>

        <div className="flex items-center justify-between bg-anger/10 border border-anger/20 rounded-xl p-4 mb-3">
          <div>
            <p className="font-semibold text-anger">National Crisis Hotline</p>
            <p className="text-sm text-anger/80">Available 24/7, free and confidential.</p>
          </div>
          <Button
            variant="anger"
            className="!bg-background !text-anger !border !border-anger hover:!bg-anger/5"
          >
            Call 988
          </Button>
        </div>

        <div className="flex items-center justify-between bg-anger/10 border border-anger/20 rounded-xl p-4">
          <div>
            <p className="font-semibold text-anger">Crisis Text Line</p>
            <p className="text-sm text-anger/80">Text HOME to 741741.</p>
          </div>
          <Button
            variant="anger"
            className="!bg-background !text-anger !border !border-anger hover:!bg-anger/5"
          >
            Text 741741
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-normal text-foreground mb-4">
          Grounding Exercises
        </h2>

        <div className="space-y-4">
          <div>
            <p className="font-semibold text-foreground">5-4-3-2-1 Technique</p>
            <p className="text-sm text-secondary">
              Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell,
              and 1 you can taste.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Box Breathing</p>
            <p className="text-sm text-secondary">
              Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 4 times.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Body Scan</p>
            <p className="text-sm text-secondary">
              Slowly bring attention to each part of your body, from your feet to your head,
              noticing any tension and letting it release.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
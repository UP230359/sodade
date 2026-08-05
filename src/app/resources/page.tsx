import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ResourcesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <p className="text-sm md:text-base font-bold tracking-wider text-anger uppercase mb-2">
        Support & Safety
      </p>
      <h1 className="font-serif text-3xl md:text-4xl font-normal text-foreground mb-2">
        Resources
      </h1>
      <p className="text-secondary mb-8 text-sm md:text-base">
        You do not have to navigate this alone.
      </p>

      <Card className="mb-6">
        <h2 className="font-serif text-xl font-normal text-foreground mb-4">
          Crisis Support
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-anger/10 border border-anger/20 rounded-xl p-4 mb-4 gap-4 sm:gap-0">
          <div className="flex-1 pr-4">
            <p className="font-semibold text-anger">National Crisis Hotline</p>
            <p className="text-sm text-anger/80">Available 24/7, free and confidential.</p>
          </div>
          <a href="tel:988" className="w-full sm:w-auto shrink-0">
            <Button
              variant="danger"
              className="w-full sm:w-auto !bg-background !text-anger !border !border-anger hover:!bg-anger/5"
            >
              Call 988
            </Button>
          </a>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-anger/10 border border-anger/20 rounded-xl p-4 gap-4 sm:gap-0">
          <div className="flex-1 pr-4">
            <p className="font-semibold text-anger">Crisis Text Line</p>
            <p className="text-sm text-anger/80">Text HOME to 741741.</p>
          </div>
          <a href="sms:741741" className="w-full sm:w-auto shrink-0">
            <Button
              variant="danger"
              className="w-full sm:w-auto !bg-background !text-anger !border !border-anger hover:!bg-anger/5"
            >
              Text 741741
            </Button>
          </a>
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-xl font-normal text-foreground mb-4">
          Grounding Exercises
        </h2>

        <div className="space-y-5">
          <div className="bg-muted/30 p-4 rounded-xl border border-muted">
            <p className="font-semibold text-foreground mb-1">5-4-3-2-1 Technique</p>
            <p className="text-sm text-secondary leading-relaxed">
              Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell,
              and 1 you can taste.
            </p>
          </div>
          <div className="bg-muted/30 p-4 rounded-xl border border-muted">
            <p className="font-semibold text-foreground mb-1">Box Breathing</p>
            <p className="text-sm text-secondary leading-relaxed">
              Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 4 times.
            </p>
          </div>
          <div className="bg-muted/30 p-4 rounded-xl border border-muted">
            <p className="font-semibold text-foreground mb-1">Body Scan</p>
            <p className="text-sm text-secondary leading-relaxed">
              Slowly bring attention to each part of your body, from your feet to your head,
              noticing any tension and letting it release.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

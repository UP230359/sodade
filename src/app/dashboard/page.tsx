"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import SummaryCard from "@/components/dashboard/SummaryCard";

export default function DashboardPage() {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12">
      <div className="p-8 border-2 border-dashed border-neutral/30 rounded-2xl space-y-8 mt-12">
        <div>
          <h2 className="text-2xl font-bold">UI Component Testing Area</h2>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary">Modal</h3>
          <Button variant="primary" onClick={() => setIsTestModalOpen(true)}>
            Open Test Modal
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary">Inputs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="What are you feeling right now?" placeholder="I feel..." />
            <Input label="Any quick notes?" placeholder="Optional context..." type="text" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary">Button Variants</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="joy">Joy</Button>
            <Button variant="calm">Calm</Button>
            <Button variant="sadness">Sadness</Button>
            <Button variant="anger">Anger</Button>
            <Button variant="anxiety">Anxiety</Button>
            <Button variant="neutral">Neutral</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary">Full Width Buttons</h3>
          <div className="flex flex-col gap-3 max-w-md">
            <Button variant="primary" fullWidth>Save Entry</Button>
            <Button variant="neutral" fullWidth>Cancel</Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Log a New Moment"
      >
        Smth
      </Modal>

    </div>
  );
}

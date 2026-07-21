"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Textarea from "@/components/ui/Textarea";
import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function SandboxPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectOptions = [
    { value: "clinical", label: "Clinical Psychology" },
    { value: "counseling", label: "Counseling" },
    { value: "psychiatry", label: "Psychiatry" },
  ];

  return (
    <div className="min-h-screen bg-muted/20 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-serif font-medium text-foreground">UI Component Sandbox</h1>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Modals</h2>
          <Button variant="primary" onClick={() => alert("JavaScript is working!")}>
            Open Sandbox Modal
          </Button>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Card Component</h2>
          <p className="text-secondary text-sm">
            This content is wrapped inside the new Card component. It provides consistent padding, borders, and shadows.
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Badge Variants</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="joy">Joy</Badge>
            <Badge variant="calm">Calm</Badge>
            <Badge variant="sadness">Sadness</Badge>
            <Badge variant="anger">Anger</Badge>
            <Badge variant="anxiety">Anxiety</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Button Variants</h2>
          <div className="flex flex-wrap gap-4 mb-6">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="joy">Joy</Button>
            <Button variant="calm">Calm</Button>
            <Button variant="sadness">Sadness</Button>
            <Button variant="anger">Anger</Button>
            <Button variant="anxiety">Anxiety</Button>
            <Button variant="neutral">Neutral</Button>
          </div>
          <div className="flex flex-col gap-3 max-w-sm">
            <Button variant="primary" fullWidth>Full Width Primary</Button>
            <Button variant="neutral" fullWidth>Full Width Neutral</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Form Inputs</h2>
          <div className="space-y-6">
            <Input
              label="Email Address"
              placeholder="name@example.com"
              type="email"
            />

            <Select
              label="Select Specialty"
              options={selectOptions}
              defaultValue="clinical"
            />

            <Textarea
              label="Reflection Notes"
              placeholder="Type your thoughts here..."
              rows={4}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Modals</h2>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Open Sandbox Modal
          </Button>
        </Card>

      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Sandbox Modal"
      >
        <p className="text-sm text-secondary mb-6">
          This is a test modal to ensure the overlay, backdrop blur, and escape key event listeners are working properly.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="neutral" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm</Button>
        </div>
      </Modal>

    </div>
  );
}

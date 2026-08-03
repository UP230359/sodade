"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface OnboardingModalProps {
  isOpen: boolean;
  onAgree: () => void;
}

// Se abre automáticamente justo después de un registro exitoso, en vez de
// redirigir de una vez al dashboard. No se puede cerrar haciendo click afuera
// o con Escape (le pasamos un onClose vacío a Modal): aceptar el acuerdo es
// obligatorio para continuar.
export default function OnboardingModal({ isOpen, onAgree }: OnboardingModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <div className="text-center py-2">
        <h2 className="font-serif text-2xl text-foreground mb-4">
          Sacred Space Agreement
        </h2>
        <p className="text-secondary leading-relaxed mb-8">
          Your reflections are your own. By continuing, you agree that your
          emotional data may be shared completely anonymously with verified
          professionals to receive insights. Your identity is stripped and
          never revealed.
        </p>
        <Button
          onClick={onAgree}
          fullWidth
          className="!bg-foreground !text-background hover:!bg-foreground/90 !font-normal"
        >
          I Agree
        </Button>
      </div>
    </Modal>
  );
}

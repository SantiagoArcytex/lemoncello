import { useState } from 'react';
import { Square, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface StopConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (description: string) => void;
  blockName: string;
  elapsedTime: string;
  currentDescription: string;
}

export function StopConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  blockName,
  elapsedTime,
  currentDescription,
}: StopConfirmationModalProps) {
  const [description, setDescription] = useState(currentDescription);

  const handleConfirm = () => {
    onConfirm(description);
    setDescription('');
  };

  const handleClose = () => {
    setDescription(currentDescription);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Square className="h-5 w-5 text-destructive" />
            Detener {blockName}
          </DialogTitle>
          <DialogDescription>
            Has trabajado {elapsedTime}. ¿En qué estuviste trabajando?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Descripción del trabajo
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe lo que trabajaste..."
            className="w-full h-32 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            autoFocus
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            <Save className="h-4 w-4 mr-2" />
            Guardar y Detener
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

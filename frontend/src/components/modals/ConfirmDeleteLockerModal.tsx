import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type ConfirmDeleteLockerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lockerNumber: number;
};

const ConfirmDeleteLockerModal: React.FC<ConfirmDeleteLockerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  lockerNumber,
}) => {
  if (!isOpen) return null; // Ensure modal renders immediately without animations

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa tủ số {lockerNumber} không?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteLockerModal;
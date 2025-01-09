import React from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

export type BasicDialogProps = {
  dialogHeader: string;
  dialogBody: string;
  onConfirm: () => void;
  onCancel: () => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function BasicDialog({
  dialogHeader,
  dialogBody,
  onConfirm,
  onCancel,
  open,
  setOpen,
}: BasicDialogProps) {
  const handleOpen = () => setOpen(!open);

  return (
    <>
      <Dialog open={true} handler={handleOpen}>
        <DialogHeader>{dialogHeader}</DialogHeader>
        <DialogBody>{dialogBody}</DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => {
              handleOpen();
              onCancel();
            }}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={() => {
              handleOpen();
              onConfirm();
            }}
          >
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

import { useState } from "react";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

import FormAddProduct from "../../components/FormAddProduct/FormAddProduct";

function AddProductButton({ onProductAdded }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
        sx={{
          backgroundColor: "var(--main)",
          "&:hover": {
            backgroundColor: "#c39263",
          },
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 500,
          padding: "10px 18px",
          boxShadow: "none",
        }}
      >
        Adicionar Produto
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          Novo Produto
        </DialogTitle>

        <DialogContent>
          <FormAddProduct
            onClose={() => setOpen(false)}
            onProductAdded={onProductAdded}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddProductButton;

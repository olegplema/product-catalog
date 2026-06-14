import { Modal, Typography } from 'antd';

import type { Product } from '../model/product.types';

type DeleteProductDialogProps = {
  product: Product | null;
  confirmLoading: boolean;
  onCancel: () => void;
  onConfirm: (product: Product) => Promise<void>;
};

export function DeleteProductDialog({
  product,
  confirmLoading,
  onCancel,
  onConfirm,
}: DeleteProductDialogProps) {
  return (
    <Modal
      title="Delete Product"
      open={product !== null}
      onCancel={onCancel}
      onOk={() => {
        if (product) {
          void onConfirm(product);
        }
      }}
      okText="Delete"
      okButtonProps={{ className: 'button-dark' }}
      confirmLoading={confirmLoading}
      destroyOnHidden
    >
      <Typography.Paragraph style={{ marginBottom: 0 }}>
        {product
          ? `Are you sure you want to delete "${product.name}"?`
          : 'Are you sure you want to delete this product?'}
      </Typography.Paragraph>
    </Modal>
  );
}

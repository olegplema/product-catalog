import { Alert, Form, Input, Modal } from 'antd';
import { useEffect } from 'react';

import type { CreateProductRequest } from '../model/product.types';

type CreateProductDialogProps = {
  open: boolean;
  confirmLoading: boolean;
  errorMessage: string | undefined;
  onCancel: () => void;
  onSubmit: (values: CreateProductRequest) => Promise<void>;
};

type CreateProductFormValues = {
  name: string;
  description?: string;
  price: string;
};

export function CreateProductDialog({
  open,
  confirmLoading,
  errorMessage,
  onCancel,
  onSubmit,
}: CreateProductDialogProps) {
  const [form] = Form.useForm<CreateProductFormValues>();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [form, open]);

  return (
    <Modal
      title="Create Product"
      open={open}
      onCancel={onCancel}
      onOk={() => {
        void form.submit();
      }}
      confirmLoading={confirmLoading}
      okText="Create"
      okButtonProps={{ className: 'button-dark' }}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          void onSubmit({
            name: values.name.trim(),
            ...(values.description?.trim() ? { description: values.description.trim() } : {}),
            price: values.price.trim(),
          }).catch(() => undefined);
        }}
      >
        {errorMessage ? (
          <Alert className="form-error" type="error" title={errorMessage} showIcon />
        ) : null}

        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter product name' },
            { whitespace: true, message: 'Product name cannot be empty' },
          ]}
        >
          <Input maxLength={255} />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} maxLength={1000} />
        </Form.Item>

        <Form.Item
          label="Price"
          name="price"
          rules={[
            { required: true, message: 'Please enter product price' },
            {
              pattern: /^\d+(\.\d{1,2})?$/,
              message: 'Enter a valid price, for example 19.99',
            },
          ]}
        >
          <Input inputMode="decimal" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

import { Button } from 'antd';

type ProductsToolbarProps = {
  onCreateClick: () => void;
};

export function ProductsToolbar({ onCreateClick }: ProductsToolbarProps) {
  return (
    <div className="products-toolbar">
      <h1 className="products-title">Product Catalog</h1>

      <Button className="button-dark" onClick={onCreateClick}>
        Create Product
      </Button>
    </div>
  );
}

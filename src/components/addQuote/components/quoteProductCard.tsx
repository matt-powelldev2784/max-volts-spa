import type { QuoteProductInsert } from '@/types/dbTypes';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/ui/dropdown-menu';
import { EllipsisVertical, Pencil, Trash } from 'lucide-react';

type QuoteProductCardProps = {
  product: QuoteProductInsert;
  onEditProduct: () => void;
  onRemoveProduct: () => void;
  disabled?: boolean;
};
export const QuoteProductCard = ({ product, onEditProduct, onRemoveProduct, disabled }: QuoteProductCardProps) => (
  <article className="relative flex items-center justify-between bg-white border border-gray-200 rounded-xl shadow-sm pl-2 pr-4 md:pr-10 py-4 transition hover:shadow-md">
    <div className="flex flex-col items-center mr-2 md:mr-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <button className="rounded-full" aria-label="Product actions">
            <EllipsisVertical className={`h-6 w-6 md:h-8 md:w-8  ${disabled ? 'text-gray-500' : 'text-mv-orange'}`} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="right" align="center" className="p-1 min-w-[90px]">
          <div className="flex flex-col">
            <DropdownMenuItem className="flex items-center gap-5 px-4 py-2" onClick={onEditProduct}>
              <Pencil className="size-6 text-mv-orange" />
              <p className="text-xl mr-2">Edit</p>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center gap-5 px-4 py-2" onClick={onRemoveProduct}>
              <Trash className="size-6 text-mv-orange" />
              <p className="text-xl mr-2">Remove</p>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div className="flex flex-1 items-center">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-base text-gray-800 line-clamp-1 flex-3">
            {product.quantity} x {product.name}
          </span>

          <span className="text-base font-bold text-mv-orange min-w-[80px] ml-2 md:ml-4 flex justify-end flex-1">
            £ {product.total_value?.toFixed(2)}
          </span>
        </div>

        <span className="text-gray-500 text-sm italic line-clamp-2 max-w-[600px] hidden md:block">
          {product.description}
        </span>
      </div>
    </div>
  </article>
);

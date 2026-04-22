import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export function Pagination({
  page,
  onPreviousPage,
  onNextPage,
  isFirstPage,
  isLastPage,
}: PaginationProps) {
  return (
    <div className="flex justify-between mt-4">
      <Button
        onClick={onPreviousPage}
        disabled={isFirstPage}
      >
        Anterior
      </Button>
      <span className="text-sm text-gray-600 flex items-center">
        Página {page + 1}
      </span>
      <Button
        onClick={onNextPage}
        disabled={isLastPage}
      >
        Próxima
      </Button>
    </div>
  );
}

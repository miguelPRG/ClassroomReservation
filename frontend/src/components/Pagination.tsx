import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
  pageSize?: number;
}

export function Pagination({
  page,
  onPreviousPage,
  onNextPage,
  isFirstPage,
  isLastPage,
  pageSize,
}: PaginationProps) {
  return (
    <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
      <Button 
        onClick={onPreviousPage} 
        disabled={isFirstPage}
        variant="outline"
        className="gap-2"
      >
        ← Anterior
      </Button>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-muted-foreground font-medium">
          Página <span className="text-primary font-semibold">{page + 1}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          {pageSize} itens por página
        </span>
      </div>
      <Button 
        onClick={onNextPage} 
        disabled={isLastPage}
        variant="outline"
        className="gap-2"
      >
        Próxima →
      </Button>
    </div>
  );
}

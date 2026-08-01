import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
  showFirstLast = true,
}) {
  if (totalPages <= 1) return null;

  const range = (start, end) => {
    const pages = [];
    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }
    return pages;
  };

  const getVisiblePages = () => {
    const pageNeighbors = siblingCount;
    const totalPageNumbers = pageNeighbors * 2 + 3;

    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - pageNeighbors, 1);
    const rightSiblingIndex = Math.min(currentPage + pageNeighbors, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItems = range(1, 3 + pageNeighbors * 2);
      return [...leftItems, 'ellipsis-right'];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItems = range(totalPages - (2 + pageNeighbors * 2), totalPages);
      return ['ellipsis-left', ...rightItems];
    }

    const middleItems = range(leftSiblingIndex, rightSiblingIndex);
    return ['ellipsis-left', ...middleItems, 'ellipsis-right'];
  };

  const pages = getVisiblePages();

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {showFirstLast && (
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="rounded-md border border-neutral-300 p-2 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Go to first page"
        >
          <ChevronsLeft size={16} />
        </button>
      )}

      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="rounded-md border border-neutral-300 p-2 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Go to previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, index) => {
        if (page === 'ellipsis-left' || page === 'ellipsis-right') {
          return (
            <span key={`${page}-${index}`} className="px-2 text-sm text-neutral-500">
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={cn(
              'min-w-9 rounded-md px-3 py-2 text-sm font-medium transition',
              currentPage === page
                ? 'bg-neutral-900 text-white'
                : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
            )}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="rounded-md border border-neutral-300 p-2 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Go to next page"
      >
        <ChevronRight size={16} />
      </button>

      {showFirstLast && (
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="rounded-md border border-neutral-300 p-2 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Go to last page"
        >
          <ChevronsRight size={16} />
        </button>
      )}
    </nav>
  );
}

export default Pagination;

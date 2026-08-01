# Pagination Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/components/common/Pagination.jsx |
| Purpose | Reusable pagination control for tables, lists, and search results. |

## Dependencies

- React
- lucide-react for chevron icons
- clsx / tailwind-merge for class composition

## Logic Steps

1. Render nothing when there is only one page.
2. Show Previous and Next controls.
3. Build a compact page list with ellipses for large ranges.
4. Highlight the active page.
5. Call the parent page-change handler when a page is selected.

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| currentPage | number | yes | Active page index starting at 1 |
| totalPages | number | yes | Total available pages |
| onPageChange | function | yes | Callback invoked with the new page |
| siblingCount | number | no | Number of pages shown around the current page |
| className | string | no | Additional classes |
| showFirstLast | boolean | no | Whether to show first/last page shortcuts |

## API Contract

- Input: page navigation state from parent.
- Output: callback with a numeric page value.

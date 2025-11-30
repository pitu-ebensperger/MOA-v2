import PropTypes from "prop-types"
import { UnifiedDataTable } from "@/components/data-display/UnifiedDataTable.jsx"
import { Pagination } from "@/components/ui"

export function OrdersTable({
  data,
  columns,
  page,
  totalPages,
  total,
  onPageChange,
}) {
  return (
    <div className="mt-4">
      <UnifiedDataTable data={data} columns={columns} />

      <div className="mt-6">
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={typeof total === 'number' ? total : data.length}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

OrdersTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  total: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
};

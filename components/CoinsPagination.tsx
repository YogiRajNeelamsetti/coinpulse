'use client'
import page from "@/app/coins/page";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { buildPageNumbers, cn, ELLIPSIS } from "@/lib/utils";
import { useRouter } from "next/navigation";

const CoinsPagination = ({ currentPage, hasMorePages, totalPages }: Pagination ) => {
    const router = useRouter();
    const handlePageChange = (page: number) => {
        router.push(`/coins?page=${page}`);
    }
    const pageNumbers = buildPageNumbers(currentPage, totalPages);
    const ifLastPage = !hasMorePages && currentPage === totalPages;

    return (
        <Pagination id='coins-pagination'>
            <PaginationContent className="pagination-content">
                <PaginationItem className="pagination-control prev">
                    <PaginationPrevious onClick={() => {
                        currentPage > 1 && handlePageChange(currentPage - 1);
                    }} className={currentPage === 1 ? 'control-disabled' : 'control-button'} />
                </PaginationItem>
                <div className="pagination-pages">
                    {pageNumbers.map((pageNumber, index) => (
                        <PaginationItem key={index}>
                            {pageNumber === ELLIPSIS ? (
                                <span className="ellipsis">...</span> 
                            ): (
                            <PaginationLink onClick={() =>{
                                handlePageChange(pageNumber);
                            }} className={cn('page-link', {
                                'page-link-active': pageNumber === currentPage
                            })}>{pageNumber}</PaginationLink>
                            )} 
                            
                        </PaginationItem>
                    ))}
                </div>

                <PaginationItem className="pagination-control next">
                    <PaginationNext onClick={() => {
                        !ifLastPage && handlePageChange(currentPage + 1);
                    }} className={ifLastPage ? 'control-disabled' : 'control-button'} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

export default CoinsPagination

export interface Pagination {
    limitItems: number;
    currentPage: number;
    skip: number;
    totalPage: number;
}

export const objPagination = (objPagination: Partial<Pagination>, query: {page?: string}, countProduct: number) => {
    // Mặc định số sản phẩm trên mỗi trang là 5
    objPagination.limitItems = 5; 

    // Nếu có query page, lấy giá trị đó, nếu không mặc định là 1
    objPagination.currentPage = query.page ? parseInt(query.page) : 1;

    // Tính toán số sản phẩm cần bỏ qua
    objPagination.skip = (objPagination.currentPage - 1) * objPagination.limitItems;

    // Tính toán tổng số trang dựa trên tổng số sản phẩm
    const totalPage = Math.ceil(countProduct / objPagination.limitItems);
    objPagination.totalPage = totalPage;

    return objPagination as Pagination;
};

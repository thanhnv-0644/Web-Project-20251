import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../../style/adminOrderPage.css'
import Pagination from "../common/Pagination";
import ApiService from "../../service/ApiService";


const OrderStatus = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];


const AdminOrdersPage = () => {

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchStatus, setSearchStatus] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const itemsPerPage = 10;

    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchStatus, currentPage]);



    const fetchOrders = async () => {

        try {
            let response;
            if(searchStatus){
                response = await ApiService.getOrdersByStatus(searchStatus);
            }else{
                response = await ApiService.getAllOrdersNew();
            }
            const orderList = response.orderList || [];
            
            // Backend đã sort DESC rồi, giữ nguyên thứ tự (mới nhất -> cũ nhất)
            setTotalPages(Math.ceil(orderList.length/itemsPerPage));
            setOrders(orderList);
            setFilteredOrders(orderList.slice((currentPage -1) * itemsPerPage, currentPage * itemsPerPage));


        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Không thể tải danh sách đơn hàng')
            setTimeout(()=>{
                setError('')
            }, 3000)
        }
    }

    const handleFilterChange = (e) =>{
        const filterValue = e.target.value;
        setStatusFilter(filterValue)
        setCurrentPage(1);

        if (filterValue) {
            // Filter giữ nguyên thứ tự từ backend (mới nhất -> cũ nhất)
            const filtered = orders.filter(order => order.status === filterValue);
            setFilteredOrders(filtered.slice(0, itemsPerPage));
            setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        }else{
            // Không filter, hiển thị tất cả theo thứ tự từ backend
            setFilteredOrders(orders.slice(0, itemsPerPage));
            setTotalPages(Math.ceil(orders.length / itemsPerPage));
        }
    }


    const handleSearchStatusChange = async (e) => {
        setSearchStatus(e.target.value);
        setCurrentPage(1);
    }

    const handleOrderDetails = (id) => {
        navigate(`/admin/order-details/${id}`) // Sẽ tạo trang mới
    }


    return (
        <div className="admin-orders-page">
            <h2>Đơn Hàng</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="filter-container">
                <div className="statusFilter">
                    <label >Lọc theo trạng thái</label>
                    <select value={statusFilter} onChange={handleFilterChange}>
                        <option value="">Tất cả</option>
                        {OrderStatus.map(status=>(
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <div className="searchStatus">
                <label>Tìm theo trạng thái</label>
                    <select value={searchStatus} onChange={handleSearchStatusChange}>
                        <option value="">Tất cả</option>
                        {OrderStatus.map(status=>(
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>

                </div>
            </div>

            <table className="orders-table">
                <thead>
                    <tr>
                        <th>Mã đơn hàng</th>
                        <th>Khách hàng</th>
                        <th>Trạng thái</th>
                        <th>Giá</th>
                        <th>Ngày đặt</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredOrders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.user?.name || 'N/A'}</td>
                            <td>{order.status}</td>
                            <td>${order.totalPrice?.toFixed(2) || '0.00'}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td>
                                <button onClick={()=> handleOrderDetails(order.id)}>Chi tiết</button>
                            </td>
                        </tr>
                    ))}
                </tbody>

            </table>

            <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page)=> setCurrentPage(page)}/>
        </div>
    )
}

export default AdminOrdersPage;
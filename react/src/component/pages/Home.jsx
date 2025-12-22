import React, {useEffect, useState} from "react";
import { useLocation } from "react-router-dom";
import ProductList from "../common/ProductList";
import Pagination from "../common/Pagination";
import CategorySidebar from "../common/CategorySidebar";
import ApiService from "../../service/ApiService";
import '../../style/home.css';
import '../../style/snow.css';

const Home = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const itemsPerPage = 8;
    
    useEffect(() => {
    const snowContainer = document.getElementById("snow");
    if (!snowContainer) return;

    const createSnowflake = () => {
      const snowflake = document.createElement("div");
      snowflake.className = "snowflake";
      snowflake.innerText = "❄";

      snowflake.style.left = Math.random() * window.innerWidth + "px";
      snowflake.style.animationDuration = 3 + Math.random() * 5 + "s";
      snowflake.style.opacity = Math.random();
      snowflake.style.fontSize = 10 + Math.random() * 20 + "px";

      snowContainer.appendChild(snowflake);

      setTimeout(() => snowflake.remove(), 8000);
    };

    const interval = setInterval(createSnowflake, 200);

    return () => clearInterval(interval); 
  }, []);
    useEffect(()=> {

        const fetchProducts = async () => {
            try{
                let allProducts = [];
                const queryparams = new URLSearchParams(location.search);
                const searchItem = queryparams.get('search')

                if (searchItem) {
                    const response = await ApiService.searchProducts(searchItem);
                    allProducts = response.productList || [];
                }else{
                    const response = await ApiService.getAllProducts();
                    allProducts = response.productList || [];

                }

                setTotalPages(Math.ceil(allProducts.length/itemsPerPage));
                setProducts(allProducts.slice((currentPage -1) * itemsPerPage, currentPage * itemsPerPage));
               
            }catch(error){
                setError(error.response?.data?.message || error.message || 'unable to fetch products')
            }
        }

        fetchProducts();

    },[location.search, currentPage])


    return(
        <div className="home">

            <div className="home-container">
                <CategorySidebar />
                <div className="home-content">
                    {error ? (
                        <p className="error-message">{error}</p>
                    ):(
                        <div>
                            <ProductList products={products}/>
                            <Pagination  currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page)=> setCurrentPage(page)}/>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )


}

export default Home;
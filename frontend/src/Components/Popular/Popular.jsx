import React, { useEffect, useState } from "react";
import "./Popular.css";
import Item from "../Item/Item";

const Popular = (props) => {

    const [popular_product, setPopularProduct] = useState([]);

    useEffect(() => {
        fetch('http://localhost:4000/popularinwomen')
        .then((res) => res.json())
        .then((data) => setPopularProduct(data));
    }, []);

    return (
        <div className="popular">
            <h1>POPULAR IN WOMEN</h1>
            <hr/>
            <div className="popular-item">
                {popular_product.map((item, i)=>{
                    return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
                })}
            </div>
        </div>
    )
}

export default Popular;
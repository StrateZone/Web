"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";

const products = [
  {
    id: 1,
    name: "Cờ vua cao cấp",
    description: "Bộ cờ vua bằng gỗ sang trọng.",
    price: 49.99,
    url: "https://cdn.shopify.com/s/files/1/0353/9471/5692/files/components_-_PC_de061c61-3c36-4b59-84b0-8dc3ed0ac351.jpg?v=1719052879",
  },
  {
    id: 2,
    name: "Cờ tướng chuyên nghiệp",
    description: "Bàn cờ tướng chuẩn thi đấu.",
    price: 39.99,
    url: "https://phatdatbinhthoi.com.vn/upload/sanpham/co-tuong-co-hop.jpg",
  },
  {
    id: 3,
    name: "Cờ vây Nhật Bản",
    description: "Bàn cờ vây và quân đá cao cấp.",
    price: 59.99,
    url: "https://lienhiepthanh.com/wp-content/uploads/2023/05/Ban-co-Tuong-Up-Co-1.jpg",
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const numericId = Number(id); // Ép kiểu an toàn
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!isNaN(numericId)) {
      // Kiểm tra id có hợp lệ không
      const foundProduct = products.find((p) => p.id === numericId);
      setProduct(foundProduct);
    }
  }, [numericId]);

  if (!product) {
    return (
      <div className="text-center mt-10 text-xl">
        <h1> Sản phẩm không tồn tại.</h1>
      </div>
    );
  }
  return (
    <div className="p-10">
      {/* <Navbar /> */}
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <img src={product.url} alt={product.name} className="w-96 mt-5" />
      <p className="mt-3">{product.description}</p>
      <p className="mt-2 font-semibold text-lg">${product.price}</p>
    </div>
  );
}

"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { FaShoppingCart } from "react-icons/fa";
import { Button } from "@material-tailwind/react";
import { DefaultPagination } from "@/components/pagination";
import { Star, StarHalf } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  url: string;
  productImages?: { imageUrl: string }[];
}

const products: Product[] = [
  {
    id: 1,
    name: "Cờ vua cao cấp",
    description: "Bộ cờ vua bằng gỗ sang trọng.",
    price: 49.99,
    url: "https://cdn.shopify.com/s/files/1/0353/9471/5692/files/components_-_PC_de061c61-3c36-4b59-84b0-8dc3ed0ac351.jpg?v=1719052879",
    productImages: [
      {
        imageUrl:
          "https://i.pinimg.com/736x/fd/90/63/fd9063bd434e44f1aaecb64677871a87.jpg",
      },
      {
        imageUrl:
          "https://i.pinimg.com/736x/80/9c/5d/809c5d28212444fb0692f2018deda3d5.jpg",
      },
      {
        imageUrl:
          "https://i.pinimg.com/736x/fd/90/63/fd9063bd434e44f1aaecb64677871a87.jpg",
      },
      {
        imageUrl:
          "https://i.pinimg.com/736x/fd/90/63/fd9063bd434e44f1aaecb64677871a87.jpg",
      },
    ],
  },
  {
    id: 2,
    name: "Cờ tướng chuyên nghiệp",
    description: "Bàn cờ tướng chuẩn thi đấu.",
    price: 39.99,
    url: "https://phatdatbinhthoi.com.vn/upload/sanpham/co-tuong-co-hop.jpg",
    productImages: [
      {
        imageUrl:
          "https://i.pinimg.com/736x/fd/90/63/fd9063bd434e44f1aaecb64677871a87.jpg",
      },
      {
        imageUrl:
          "https://i.pinimg.com/736x/fd/90/63/fd9063bd434e44f1aaecb64677871a87.jpg",
      },
    ],
  },
  {
    id: 3,
    name: "Cờ vây Nhật Bản",
    description: "Bàn cờ vây và quân đá cao cấp.",
    price: 59.99,
    url: "https://lienhiepthanh.com/wp-content/uploads/2023/05/Ban-co-Tuong-Up-Co-1.jpg",
  },
  {
    id: 4,
    name: "Cờ caro hiện đại",
    description: "Bàn cờ caro với thiết kế mới.",
    price: 29.99,
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZgn4rfT7cBv-iUt8gR-yZDIgp8hlmx5b5fw&s",
  },
  {
    id: 5,
    name: "Cờ caro hiện đại",
    description: "Bàn cờ caro với thiết kế mới.",
    price: 29.99,
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZgn4rfT7cBv-iUt8gR-yZDIgp8hlmx5b5fw&s",
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { locale } = useParams(); // Lấy locale từ URL

  useEffect(() => {
    if (id) {
      const foundProduct = products.find((p) => p.id === Number(id));
      setProduct(foundProduct || null);
    }
  }, [id]);

  if (!product) {
    return (
      <div>
        <Navbar />
        <div className="text-center py-10">Sản phẩm không tồn tại</div>
        <Footer />
      </div>
    );
  }

  // Chuyển đổi ảnh chính
  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (product.productImages?.length || 1) - 1 : prev - 1,
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (product.productImages?.length || 1) - 1 ? 0 : prev + 1,
    );
  };

  const addToCart = () => {
    console.log(`Thêm sản phẩm "${product.name}" vào giỏ hàng.`);
  };

  // const buyNow = () => {
  //   router.push(`/orders/${product.id}`);
  // };

  return (
    <div>
      <Navbar />
      <div className="relative font-sans">
        <div className="absolute inset-0 w-full h-full bg-gray-900/60 opacity-60 z-20"></div>

        <img
          src="https://png.pngtree.com/background/20230524/original/pngtree-the-game-of-chess-picture-image_2710450.jpg"
          alt="Banner Image"
          className="absolute inset-0 w-full h-full object-cover z-10"
        />

        <div className="min-h-[350px] relative z-30 h-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
          <h2 className="sm:text-4xl text-2xl font-bold mb-6">
            Cửa hàng cờ StrateZone
          </h2>
          <p className="sm:text-lg text-base text-center text-gray-200">
            Nâng tầm chiến thuật – Trang bị như một kiện tướng!
          </p>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto p-4 relative z-30">
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-black">Thông tin sản phẩm</h1>
          <p className="text-black">Chi tiết về sản phẩm</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow-lg">
          {/* Hiển thị ảnh */}
          <div>
            <div className="relative w-full overflow-hidden">
              {product.productImages && product.productImages.length > 0 ? (
                <>
                  <div className="w-full h-[400px] flex justify-center items-center">
                    <img
                      src={product.productImages[currentImageIndex]?.imageUrl}
                      className="w-full h-full object-cover rounded-md"
                      alt="Product Image"
                    />
                  </div>
                  <button
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2"
                    onClick={previousImage}
                  >
                    &#10094;
                  </button>
                  <button
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2"
                    onClick={nextImage}
                  >
                    &#10095;
                  </button>
                </>
              ) : (
                <p className="text-center text-gray-500">Không có hình ảnh</p>
              )}
            </div>

            {/* Thumbnail */}
            <div className="flex justify-center mt-4 space-x-2">
              {product.productImages?.map((image, index) => (
                <div
                  key={index}
                  className={`w-24 h-24 cursor-pointer border-2 ${
                    index === currentImageIndex
                      ? "border-black"
                      : "border-transparent"
                  } hover:border-black`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={image.imageUrl}
                    className="w-full h-full object-cover rounded-md"
                    alt="Thumbnail"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <div className="text-black p-4">
            <h2 className="text-2xl font-semibold">{product.name}</h2>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-blue-600 font-bold mt-2">
              Giá: ${product.price}
            </p>

            {/* Nút thao tác */}
            <div className="mt-4 flex space-x-4">
              <Button className="flex items-center gap-3">
                <FaShoppingCart onClick={addToCart} /> Thêm vào giỏ hàng
              </Button>
              <Button
                onClick={() => router.push(`/${locale}/store/product_order`)}
                color="green"
              >
                Mua ngay
              </Button>
            </div>

            {/* Chọn số lượng */}
            <div className="mt-4 flex items-center space-x-1 border border-black p-1 w-[100px] justify-between rounded-md">
              <button
                className="text-black px-2 text-lg"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <input
                type="text"
                value={quantity}
                className="w-8 text-center text-sm border-none outline-none bg-transparent"
                readOnly
              />
              <button
                className="text-black px-2 text-lg"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mb-10 mt-10">
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-black">
            CÁC SẢN PHẨM LIÊN QUAN
          </h2>
        </div>

        {/* Swiper Carousel */}
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={4}
          breakpoints={{
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          navigation
          className="relative pb-6"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="bg-white shadow-md hover:shadow-lg transition rounded-md p-3 transform hover:scale-105">
                <a href={`/${locale}/store/${product.id}`} className="block">
                  <img
                    src={product.url}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-md"
                  />
                </a>
                <h3 className="text-base font-medium mt-2 text-black">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-blue-600 font-semibold mt-2 text-sm">
                  Giá: ${product.price.toFixed(2)}
                </p>

                {/* Đánh giá sao */}
                <div className="flex text-yellow-400 mt-1">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} size={14} />
                  ))}
                  <StarHalf size={14} />
                </div>

                <div className="flex gap-2 mt-3">
                  <Button className="flex items-center gap-2 text-xs px-2 py-1">
                    <FaShoppingCart size={14} /> Thêm
                  </Button>
                  <Button
                    onClick={() =>
                      router.push(`/${locale}/store/product_order`)
                    }
                    color="green"
                    className="text-xs px-2 py-1"
                  >
                    Mua ngay
                  </Button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* <div className="flex justify-center mt-8 mb-8">
          <DefaultPagination />
        </div> */}
      </div>
      <Footer />
    </div>
  );
}
